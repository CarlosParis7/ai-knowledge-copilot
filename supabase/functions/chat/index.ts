import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    const startTime = Date.now();

    try {
        const authHeader = req.headers.get('Authorization')!
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } }
        )

        const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
        if (userError || !user) throw new Error('Unauthorized')

        const requestBody = await req.json()
        const { session_id, message, web_search = false } = requestBody

        if (!session_id || !message) throw new Error('Missing session_id or message')

        const { data: profile } = await supabaseClient.from('profiles').select('company_id').eq('user_id', user.id).single()
        if (!profile) throw new Error('Profile not found')

        // 1. Generate embedding for user query
        const openAiKey = Deno.env.get('OPENAI_API_KEY')
        let normalizedEmbedding: number[] = []

        if (openAiKey) {
            const embedRes = await fetch('https://api.openai.com/v1/embeddings', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${openAiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ input: message, model: 'text-embedding-3-small' })
            })
            if (!embedRes.ok) throw new Error("Failed to generate query embedding via OpenAI")
            const embedData = await embedRes.json()
            normalizedEmbedding = embedData.data[0].embedding
        } else {
            // Mock Generate embedding for user query
            const mockEmbedding = Array(1536).fill(0).map(() => Math.random() * 2 - 1)
            const length = Math.sqrt(mockEmbedding.reduce((sum, val) => sum + val * val, 0))
            normalizedEmbedding = mockEmbedding.map(v => v / length)
        }

        const supabaseService = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 2. Check Semantic Cache
        const { data: cacheMatch, error: cacheMatchError } = await supabaseService.rpc('match_cached_query', {
            query_embedding: normalizedEmbedding,
            match_threshold: 0.95, // 95% similarity threshold
            p_company_id: profile.company_id
        });

        // Save User Message to DB
        await supabaseService.from('chat_messages').insert({
            session_id,
            role: 'user',
            content: message
        });

        // IF CACHE HIT, RETURN JSON
        if (!cacheMatchError && cacheMatch && cacheMatch.length > 0) {
            const hit = cacheMatch[0];
            
            // Log AI Run for cache hit
            await supabaseService.from('ai_runs').insert({
                company_id: profile.company_id,
                user_id: user.id,
                type: 'cache_hit',
                model: 'semantic_cache',
                latency_ms: Date.now() - startTime,
                status: 'success',
            });

            const { data: assistantMsg, error: msgError } = await supabaseService.from('chat_messages').insert({
                session_id,
                role: 'assistant',
                content: hit.assistant_response,
                citations: hit.citations
            }).select().single();

            if (msgError) throw msgError;

            // Mark response as cached for frontend UI badge
            assistantMsg.is_cached = true;

            return new Response(
                JSON.stringify(assistantMsg),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
            )
        }

        // 3. Vector search via RPC
        const { data: chunks, error: matchError } = await supabaseService.rpc('match_document_chunks', {
            query_embedding: normalizedEmbedding,
            match_count: 5,
            p_company_id: profile.company_id
        })

        if (matchError) throw matchError

        // 4. Format citations and context
        const contextText = (chunks || []).map((c: any) => `Document: ${c.title}\nContent: ${c.content}`).join('\n\n')
        const citations = (chunks || []).map((c: any) => ({
            document_id: c.document_id,
            chunk_id: c.id,
            title: c.title,
            snippet: c.content.substring(0, 100) + '...'
        }))

        // When web_search is on, allow general knowledge as a fallback but keep it clearly separated
        // from cited internal context. (A live web API can be wired here later.)
        const sourcingRule = web_search
            ? `Answer primarily from the provided context and cite it. If the context is insufficient, you may add general knowledge, but clearly label it as not sourced from internal documents.`
            : `Answer the user's question using ONLY the provided context. If the answer is not contained in the context, explicitly say so.`

        const systemPrompt = `You are Atlas Copilot, a helpful enterprise knowledge assistant. ${sourcingRule}
======
CONTEXT:
${contextText}
======`

        // 5. Claude call - Streaming
        const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY')

        if (!anthropicApiKey) {
             // Mock JSON response
             const mockText = "This is a simulated AI response based on the retrieved context. Provide Anthropic API Key for real model completions.";
             const { data: assistantMsg } = await supabaseService.from('chat_messages').insert({
                session_id, role: 'assistant', content: mockText, citations
             }).select().single();
             return new Response(JSON.stringify(assistantMsg), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
        }

        const modelUsed = 'claude-3-haiku-20240307';
        const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-api-key': anthropicApiKey,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                model: modelUsed,
                max_tokens: 1024,
                system: systemPrompt,
                messages: [{ role: 'user', content: message }],
                stream: true
            })
        });

        if (!claudeRes.ok) {
            console.error("Claude Error", await claudeRes.text())
            throw new Error("Failed to generate response via Claude")
        }

        // 6. Return Streaming Response and background save
        // We set up a TransformStream to intercept the text and send it to the client, 
        // while accumulating it to save to the database when finished.
        
        let assistantContent = "";
        let tokensIn = message.length / 4 + contextText.length / 4;
        let tokensOut = 0;

        const stream = new TransformStream({
            async transform(chunk, controller) {
                controller.enqueue(chunk);
                // Try to parse the SSE
                const text = new TextDecoder().decode(chunk);
                const lines = text.split('\n');
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const dataStr = line.replace('data: ', '').trim();
                        if (dataStr === '[DONE]') continue;
                        try {
                            const event = JSON.parse(dataStr);
                            if (event.type === 'content_block_delta' && event.delta?.text) {
                                assistantContent += event.delta.text;
                            } else if (event.type === 'message_start' && event.message?.usage) {
                                tokensIn = event.message.usage.input_tokens;
                            } else if (event.type === 'message_delta' && event.usage) {
                                tokensOut = event.usage.output_tokens;
                            }
                        } catch (e) {
                            // ignore json parse errors on incomplete chunks
                        }
                    }
                }
            },
            async flush() {
                // Save to DB when stream completes
                const { data: assistantMsg } = await supabaseService.from('chat_messages').insert({
                    session_id,
                    role: 'assistant',
                    content: assistantContent,
                    citations
                }).select().single();

                await supabaseService.from('query_cache').insert({
                    company_id: profile.company_id,
                    query_text: message,
                    query_embedding: normalizedEmbedding,
                    assistant_response: assistantContent,
                    citations
                });

                await supabaseService.from('ai_runs').insert({
                    company_id: profile.company_id,
                    user_id: user.id,
                    type: 'completion',
                    model: modelUsed,
                    latency_ms: Date.now() - startTime,
                    tokens_in: Math.round(tokensIn),
                    tokens_out: Math.round(tokensOut),
                    status: 'success',
                });
                
                // Send final custom event to pass citations back to frontend
                const finalEvent = `data: ${JSON.stringify({ type: 'citations_and_finalize', citations })}\n\n`;
                // Not returning it in stream directly to avoid breaking naive parsers, 
                // but we can pass it as a special event type in the SSE stream
                const encoder = new TextEncoder();
                const controller = new ReadableStreamDefaultController();
                // actually we are in transform stream flush, we can enqueue
                // controller isn't accessible directly here, we use a different approach or ignore sending citations over stream.
                // Wait, it's easier to just use the citations fetched previously if we have them, or send them at the end.
            }
        });

        // We will send citations as a special header or initial event.
        // Actually, the easiest way to send citations and stream is to send a custom event.
        // Let's modify the flush to send it!
        
        const finalStream = new ReadableStream({
            async start(controller) {
                // Send citations first
                const initEvent = `data: ${JSON.stringify({ type: 'metadata', citations })}\n\n`;
                controller.enqueue(new TextEncoder().encode(initEvent));
                
                const reader = claudeRes.body?.getReader();
                if (!reader) {
                    controller.close();
                    return;
                }

                try {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;
                        
                        // Pass raw Claude SSE chunk to client
                        controller.enqueue(value);
                        
                        // Intercept text for DB
                        const text = new TextDecoder().decode(value);
                        const lines = text.split('\n');
                        for (const line of lines) {
                            if (line.startsWith('data: ')) {
                                const dataStr = line.replace('data: ', '').trim();
                                if (dataStr === '[DONE]') continue;
                                try {
                                    const event = JSON.parse(dataStr);
                                    if (event.type === 'content_block_delta' && event.delta?.text) {
                                        assistantContent += event.delta.text;
                                    } else if (event.type === 'message_start' && event.message?.usage) {
                                        tokensIn = event.message.usage.input_tokens;
                                    } else if (event.type === 'message_delta' && event.usage) {
                                        tokensOut = event.usage.output_tokens;
                                    }
                                } catch (e) {
                                    // ignore json parse errors
                                }
                            }
                        }
                    }
                } finally {
                    try {
                        // After stream completes, save to DB
                        await supabaseService.from('chat_messages').insert({
                            session_id, role: 'assistant', content: assistantContent, citations
                        });

                        await supabaseService.from('query_cache').insert({
                            company_id: profile.company_id, query_text: message, query_embedding: normalizedEmbedding, assistant_response: assistantContent, citations
                        });

                        await supabaseService.from('ai_runs').insert({
                            company_id: profile.company_id, user_id: user.id, type: 'completion', model: modelUsed, latency_ms: Date.now() - startTime, tokens_in: Math.round(tokensIn), tokens_out: Math.round(tokensOut), status: 'success',
                        });
                    } catch (e) { console.error("DB Save Error:", e); }
                    
                    controller.close();
                }
            }
        });

        return new Response(finalStream, {
            headers: {
                ...corsHeaders,
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
            status: 200
        });

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
