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

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            {
                global: {
                    headers: { Authorization: req.headers.get('Authorization')! },
                },
            }
        )

        const userResp = await supabaseClient.auth.getUser()
        if (userResp.error) throw new Error('Unauthorized')

        const { filename, title, mime } = await req.json()
        if (!filename || !title || !mime) {
            throw new Error('Missing parameters')
        }

        // Get company_id of user
        const { data: profile } = await supabaseClient
            .from('profiles')
            .select('company_id')
            .eq('user_id', userResp.data.user.id)
            .single()

        if (!profile?.company_id) throw new Error('No company assigned')

        const company_id = profile.company_id

        // Create document row
        const { data: doc, error: insertError } = await supabaseClient
            .from('documents')
            .insert({
                company_id,
                title,
                status: 'uploaded',
                mime,
                storage_path: 'pending', // update later
            })
            .select()
            .single()

        if (insertError) throw insertError

        const storage_path = `${company_id}/${doc.id}/${filename}`

        // Update path
        await supabaseClient
            .from('documents')
            .update({ storage_path })
            .eq('id', doc.id)

        // Generate signed upload url
        const { data: uploadData, error: uploadError } = await supabaseClient
            .storage
            .from('documents')
            .createSignedUploadUrl(storage_path)

        if (uploadError) throw uploadError

        return new Response(
            JSON.stringify({
                document_id: doc.id,
                signed_url: uploadData.signedUrl,
                storage_path
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
