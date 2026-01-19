-- Users Table
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    role TEXT CHECK(role IN ('student', 'teacher', 'volunteer', 'parent')) NOT NULL,
    google_id TEXT UNIQUE,
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

-- Student Personal Tasks
CREATE TABLE student_tasks (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    title TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id)
);

-- SEED DATA
INSERT OR IGNORE INTO users (id, email, name, role) VALUES ('default_teacher', 'teacher@apollo.edu', 'Ms. Frizzle', 'teacher');
INSERT OR IGNORE INTO classes (id, name, teacher_id) VALUES ('default_class', 'General STEM', 'default_teacher');

