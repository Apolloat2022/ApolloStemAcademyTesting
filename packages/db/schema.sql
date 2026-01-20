-- Users Table
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    role TEXT CHECK(role IN ('student', 'teacher', 'volunteer', 'parent')) NOT NULL,
    google_id TEXT UNIQUE,
    google_classroom_link TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Classes Table
CREATE TABLE classes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    teacher_id TEXT NOT NULL,
    FOREIGN KEY (teacher_id) REFERENCES users(id)
);

-- Enrollments Table
CREATE TABLE enrollments (
    student_id TEXT NOT NULL,
    class_id TEXT NOT NULL,
    PRIMARY KEY (student_id, class_id),
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (class_id) REFERENCES classes(id)
);

-- Assignments Table
CREATE TABLE assignments (
    id TEXT PRIMARY KEY,
    class_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    due_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id)
);

-- Submissions Table
CREATE TABLE submissions (
    id TEXT PRIMARY KEY,
    assignment_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    content TEXT,
    status TEXT CHECK(status IN ('pending', 'submitted', 'reviewed')) DEFAULT 'pending',
    grade TEXT,
    feedback TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assignment_id) REFERENCES assignments(id),
    FOREIGN KEY (student_id) REFERENCES users(id)
);

-- Progress Logs (for AI analysis)
CREATE TABLE progress_logs (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    tool_id TEXT NOT NULL, -- 'math', 'worksheet', etc.
    activity_type TEXT,
    performance_score REAL,
    metadata TEXT, -- JSON blob of the interaction
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id)
);

-- Mentor Relationships
CREATE TABLE mentor_relationships (
    volunteer_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    PRIMARY KEY (volunteer_id, student_id),
    FOREIGN KEY (volunteer_id) REFERENCES users(id),
    FOREIGN KEY (student_id) REFERENCES users(id)
);

-- Messages Table
CREATE TABLE messages (
    id TEXT PRIMARY KEY,
    sender_id TEXT NOT NULL,
    receiver_id TEXT NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (receiver_id) REFERENCES users(id)
);

-- Achievements Table
CREATE TABLE achievements (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT, -- Lucide icon name
    criteria_type TEXT, -- 'tool_usage', 'score_avg', 'submission_count'
    criteria_value INTEGER
);

-- User Achievements Join Table
CREATE TABLE user_achievements (
    user_id TEXT NOT NULL,
    achievement_id TEXT NOT NULL,
    earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, achievement_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (achievement_id) REFERENCES achievements(id)
);

-- Student Mastery Table
CREATE TABLE student_mastery (
    student_id TEXT NOT NULL,
    subject TEXT NOT NULL, -- 'math', 'science', 'language_arts'
    score REAL DEFAULT 0, -- 0-100
    level INTEGER DEFAULT 1,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (student_id, subject),
    FOREIGN KEY (student_id) REFERENCES users(id)
);

-- Google OAuth tokens for Classroom Sync
CREATE TABLE google_oauth_tokens (
    user_id TEXT PRIMARY KEY,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at DATETIME,
    scope TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Student Personal Tasks
CREATE TABLE student_tasks (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    subject TEXT,
    due_date TEXT,
    priority TEXT DEFAULT 'Med',
    source TEXT DEFAULT 'student_created', -- 'student_created' or 'teacher_assigned'
    assigned_by TEXT,
    is_completed BOOLEAN DEFAULT 0,
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (assigned_by) REFERENCES users(id)
);

-- Parent-Student Mapping
CREATE TABLE parent_student_map (
    parent_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    PRIMARY KEY (parent_id, student_id),
    FOREIGN KEY (parent_id) REFERENCES users(id),
    FOREIGN KEY (student_id) REFERENCES users(id)
);

-- Student Goals Table
CREATE TABLE IF NOT EXISTS student_goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    subject TEXT,
    target_date DATE,
    priority TEXT DEFAULT 'medium',
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- AI Missions Table
CREATE TABLE IF NOT EXISTS ai_missions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    estimated_time TEXT NOT NULL,
    xp_reward INTEGER NOT NULL,
    objectives TEXT NOT NULL, -- JSON array
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- SEED DATA
INSERT OR IGNORE INTO users (id, email, name, role) VALUES ('default_teacher', 'teacher@apollo.edu', 'Ms. Frizzle', 'teacher');
INSERT OR IGNORE INTO classes (id, name, teacher_id) VALUES ('default_class', 'General STEM', 'default_teacher');

-- Add last_sync_at to users table if not exists (using a more robust approach for SQLite)
-- Note: SQLite doesn't support IF NOT EXISTS for ADD COLUMN directly in all versions, 
-- but Wrangler D1 handles migrations well. Adding them here for the schema file.
ALTER TABLE users ADD COLUMN last_sync_at TIMESTAMP;
ALTER TABLE users ADD COLUMN interests TEXT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_goals_student ON student_goals(student_id);
CREATE INDEX IF NOT EXISTS idx_missions_student ON ai_missions(student_id);
CREATE INDEX IF NOT EXISTS idx_assignments_student ON assignments(class_id); -- Class assignments usually filter by class or student through enrollments

