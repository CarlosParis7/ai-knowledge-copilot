import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper: Naive text chunking
function chunkText(text: string, chunkSize = 1000, overlap = 200) {
    const chunks = []
    let startIndex = 0
    while (startIndex < text.length) {
        const endIndex = Math.min(startIndex + chunkSize, text.length)
        chunks.push(text.slice(startIndex, endIndex))
        startIndex += chunkSize - overlap
    }
    return chunks
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    const startTime = Date.now();

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const authHeader = req.headers.get('Authorization')!
        const { data: { user }, error: userError } = await createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } }
        ).auth.getUser()

        if (userError || !user) throw new Error('Unauthorized')

        const { document_id } = await req.json()
        if (!document_id) throw new Error('Missing document_id')

        // 1. Fetch document metadata
        const { data: doc, error: docError } = await supabaseClient
            .from('documents')
            .select('*')
            .eq('id', document_id)
            .single()

        if (docError || !doc) throw new Error('Document not found')

        await supabaseClient.from('documents').update({ status: 'processing' }).eq('id', document_id)

        // 2. Download from storage
        const { data: fileData, error: downloadError } = await supabaseClient
            .storage
            .from('documents')
            .download(doc.storage_path)

        if (downloadError || !fileData) throw new Error('Failed to download document')

        const text = await fileData.text()

        // 3. Chunk text
        const chunks = chunkText(text)
        if (chunks.length === 0) throw new Error('Document is empty')

        // 4. Generate Embeddings 
        const openAiKey = Deno.env.get('OPENAI_API_KEY')
        let embeddings: number[][] = []
        let modelUsed = 'mock-embedding-3'
        let tokensUsed = text.length / 4 // rough estimate

        if (openAiKey) {
            modelUsed = 'text-embedding-3-small'
            const res = await fetch('https://api.openai.com/v1/embeddings', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${openAiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ input: chunks, model: modelUsed })
            })

            if (!res.ok) {
                console.error("OpenAI Error:", await res.text())
                throw new Error("Failed to generate embeddings via OpenAI")
            }

            const openAiData = await res.json()
            embeddings = openAiData.data.map((item: any) => item.embedding)
            tokensUsed = openAiData.usage.total_tokens
        } else {
            console.warn("OPENAI_API_KEY not found. Falling back to mock embeddings.")
            // Generate mock embeddings for each chunk
            embeddings = chunks.map(() => {
                const mockObj = Array(1536).fill(0).map(() => Math.random() * 2 - 1)
                const length = Math.sqrt(mockObj.reduce((sum, val) => sum + val * val, 0))
                return mockObj.map(v => v / length)
            })
        }

        const chunkRows = chunks.map((content, index) => ({
            document_id,
            company_id: doc.company_id,
            chunk_index: index,
            content,
            embedding: embeddings[index]
        }))

        // 5. Insert to DB
        const { error: insertError } = await supabaseClient
            .from('document_chunks')
            .insert(chunkRows)

        if (insertError) throw insertError

        // 6. Update document status
        await supabaseClient.from('documents').update({ status: 'indexed' }).eq('id', document_id)

        // Log AI Run
        await supabaseClient.from('ai_runs').insert({
            company_id: doc.company_id,
            user_id: user.id,
            type: 'embedding',
            model: modelUsed,
            status: 'success',
            tokens_in: Math.round(tokensUsed),
            tokens_out: 0,
            latency_ms: Date.now() - startTime
        })

        return new Response(
            JSON.stringify({ success: true, chunksProcessed: chunks.length }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error: any) {
        // Log AI Run Error if possible
        const { document_id } = await req.json().catch(() => ({}))
        const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '')

        if (document_id) {
            await supabase.from('documents').update({ status: 'error' }).eq('id', document_id)
        }

        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
