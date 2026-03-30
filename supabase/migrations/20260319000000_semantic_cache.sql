-- Enable pgvector if not already enabled (should be from previous migrations, but safe to include)
CREATE EXTENSION IF NOT EXISTS vector;

-- Create the semantic_cache table
CREATE TABLE IF NOT EXISTS public.query_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL, -- To respect tenant boundaries
    query_text TEXT NOT NULL,
    query_embedding vector(1536) NOT NULL, -- text-embedding-3-small generates 1536 dims
    assistant_response TEXT NOT NULL,
    citations JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster vector similarity searches
CREATE INDEX ON public.query_cache USING hnsw (query_embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Enforce Row Level Security
ALTER TABLE public.query_cache ENABLE ROW LEVEL SECURITY;

-- Assuming a function get_current_user_company_id() exists as per README, but 
-- edge functions using service role will bypass RLS anyway. 
-- For safety, we add a general policy if accessed from client (though it shouldn't be).
CREATE POLICY "Service Role can manage query_cache" ON public.query_cache
    USING (true)
    WITH CHECK (true);

-- Create RPC to match cached query
CREATE OR REPLACE FUNCTION match_cached_query(
    query_embedding vector(1536),
    match_threshold float,
    p_company_id uuid
)
RETURNS TABLE (
    id uuid,
    query_text text,
    assistant_response text,
    citations jsonb,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        qc.id,
        qc.query_text,
        qc.assistant_response,
        qc.citations,
        1 - (qc.query_embedding <=> match_cached_query.query_embedding) AS similarity
    FROM public.query_cache qc
    WHERE qc.company_id = p_company_id
      AND 1 - (qc.query_embedding <=> match_cached_query.query_embedding) > match_threshold
    ORDER BY qc.query_embedding <=> match_cached_query.query_embedding
    LIMIT 1;
END;
$$;
