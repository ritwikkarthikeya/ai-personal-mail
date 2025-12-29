# 🧠 AI Secretary – Intelligent Email Assistant

AI Secretary is a **privacy-first, AI-powered personal email intelligence system** that connects to Gmail, ingests emails, summarizes them using **local LLMs**, generates semantic embeddings, and allows users to query their inbox using **natural language**.

The system is designed with **production-grade backend architecture**, **secure OAuth handling**, **fault-tolerant background jobs**, and **local AI inference** — ensuring **no data leakage and zero API costs**.

---

## ✨ Key Features

- 🔐 Google OAuth 2.0 authentication
- 📩 Gmail email ingestion with cursor-based pagination
- 🧠 AI-powered email summarization
- 🚦 Importance classification (low / medium / high)
- 🔍 Vector embeddings for semantic search
- 💬 Ask Assistant – query emails using natural language
- 🔁 Retry-safe background jobs
- 🔒 Database-level job locking
- ⏰ Cron-based processing
- 🧩 Modular and scalable backend architecture

---

## 🧱 Tech Stack

### Frontend
- React + Vite
- React Router
- JWT-based authentication
- Fetch API

### Backend
- Node.js (ES Modules)
- Express
- PostgreSQL
- node-cron
- Google Gmail API
- JSON Web Tokens (JWT)

### AI / ML
- **Ollama** – local LLM runtime
- **Mistral** – email summarization & classification
- **nomic-embed-text** – 768-dimensional embeddings
- **pgvector** – vector similarity search

---

## 🗂️ Project Structure

ai-personal-mail/
├── ai-secretary-backend/
│ ├── src/
│ │ ├── modules/
│ │ │ ├── auth/ # Google OAuth & JWT logic
│ │ │ ├── emails/ # Email ingestion & queries
│ │ │ ├── gmail/ # Gmail API interaction
│ │ │ ├── ai/ # AI summarization & embeddings
│ │ ├── config/ # Env, DB, Google config
│ │ ├── utils/ # Scheduler & helpers
│ │ ├── server.js
│ ├── .env
│ └── package.json
│
├── frontend/
│ ├── src/
│ │ ├── pages/
│ │ ├── components/
│ │ ├── services/
│ └── package.json

pgsql
Copy code

---

## 🗄️ Database Schema

### users
Stores authenticated users and their Gmail refresh tokens.

 
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  google_refresh_token TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

gmail_cursors
Tracks Gmail pagination state per user.
 
CREATE TABLE gmail_cursors (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  next_page_token TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

emails
Stores ingested Gmail emails.

CREATE TABLE emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  gmail_id TEXT UNIQUE,
  subject TEXT,
  from_email TEXT,
  body TEXT,
  summary TEXT,
  importance TEXT,
  ai_processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
embeddings
Stores vector embeddings for semantic search.
 
CREATE TABLE embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  email_id UUID REFERENCES emails(id) ON DELETE CASCADE,
  embedding VECTOR(768)
);

🔄 System Workflow (End-to-End)
1️⃣ Authentication
User logs in with Google

Backend receives OAuth code

Exchanges code for access + refresh tokens

Stores refresh token securely

Issues JWT to frontend

2️⃣ Gmail Ingestion
Triggered after login or via cron

Uses refresh token to access Gmail API

Fetches emails in small batches

Cursor-based pagination

Deduplication using gmail_id

Emails stored in PostgreSQL

3️⃣ AI Processing
For each unprocessed email:

Structured prompt sent to local LLM

Strict JSON response enforced

Summary & importance saved

Embeddings generated

Vector stored in pgvector

Failures are non-blocking and safely logged.

4️⃣ Ask Assistant
User query → embedding generated

Vector similarity search performed

Relevant emails retrieved

Context passed to LLM

Natural language answer returned

⏰ Background Jobs & Safety
Cron jobs run every 5 minutes

Uses FOR UPDATE SKIP LOCKED

Prevents duplicate processing

Safe for horizontal scaling

Can be disabled using DISABLE_CRON=true

🧪 Local Development
Backend
bash
Copy code
cd ai-secretary-backend
npm install
npm run dev
Frontend
bash
Copy code
cd frontend
npm install
npm run dev
Ollama
bash
Copy code
ollama serve
ollama pull mistral
ollama pull nomic-embed-text
