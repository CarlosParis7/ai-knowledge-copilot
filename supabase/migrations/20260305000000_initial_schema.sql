-- Enable pgvector plugin
create extension if not exists vector
with
  schema extensions;

-- Create companies table
create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create profiles table
create table public.profiles (
  user_id uuid primary key references auth.users on delete cascade,
  company_id uuid references public.companies(id) on delete set null,
  role text not null check (role in ('admin', 'member')),
  name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create documents table
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade not null,
  title text not null,
  storage_path text not null,
  mime text not null,
  status text not null check (status in ('uploaded', 'processing', 'indexed', 'error')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create document_chunks table with vector embedding
create table public.document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references public.documents(id) on delete cascade not null,
  company_id uuid references public.companies(id) on delete cascade not null,
  chunk_index integer not null,
  content text not null,
  embedding extensions.vector(1536), -- using 1536 dimensions for standard embeddings (e.g., OpenAI/text-embedding-3-small)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create chat_sessions table
create table public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade not null,
  user_id uuid references public.profiles(user_id) on delete cascade not null,
  title text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create chat_messages table
create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.chat_sessions(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  citations jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create ai_runs table for telemetry
create table public.ai_runs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade not null,
  user_id uuid references public.profiles(user_id) on delete set null,
  type text not null, -- e.g., 'embedding', 'completion'
  model text,
  latency_ms integer,
  tokens_in integer,
  tokens_out integer,
  status text not null check (status in ('success', 'error')),
  error text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for performance and vector search
create index idx_profiles_company_id on public.profiles(company_id);
create index idx_documents_company_id on public.documents(company_id);
create index idx_document_chunks_company_id on public.document_chunks(company_id);
create index idx_document_chunks_document_id on public.document_chunks(document_id);
create index idx_chat_sessions_company_id on public.chat_sessions(company_id);
create index idx_chat_sessions_user_id on public.chat_sessions(user_id);
create index idx_chat_messages_session_id on public.chat_messages(session_id);

-- Create a vector index using HNSW for faster similarity search
create index idx_document_chunks_embedding on public.document_chunks
using hnsw (embedding vector_cosine_ops);

-- Turn on RLS
alter table public.companies enable row level security;
alter table public.profiles enable row level security;
alter table public.documents enable row level security;
alter table public.document_chunks enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;
alter table public.ai_runs enable row level security;

-- Function to get the current user's company_id
create or replace function public.get_current_user_company_id()
returns uuid as $$
  select company_id from public.profiles where user_id = auth.uid();
$$ language sql stable security definer;

-- Profiles RLS
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = user_id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = user_id);

-- Companies RLS
create policy "Users can view their own company"
  on public.companies for select
  using (id = public.get_current_user_company_id());

-- Documents RLS
create policy "Users can view documents from their company"
  on public.documents for select
  using (company_id = public.get_current_user_company_id());

-- Edge functions usually run with a service role, so they will bypass RLS for inserting/updating documents.
-- If we want users to insert documents directly via client, we'd add an insert policy.
create policy "Users can insert documents for their company"
  on public.documents for insert
  with check (company_id = public.get_current_user_company_id());

create policy "Users can update documents for their company"
  on public.documents for update
  using (company_id = public.get_current_user_company_id());

-- Document Chunks RLS
create policy "Users can view chunks from their company"
  on public.document_chunks for select
  using (company_id = public.get_current_user_company_id());

-- Edge functions will insert chunks using service role.

-- Chat Sessions RLS
create policy "Users can view their own sessions"
  on public.chat_sessions for select
  using (user_id = auth.uid());

create policy "Users can insert their own sessions"
  on public.chat_sessions for insert
  with check (user_id = auth.uid() and company_id = public.get_current_user_company_id());

-- Chat Messages RLS
create policy "Users can view messages of their sessions"
  on public.chat_messages for select
  using (
    session_id in (
      select id from public.chat_sessions where user_id = auth.uid()
    )
  );

create policy "Users can insert messages into their sessions"
  on public.chat_messages for insert
  with check (
    session_id in (
      select id from public.chat_sessions where user_id = auth.uid()
    )
  );

-- AI Runs RLS
create policy "Users can view their own ai runs"
  on public.ai_runs for select
  using (user_id = auth.uid());

-- Storage Bucket setup
insert into storage.buckets (id, name, public) 
values ('documents', 'documents', false)
on conflict (id) do nothing;

create policy "Users can view their company documents in storage"
  on storage.objects for select
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = public.get_current_user_company_id()::text
  );

create policy "Users can upload documents for their company"
  on storage.objects for insert
  with check (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = public.get_current_user_company_id()::text
  );
