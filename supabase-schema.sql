-- Supabase Database Schema for Sermon Storage & Vector Search
-- Run this SQL in your Supabase SQL Editor

-- Enable the pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Create sermons table
CREATE TABLE IF NOT EXISTS sermons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    date DATE,
    scripture_reference TEXT,
    content TEXT NOT NULL,
    summary TEXT,
    topics TEXT[], -- Array of topic tags
    series TEXT,
    file_url TEXT, -- URL to original file in storage
    embedding vector(1536), -- OpenAI ada-002 embeddings (1536 dimensions)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for vector similarity search (using cosine distance)
CREATE INDEX IF NOT EXISTS sermons_embedding_idx
ON sermons
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create index for text search
CREATE INDEX IF NOT EXISTS sermons_content_search_idx
ON sermons
USING gin(to_tsvector('english', content));

-- Create index for topics
CREATE INDEX IF NOT EXISTS sermons_topics_idx
ON sermons
USING gin(topics);

-- Create index for date sorting
CREATE INDEX IF NOT EXISTS sermons_date_idx
ON sermons(date DESC);

-- Create a function to search sermons by semantic similarity
CREATE OR REPLACE FUNCTION match_sermons(
    query_embedding vector(1536),
    match_threshold float DEFAULT 0.7,
    match_count int DEFAULT 5
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    date DATE,
    scripture_reference TEXT,
    content TEXT,
    summary TEXT,
    topics TEXT[],
    series TEXT,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        sermons.id,
        sermons.title,
        sermons.date,
        sermons.scripture_reference,
        sermons.content,
        sermons.summary,
        sermons.topics,
        sermons.series,
        1 - (sermons.embedding <=> query_embedding) AS similarity
    FROM sermons
    WHERE 1 - (sermons.embedding <=> query_embedding) > match_threshold
    ORDER BY sermons.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_sermons_updated_at
    BEFORE UPDATE ON sermons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE sermons ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access"
    ON sermons
    FOR SELECT
    TO public
    USING (true);

-- Create policy to allow authenticated insert/update/delete
-- (You'll want to restrict this to admin users only)
CREATE POLICY "Allow service role full access"
    ON sermons
    FOR ALL
    TO service_role
    USING (true);

-- Create storage bucket for sermon files
INSERT INTO storage.buckets (id, name, public)
VALUES ('sermons', 'sermons', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for sermon files
CREATE POLICY "Allow public read access to sermons"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'sermons');

CREATE POLICY "Allow service role upload to sermons"
    ON storage.objects
    FOR INSERT
    TO service_role
    WITH CHECK (bucket_id = 'sermons');

-- Sample query to test vector search (after you have data):
-- SELECT * FROM match_sermons(
--     (SELECT embedding FROM sermons LIMIT 1),
--     0.7,
--     5
-- );
