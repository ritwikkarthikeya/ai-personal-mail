-- Required for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS vector;

-- Emails table
CREATE TABLE IF NOT EXISTS emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  gmail_id TEXT UNIQUE,
  from_email TEXT,
  subject TEXT,
  body TEXT,
  summary TEXT,
  importance TEXT,
  ai_processed BOOLEAN DEFAULT FALSE,
  is_duplicate BOOLEAN DEFAULT FALSE,
  duplicate_of UUID,
  received_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Embeddings table
CREATE TABLE IF NOT EXISTS embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  email_id UUID NOT NULL,
  embedding VECTOR(768),
  CONSTRAINT fk_email
    FOREIGN KEY (email_id)
    REFERENCES emails(id)
    ON DELETE CASCADE
);

-- Vector index
CREATE INDEX IF NOT EXISTS embeddings_vector_idx
ON embeddings
USING ivfflat (embedding vector_l2_ops)
WITH (lists = 100);

-- Gmail cursors table
CREATE TABLE IF NOT EXISTS gmail_cursors (
  user_id UUID PRIMARY KEY,
  next_page_token TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS failed_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_id UUID,
  user_id UUID,
  stage TEXT,
  error TEXT,
  failed_at TIMESTAMP DEFAULT NOW()
);
