-- ============================================================
-- PrepForge Quiz Platform — Database Schema
-- ============================================================

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'student', -- 'admin' or 'student'
    department VARCHAR(100) DEFAULT 'CCE',
    year VARCHAR(10) DEFAULT '3rd',
    avatar_url TEXT,
    streak INTEGER DEFAULT 0,
    total_score FLOAT DEFAULT 0,
    accuracy FLOAT DEFAULT 0,
    badges JSONB DEFAULT '[]'::jsonb,
    join_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending' -- 'active' or 'pending'
);

-- Quizzes Table
CREATE TABLE IF NOT EXISTS quizzes (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    time_limit INTEGER NOT NULL DEFAULT 30, -- minutes
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    marks_per_question FLOAT DEFAULT 1,
    negative_marks FLOAT DEFAULT 0,
    shuffle_questions BOOLEAN DEFAULT true,
    shuffle_options BOOLEAN DEFAULT true,
    max_attempts INTEGER DEFAULT 1,
    quiz_type VARCHAR(50) DEFAULT 'practice', -- 'practice', 'weekly', 'monthly', 'placement'
    subject VARCHAR(100),
    status VARCHAR(50) DEFAULT 'draft', -- 'draft' or 'published'
    created_by VARCHAR(100) REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Questions Table
CREATE TABLE IF NOT EXISTS questions (
    id VARCHAR(100) PRIMARY KEY,
    quiz_id VARCHAR(100) REFERENCES quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of {id, text}
    correct_answer VARCHAR(10) NOT NULL, -- Option id (e.g. 'A', 'B', 'C', 'D')
    difficulty VARCHAR(50) DEFAULT 'Medium', -- 'Easy', 'Medium', 'Hard'
    subject VARCHAR(100),
    topic VARCHAR(100),
    weightage FLOAT DEFAULT 1,
    position INTEGER DEFAULT 0
);

-- Quiz Attempts Table
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id VARCHAR(100) PRIMARY KEY,
    quiz_id VARCHAR(100) REFERENCES quizzes(id) ON DELETE CASCADE,
    user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP WITH TIME ZONE,
    score FLOAT DEFAULT 0,
    total_marks FLOAT DEFAULT 0,
    accuracy FLOAT DEFAULT 0,
    time_taken INTEGER DEFAULT 0, -- seconds
    correct_count INTEGER DEFAULT 0,
    wrong_count INTEGER DEFAULT 0,
    skipped_count INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'in_progress', -- 'in_progress', 'submitted'
    question_order JSONB DEFAULT '[]'::jsonb -- shuffled question ids for this attempt
);

-- Question Responses Table
CREATE TABLE IF NOT EXISTS question_responses (
    id VARCHAR(100) PRIMARY KEY,
    attempt_id VARCHAR(100) REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    question_id VARCHAR(100) REFERENCES questions(id) ON DELETE CASCADE,
    selected_answer VARCHAR(10), -- null if skipped
    is_correct BOOLEAN DEFAULT false,
    marks_awarded FLOAT DEFAULT 0,
    time_spent INTEGER DEFAULT 0, -- seconds
    flagged_for_review BOOLEAN DEFAULT false,
    answered_at TIMESTAMP WITH TIME ZONE
);

-- AI Explanations Cache Table (reused across students)
CREATE TABLE IF NOT EXISTS ai_explanations (
    id VARCHAR(100) PRIMARY KEY,
    question_id VARCHAR(100) REFERENCES questions(id) ON DELETE CASCADE UNIQUE,
    why_correct TEXT,
    why_options_wrong JSONB DEFAULT '{}'::jsonb, -- {optionId: reason}
    interview_concepts TEXT,
    short_explanation TEXT,
    reference_topic TEXT,
    interview_frequency VARCHAR(50),
    memory_trick TEXT,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'general', -- 'quiz', 'result', 'badge', 'approval', 'leaderboard'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    read BOOLEAN DEFAULT FALSE
);

-- Unique constraint so ON CONFLICT works for upsert responses
ALTER TABLE question_responses DROP CONSTRAINT IF EXISTS uq_response_attempt_question;
ALTER TABLE question_responses ADD CONSTRAINT uq_response_attempt_question UNIQUE (attempt_id, question_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_questions_quiz_id ON questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_attempts_quiz_user ON quiz_attempts(quiz_id, user_id);
CREATE INDEX IF NOT EXISTS idx_attempts_user ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_responses_attempt ON question_responses(attempt_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_explanations_question ON ai_explanations(question_id);
