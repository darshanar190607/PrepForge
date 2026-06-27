import { pool } from './client';
import * as dotenv from 'dotenv';
dotenv.config();

async function migrate() {
  console.log('🔧 Running migrations...');
  try {
    // Add missing columns to existing users table
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS department VARCHAR(100) DEFAULT 'CCE';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS year VARCHAR(10) DEFAULT '3rd';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS streak INTEGER DEFAULT 0;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS total_score FLOAT DEFAULT 0;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS accuracy FLOAT DEFAULT 0;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS badges JSONB DEFAULT '[]';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS join_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';
    `);
    console.log('✅ users table migrated');

    // Create new quiz tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS quizzes (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        time_limit INTEGER NOT NULL DEFAULT 30,
        start_time TIMESTAMP WITH TIME ZONE,
        end_time TIMESTAMP WITH TIME ZONE,
        marks_per_question FLOAT DEFAULT 1,
        negative_marks FLOAT DEFAULT 0,
        shuffle_questions BOOLEAN DEFAULT true,
        shuffle_options BOOLEAN DEFAULT true,
        max_attempts INTEGER DEFAULT 1,
        quiz_type VARCHAR(50) DEFAULT 'practice',
        subject VARCHAR(100),
        status VARCHAR(50) DEFAULT 'draft',
        created_by VARCHAR(100) REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ quizzes table ready');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id VARCHAR(100) PRIMARY KEY,
        quiz_id VARCHAR(100) REFERENCES quizzes(id) ON DELETE CASCADE,
        question_text TEXT NOT NULL,
        options JSONB NOT NULL DEFAULT '[]',
        correct_answer VARCHAR(10) NOT NULL,
        difficulty VARCHAR(50) DEFAULT 'Medium',
        subject VARCHAR(100),
        topic VARCHAR(100),
        weightage FLOAT DEFAULT 1,
        position INTEGER DEFAULT 0
      );
    `);
    console.log('✅ questions table ready');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS quiz_attempts (
        id VARCHAR(100) PRIMARY KEY,
        quiz_id VARCHAR(100) REFERENCES quizzes(id) ON DELETE CASCADE,
        user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
        started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        submitted_at TIMESTAMP WITH TIME ZONE,
        score FLOAT DEFAULT 0,
        total_marks FLOAT DEFAULT 0,
        accuracy FLOAT DEFAULT 0,
        time_taken INTEGER DEFAULT 0,
        correct_count INTEGER DEFAULT 0,
        wrong_count INTEGER DEFAULT 0,
        skipped_count INTEGER DEFAULT 0,
        status VARCHAR(50) DEFAULT 'in_progress',
        question_order JSONB DEFAULT '[]'
      );
    `);
    console.log('✅ quiz_attempts table ready');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS question_responses (
        id VARCHAR(100) PRIMARY KEY,
        attempt_id VARCHAR(100) REFERENCES quiz_attempts(id) ON DELETE CASCADE,
        question_id VARCHAR(100) REFERENCES questions(id) ON DELETE CASCADE,
        selected_answer VARCHAR(10),
        is_correct BOOLEAN DEFAULT false,
        marks_awarded FLOAT DEFAULT 0,
        time_spent INTEGER DEFAULT 0,
        flagged_for_review BOOLEAN DEFAULT false,
        answered_at TIMESTAMP WITH TIME ZONE,
        CONSTRAINT uq_response_attempt_question UNIQUE (attempt_id, question_id)
      );
    `);
    console.log('✅ question_responses table ready');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS ai_explanations (
        id VARCHAR(100) PRIMARY KEY,
        question_id VARCHAR(100) REFERENCES questions(id) ON DELETE CASCADE UNIQUE,
        why_correct TEXT,
        why_options_wrong JSONB DEFAULT '{}',
        interview_concepts TEXT,
        short_explanation TEXT,
        reference_topic TEXT,
        interview_frequency VARCHAR(50),
        memory_trick TEXT,
        generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ ai_explanations table ready');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id VARCHAR(100) PRIMARY KEY,
        user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        type VARCHAR(50) NOT NULL DEFAULT 'general',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        read BOOLEAN DEFAULT FALSE
      );
    `);
    console.log('✅ notifications table ready');

    // Indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_questions_quiz_id ON questions(quiz_id);
      CREATE INDEX IF NOT EXISTS idx_attempts_quiz_user ON quiz_attempts(quiz_id, user_id);
      CREATE INDEX IF NOT EXISTS idx_attempts_user ON quiz_attempts(user_id);
      CREATE INDEX IF NOT EXISTS idx_responses_attempt ON question_responses(attempt_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
    `);
    console.log('✅ indexes created');

    console.log('\n🎉 Migration complete!');
  } catch (e: any) {
    console.error('❌ Migration error:', e.message);
  } finally {
    await pool.end();
  }
}

migrate();
