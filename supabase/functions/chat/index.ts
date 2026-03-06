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
        const { session_id, message } = requestBody

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

        // 2. Vector search via RPC
        const supabaseService = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const { data: chunks, error: matchError } = await supabaseService.rpc('match_document_chunks', {
            query_embedding: normalizedEmbedding,
            match_count: 5,
            p_company_id: profile.company_id
        })

        if (matchError) throw matchError

        // 3. Format citations and context
        const contextText = (chunks || []).map((c: any) => `Document: ${c.title}\nContent: ${c.content}`).join('\n\n')
        const citations = (chunks || []).map((c: any) => ({
            document_id: c.document_id,
            chunk_id: c.id,
            title: c.title,
            snippet: c.content.substring(0, 100) + '...'
        }))

        // 4. Create prompt
        const systemPrompt = `You are a helpful AI Knowledge Copilot. Answer the user's question using ONLY the provided context. If the answer is not contained in the context, explicitly say so.
======
CONTEXT:
${contextText}
======`

        // 5. Claude call
        const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY')
        let assistantResponse = "This is a simulated AI response based on the retrieved context. Provide Anthropic API Key to see real model completions."
        let tokensIn = message.length / 4 + contextText.length / 4
        let tokensOut = assistantResponse.length / 4
        let modelUsed = 'mock-completion'

        if (anthropicApiKey) {
            modelUsed = 'claude-3-haiku-20240307'
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
                    messages: [{ role: 'user', content: message }]
                })
            })

            if (!claudeRes.ok) {
                console.error("Claude Error", await claudeRes.text())
                throw new Error("Failed to generate response via Claude")
            }

            const claudeData = await claudeRes.json()
            assistantResponse = claudeData.content[0].text
            tokensIn = claudeData.usage?.input_tokens ?? tokensIn
            tokensOut = claudeData.usage?.output_tokens ?? tokensOut
        }

        // 6. Save messages
        await supabaseService.from('chat_messages').insert({
            session_id,
            role: 'user',
            content: message
        })

        const { data: assistantMsg, error: msgError } = await supabaseService.from('chat_messages').insert({
            session_id,
            role: 'assistant',
            content: assistantResponse,
            citations
        }).select().single()

        if (msgError) throw msgError

        // Log AI Run
        await supabaseService.from('ai_runs').insert({
            company_id: profile.company_id,
            user_id: user.id,
            type: 'completion',
            model: modelUsed,
            latency_ms: Date.now() - startTime,
            tokens_in: Math.round(tokensIn),
            tokens_out: Math.round(tokensOut),
            status: 'success',
        })

        return new Response(
            JSON.stringify(assistantMsg),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
