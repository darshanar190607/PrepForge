-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'member', -- 'admin' or 'member'
    avatar_url TEXT,
    streak INTEGER DEFAULT 0,
    solved_count INTEGER DEFAULT 0,
    join_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending' -- 'active' or 'pending'
);

-- Problems Table
CREATE TABLE IF NOT EXISTS problems (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    topic VARCHAR(100) NOT NULL,
    pattern VARCHAR(100) NOT NULL,
    difficulty VARCHAR(50) NOT NULL, -- 'Easy', 'Medium', 'Hard'
    deadline VARCHAR(100) NOT NULL,
    resources JSONB NOT NULL DEFAULT '[]'::jsonb,
    starter_code JSONB NOT NULL DEFAULT '{}'::jsonb,
    test_cases JSONB NOT NULL DEFAULT '[]'::jsonb,
    company_tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Submissions Table
CREATE TABLE IF NOT EXISTS submissions (
    id VARCHAR(100) PRIMARY KEY,
    problem_id VARCHAR(100) REFERENCES problems(id) ON DELETE CASCADE,
    user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
    user_name VARCHAR(255) NOT NULL,
    user_avatar TEXT,
    code TEXT NOT NULL,
    language VARCHAR(50) NOT NULL,
    status VARCHAR(100) NOT NULL, -- 'Accepted', 'Wrong Answer', 'Time Limit Exceeded'
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    runtime VARCHAR(50),
    memory VARCHAR(50),
    explanation TEXT
);

-- Announcements Table
CREATE TABLE IF NOT EXISTS announcements (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    category VARCHAR(50) NOT NULL DEFAULT 'general' -- 'important', 'general', 'resource'
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'challenge', 'announcement', 'approval'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    read BOOLEAN DEFAULT FALSE
);

-- Contributions Table
CREATE TABLE IF NOT EXISTS contributions (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
    user_name VARCHAR(255) NOT NULL,
    topic VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    video_url TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
