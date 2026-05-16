import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS polls (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(500) NOT NULL,
        description TEXT,
        is_anonymous BOOLEAN DEFAULT true,
        expires_at TIMESTAMPTZ,
        is_published BOOLEAN DEFAULT false,
        is_closed BOOLEAN DEFAULT false,
        share_token VARCHAR(64) UNIQUE NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS questions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
        text VARCHAR(1000) NOT NULL,
        is_mandatory BOOLEAN DEFAULT true,
        order_index INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS options (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
        text VARCHAR(500) NOT NULL,
        order_index INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS responses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
        respondent_id UUID REFERENCES users(id) ON DELETE SET NULL,
        respondent_name VARCHAR(255),
        submitted_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS answers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        response_id UUID REFERENCES responses(id) ON DELETE CASCADE,
        question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
        option_id UUID REFERENCES options(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_polls_share_token ON polls(share_token);
      CREATE INDEX IF NOT EXISTS idx_questions_poll_id ON questions(poll_id);
      CREATE INDEX IF NOT EXISTS idx_options_question_id ON options(question_id);
      CREATE INDEX IF NOT EXISTS idx_responses_poll_id ON responses(poll_id);
      CREATE INDEX IF NOT EXISTS idx_answers_response_id ON answers(response_id);
    `);
    console.log(' Database schema initialized');
  } finally {
    client.release();
  }
}
