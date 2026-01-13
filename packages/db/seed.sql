-- Seed Users
INSERT INTO users (id, email, name, role) VALUES 
('user_1', 'student@apollo.edu', 'Alex Rivera', 'student'),
('user_2', 'teacher@apollo.edu', 'Sarah Jenkins', 'teacher'),
('user_3', 'volunteer@apollo.edu', 'Mike Mentor', 'volunteer');

-- Seed Classes
INSERT INTO classes (id, name, teacher_id) VALUES 
('class_1', 'Algebra Foundations', 'user_2'),
('class_2', 'Biology 101', 'user_2');

-- Seed Enrollments
INSERT INTO enrollments (student_id, class_id) VALUES 
('user_1', 'class_1'),
('user_1', 'class_2');

-- Seed Assignments
INSERT INTO assignments (id, class_id, title, description, due_date) VALUES 
('asgn_1', 'class_1', 'Solving Linear Equations', 'Practice solving for X in simple linear equations.', '2026-02-01 23:59:59'),
('asgn_2', 'class_2', 'Cell Structure Lab', 'Identify parts of the cell using the Science Lab tool.', '2026-02-05 23:59:59');

-- Seed Progress Logs (Sample Activity)
INSERT INTO progress_logs (id, student_id, tool_id, activity_type, performance_score, metadata) VALUES 
('log_1', 'user_1', 'math', 'AI_TOOL_MATH', 85, '{"topic": "Linear Equations", "questions": 5}'),
('log_2', 'user_1', 'science', 'AI_TOOL_SCIENCE', 45, '{"topic": "Cell Structure", "error": "Struggled with Mitochondria"}'),
('log_3', 'user_1', 'science', 'AI_TOOL_SCIENCE', 42, '{"topic": "Cell Structure", "error": "Repeated error on structural identification"}');

-- Seed Mentor Relationships
INSERT INTO mentor_relationships (volunteer_id, student_id) VALUES 
('user_3', 'user_1');
