-- Enable the pgvector extension
create extension if not exists vector with schema extensions;

-- Create a table to store item embeddings
create table
  public.item_embeddings (
    id bigserial primary key,
    item_id uuid not null,
    item_type text not null,
    content text not null,
    embedding vector(1536) null
  );

-- Create a function to search for similar items
create or replace function match_items (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  id bigint,
  item_id uuid,
  item_type text,
  content text,
  similarity float
)
language sql stable
as $$
  select
    item_embeddings.id,
    item_embeddings.item_id,
    item_embeddings.item_type,
    item_embeddings.content,
    1 - (item_embeddings.embedding <=> query_embedding) as similarity
  from item_embeddings
  where 1 - (item_embeddings.embedding <=> query_embedding) > match_threshold
  order by similarity desc
  limit match_count;
$$;