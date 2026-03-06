-- Function to perform vector search on document_chunks
create or replace function public.match_document_chunks(
  query_embedding vector(1536),
  match_count int default 5,
  p_company_id uuid default null
)
returns table (
  id uuid,
  document_id uuid,
  content text,
  similarity float,
  title text
)
language sql stable
as $$
  select
    dc.id,
    dc.document_id,
    dc.content,
    1 - (dc.embedding <=> query_embedding) as similarity,
    d.title
  from public.document_chunks dc
  join public.documents d on d.id = dc.document_id
  where (p_company_id is null or dc.company_id = p_company_id)
  order by dc.embedding <=> query_embedding
  limit match_count;
$$;
