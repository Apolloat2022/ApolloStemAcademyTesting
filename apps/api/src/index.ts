import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { D1Database } from '@cloudflare/workers-types'
import { createToken, authMiddleware, roleMiddleware } from './auth'
import { aiIntelligence, geminiService } from './ai_services'
import { User } from '@apollo/types'
import { getGoogleAuthUrl, exchangeCodeForTokens } from './google_auth'
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

// Schema for goal creation
const GoalSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  subject: z.string().optional(),
  targetDate: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium')
});

const app = new Hono<{ Bindings: { DB: D1Database } }>()

app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
  credentials: true,
}))

app.get('/', (c) => {
  return c.text('Apollo STEM Academy API')
})

// Compatibility Route for root POST (used by reference index.html)
app.post('/', async (c) => {
  return handleAIGenerate(c);
});

// Authentication Routes
app.post('/auth/google', async (c) => {
  const { token, role } = await c.req.json()

  try {
    // Verify token with Google's tokeninfo endpoint
    // This is a lightweight way to verify tokens in a Worker environment
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);

    if (!response.ok) {
      throw new Error('Invalid Google Token');
    }

    const payload = await response.json() as any;

    // Authorization Check (Phase 1)
    let isAuthorized = false;

    // 1. Check Database if available
    if (c.env.DB) {
      try {
        const authRecord = await c.env.DB.prepare('SELECT role FROM authorized_access WHERE email = ?').bind(payload.email).first();
        if (authRecord) isAuthorized = true;
      } catch (e) {
        console.error('Auth table check failed', e);
      }
    }

    // 2. Demo Whitelist Fallback
    const demoWhitelist = [
      'test@example.com',
      'robin@apollo.edu',
      'teacher@apollo.edu',
      'parent@apollo.edu',
      'student@apollo.edu',
      'apolloacademyaiteacher@gmail.com' // Whitelist user's likely email
    ];
    if (demoWhitelist.includes(payload.email)) isAuthorized = true;

    if (!isAuthorized) {
      return c.json({ success: false, error: 'Access Denied: Email not in authorized roster.' }, 403);
    }

    const user: User = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      role: role || 'student' // Use the role selected in the frontend
    }

    const jwtToken = await createToken(user)
    return c.json({ token: jwtToken, user })
  } catch (err: any) {
    console.error('Google Auth Error:', err.message);

    // Fallback for development/testing if token is invalid or during local dev
    // WARNING: Remove this for absolute production security
    if (token === 'mock_jwt') {
      const mockUser: User = {
        id: 'mock_123',
        email: 'mock@example.com',
        role: role || 'student',
        name: 'Mock User'
      }
      const jwtToken = await createToken(mockUser)
      return c.json({ token: jwtToken, user: mockUser })
    }

    return c.json({ success: false, error: 'Authentication failed' }, 401)
  }
})

// Google OAuth Flow for Classroom Sync
app.get('/api/auth/google/url', authMiddleware, async (c) => {
  const { redirectUri } = c.req.query();
  if (!redirectUri) return c.json({ error: 'Missing redirectUri' }, 400);

  const url = await getGoogleAuthUrl(c.env, redirectUri);
  return c.json({ url });
});

app.post('/api/auth/google/callback', authMiddleware, async (c) => {
  const payload = c.get('jwtPayload') as any;
  const { code, redirectUri } = await c.req.json();

  if (!code || !redirectUri) return c.json({ error: 'Missing code or redirectUri' }, 400);

  try {
    const tokens = await exchangeCodeForTokens(c.env, code, redirectUri) as any;

    // Save tokens to DB
    if (c.env.DB) {
      await c.env.DB.prepare(`
        INSERT INTO google_oauth_tokens (user_id, access_token, refresh_token, expires_at, scope)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET
          access_token = excluded.access_token,
          refresh_token = COALESCE(excluded.refresh_token, refresh_token),
          expires_at = excluded.expires_at,
          scope = excluded.scope
      `).bind(
        payload.id,
        tokens.access_token,
        tokens.refresh_token || null,
        new Date(Date.now() + (tokens.expires_in || 3600) * 1000).toISOString(),
        tokens.scope || ''
      ).run();
    }

    return c.json({ success: true });
  } catch (err: any) {
    console.error('OAuth callback failed', err);
    return c.json({ success: false, error: err.message }, 500);
  }
});

app.get('/api/auth/google/status', authMiddleware, async (c) => {
  const payload = c.get('jwtPayload') as any;
  if (c.env.DB) {
    const token = await c.env.DB.prepare('SELECT user_id FROM google_oauth_tokens WHERE user_id = ?').bind(payload.id).first();
    return c.json({ isConnected: !!token });
  }
  return c.json({ isConnected: false });
});

// Protected Routes Example
app.get('/api/student/dashboard-stats', authMiddleware, roleMiddleware(['student']), async (c) => {
  const payload = c.get('jwtPayload') as any;
  const stats = { lessons: 0, assignments: 0, accuracy: 0 };

  if (c.env.DB) {
    try {
      // Mock lesson count logic (e.g., specific progress logs)
      const lessonCount = await c.env.DB.prepare('SELECT COUNT(*) as c FROM progress_logs WHERE student_id = ?').bind(payload.id).first() as any;
      stats.lessons = lessonCount.c;

      // Pending assignments
      const pending = await c.env.DB.prepare(`
        SELECT COUNT(*) as c 
        FROM assignments a 
        JOIN enrollments e ON a.class_id = e.class_id 
        LEFT JOIN submissions s ON s.assignment_id = a.id AND s.student_id = ?
        WHERE e.student_id = ? AND (s.status IS NULL OR s.status = 'pending')
      `).bind(payload.id, payload.id).first() as any;
      stats.assignments = pending.c;

      // Accuracy (average performance score)
      const accuracy = await c.env.DB.prepare('SELECT AVG(performance_score) as avg FROM progress_logs WHERE student_id = ? AND performance_score IS NOT NULL').bind(payload.id).first() as any;
      stats.accuracy = accuracy.avg ? Math.round(accuracy.avg) : 0;
    } catch (e) {
      console.error('Student stats fetch failed', e);
    }
  }
  return c.json(stats);
})

app.get('/api/student/tasks', authMiddleware, roleMiddleware(['student']), async (c) => {
  const payload = c.get('jwtPayload') as any;
  if (c.env.DB) {
    const { results } = await c.env.DB.prepare('SELECT * FROM student_tasks WHERE student_id = ? ORDER BY created_at DESC').bind(payload.id).all();
    return c.json(results);
  }
  return c.json([]);
})

app.get('/api/student/classroom-link', authMiddleware, roleMiddleware(['student']), async (c) => {
  const payload = c.get('jwtPayload') as any;
  if (c.env.DB) {
    const user = await c.env.DB.prepare('SELECT google_classroom_link FROM users WHERE id = ?').bind(payload.id).first() as any;
    return c.json({ link: user?.google_classroom_link || '' });
  }
  return c.json({ link: '' });
})

app.post('/api/student/classroom-link', authMiddleware, roleMiddleware(['student']), async (c) => {
  const payload = c.get('jwtPayload') as any;
  const { link } = await c.req.json();
  if (c.env.DB) {
    await c.env.DB.prepare('UPDATE users SET google_classroom_link = ? WHERE id = ?').bind(link, payload.id).run();
  }
  return c.json({ success: true });
})

app.post('/api/student/tasks', authMiddleware, roleMiddleware(['student']), async (c) => {
  const payload = c.get('jwtPayload') as any;
  const { title, description, subject, due_date, priority, source } = await c.req.json();
  const id = crypto.randomUUID();
  if (c.env.DB) {
    await c.env.DB.prepare(
      'INSERT INTO student_tasks (id, student_id, title, description, subject, due_date, priority, source) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(id, payload.id, title, description || '', subject || 'General', due_date || 'TBD', priority || 'Med', source || 'student_created').run();
  }
  return c.json({ success: true, id, title, description, subject, due_date, priority, source, is_completed: 0 });
})

app.put('/api/student/tasks/:id', authMiddleware, roleMiddleware(['student']), async (c) => {
  const id = c.req.param('id');
  const { is_completed } = await c.req.json();
  if (c.env.DB) {
    await c.env.DB.prepare('UPDATE student_tasks SET is_completed = ? WHERE id = ?').bind(is_completed ? 1 : 0, id).run();
  }
  return c.json({ success: true });
})

// --- Student Goals API ---
app.get('/api/student/goals', authMiddleware, roleMiddleware(['student']), async (c) => {
  try {
    const payload = c.get('jwtPayload') as any;
    const userId = payload.id;
    if (!userId) return c.json({ error: 'Unauthorized' }, 401);

    const goals = await c.env.DB.prepare(`
      SELECT * FROM student_goals 
      WHERE student_id = ? 
      ORDER BY 
        CASE priority 
          WHEN 'high' THEN 1
          WHEN 'medium' THEN 2
          WHEN 'low' THEN 3
        END,
        target_date ASC
    `).bind(userId).all();

    return c.json({ goals: goals.results });
  } catch (error) {
    console.error('Error fetching goals:', error);
    return c.json({ error: 'Failed to fetch goals' }, 500);
  }
});

app.post('/api/student/goals', authMiddleware, roleMiddleware(['student']), zValidator('json', GoalSchema), async (c) => {
  try {
    const payload = c.get('jwtPayload') as any;
    const userId = payload.id;
    if (!userId) return c.json({ error: 'Unauthorized' }, 401);

    const goal = c.req.valid('json');

    const result = await c.env.DB.prepare(`
      INSERT INTO student_goals 
      (student_id, title, description, subject, target_date, priority, created_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      userId,
      goal.title,
      goal.description || '',
      goal.subject || '',
      goal.targetDate || null,
      goal.priority
    ).run();

    const newGoal = await c.env.DB.prepare(
      'SELECT * FROM student_goals WHERE id = ?'
    ).bind(result.meta.last_row_id).first();

    return c.json({
      success: true,
      goal: newGoal
    });
  } catch (error) {
    console.error('Error creating goal:', error);
    return c.json({ error: 'Failed to create goal' }, 500);
  }
});

app.put('/api/student/goals/:id/complete', authMiddleware, roleMiddleware(['student']), async (c) => {
  try {
    const payload = c.get('jwtPayload') as any;
    const userId = payload.id;
    const goalId = c.req.param('id');

    await c.env.DB.prepare(`
      UPDATE student_goals 
      SET completed = true, completed_at = datetime('now')
      WHERE id = ? AND student_id = ?
    `).bind(goalId, userId).run();

    return c.json({ success: true });
  } catch (error) {
    console.error('Error completing goal:', error);
    return c.json({ error: 'Failed to update goal' }, 500);
  }
});

// --- Google Classroom Status API ---
app.get('/api/google/status', authMiddleware, roleMiddleware(['student']), async (c) => {
  try {
    const payload = c.get('jwtPayload') as any;
    const userId = payload.id;

    const user = await c.env.DB.prepare(
      'SELECT google_classroom_link, last_sync_at FROM users WHERE id = ?'
    ).bind(userId).first() as any;

    const assignments = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM assignments a JOIN enrollments e ON a.class_id = e.class_id WHERE e.student_id = ?'
    ).bind(userId).first() as any;

    return c.json({
      connected: !!user?.google_classroom_link,
      link: user?.google_classroom_link || '',
      lastSync: user?.last_sync_at || null,
      assignmentCount: assignments?.count || 0
    });
  } catch (error) {
    console.error('Error checking Google status:', error);
    return c.json({ error: 'Failed to check status' }, 500);
  }
});

app.post('/api/google/connect', authMiddleware, roleMiddleware(['student']), async (c) => {
  try {
    const payload = c.get('jwtPayload') as any;
    const userId = payload.id;
    const { link } = await c.req.json();

    if (!link || (!link.includes('classroom.google.com') && !/^[a-z0-9-]+$/i.test(link))) {
      return c.json({ error: 'Invalid Google Classroom link' }, 400);
    }

    await c.env.DB.prepare(`
      UPDATE users 
      SET google_classroom_link = ?, last_sync_at = datetime('now')
      WHERE id = ?
    `).bind(link, userId).run();

    return c.json({ success: true });
  } catch (error) {
    console.error('Error connecting Google Classroom:', error);
    return c.json({ error: 'Failed to connect' }, 500);
  }
});

// --- AI Mission Generation API ---
app.post('/api/ai/missions', authMiddleware, roleMiddleware(['student']), async (c) => {
  try {
    const payload = c.get('jwtPayload') as any;
    const userId = payload.id;
    const apiKey = (c.env as any).GEMINI_API_KEY;

    // Get user context
    const [subjects, progress, userProfile] = await Promise.all([
      c.env.DB.prepare(`
        SELECT DISTINCT c.name as subject 
        FROM assignments a 
        JOIN classes c ON a.class_id = c.id
        JOIN enrollments e ON c.id = e.class_id
        WHERE e.student_id = ?
        LIMIT 5
      `).bind(userId).all(),

      c.env.DB.prepare(`
        SELECT activity_type, AVG(performance_score) as avg_score, COUNT(*) as attempt_count
        FROM progress_logs 
        WHERE student_id = ?
        GROUP BY activity_type
      `).bind(userId).all(),

      c.env.DB.prepare(
        'SELECT interests FROM users WHERE id = ?'
      ).bind(userId).first() as any
    ]);

    const prompt = `As an AI STEM tutor, generate 3 personalized learning missions for a student.

Student Profile:
- Subjects: ${subjects.results.map((s: any) => s.subject).join(', ')}
- Performance: ${JSON.stringify(progress.results)}
- Interests: ${userProfile?.interests || 'STEM, Technology, Science'}

For each mission, provide:
1. A creative, engaging title (max 6 words)
2. Subject area (math, physics, cs, chemistry, biology, english)
3. Difficulty (beginner/intermediate/advanced)
4. Estimated completion time (1-4 hours)
5. XP reward (50-300 based on difficulty)
6. 3 specific learning objectives
7. A brief description

Return ONLY a JSON array of exactly 3 missions.`;

    let missions = [];

    if (apiKey) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.8,
              maxOutputTokens: 1500
            }
          })
        }
      );

      const data = await response.json() as any;
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (generatedText) {
        missions = JSON.parse(generatedText.replace(/```json\n?|\n?```/g, ''));

        // Store missions for this user
        for (const mission of missions) {
          await c.env.DB.prepare(`
            INSERT INTO ai_missions 
            (student_id, title, subject, difficulty, estimated_time, xp_reward, objectives, description, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
          `).bind(
            userId,
            mission.title,
            mission.subject,
            mission.difficulty,
            mission.estimatedTime || mission.estimated_time,
            mission.xpReward || mission.xp_reward,
            JSON.stringify(mission.objectives),
            mission.description
          ).run();
        }
      }
    }

    if (missions.length === 0) {
      // Fallback missions
      missions = [
        {
          title: "Master Quadratic Functions",
          subject: "math",
          difficulty: "intermediate",
          estimatedTime: "2 hours",
          xpReward: 150,
          objectives: [
            "Solve quadratic equations using 3 methods",
            "Graph parabolas from standard form",
            "Apply to real-world physics problems"
          ],
          description: "Deep dive into quadratic equations, graphs, and applications"
        }
      ];
    }

    return c.json({ missions });
  } catch (error) {
    console.error('AI mission generation error:', error);
    return c.json({ error: 'Failed to generate missions' }, 500);
  }
});

// AI Intelligence Routes
app.get('/api/reports/:studentId', authMiddleware, roleMiddleware(['teacher', 'volunteer']), async (c) => {
  const studentId = c.req.param('studentId')
  // Accessing GEMINI_API_KEY from environment bindings
  const apiKey = (c.env as any).GEMINI_API_KEY
  const report = await aiIntelligence.generateNarrativeReport(c.env.DB, studentId, apiKey)
  return c.json(report)
})

app.post('/api/ai/ap-strategy', authMiddleware, roleMiddleware(['teacher']), async (c) => {
  const { subject, studentCount } = await c.req.json();
  const apiKey = (c.env as any).GEMINI_API_KEY;

  const prompt = `Develop a high-intensity AP Exam strategy for a class of ${studentCount} students in ${subject}. 
  Focus on syllabus alignment, pacing for college credit, and AI-driven practice banks. 
  Include exactly 3 actionable milestones.`;

  let strategy = "Strategy: Focus on unit drills and mock exams. Pacing looks good for May test dates.";

  if (apiKey) {
    try {
      const res = await geminiService.generate(apiKey, prompt, "You are an AP Education Coordinator.");
      if (res) strategy = res;
    } catch (e) { }
  }

  return c.json({ strategy });
})

app.post('/api/ai/parse-task', authMiddleware, async (c) => {
  const { text } = await c.req.json();
  const apiKey = (c.env as any).GEMINI_API_KEY;

  const prompt = `Parse this task description into structured data: "${text}"
  Return a raw JSON object with: title, subject (math, physics, cs, chemistry, biology, english, other), 
  dueDate (string format like "tomorrow", "Jan 25", etc), priority (Low, Med, High). 
  Only return the JSON, nothing else.`;

  let parsed = { title: text, subject: 'General', dueDate: 'TBD', priority: 'Med' };

  if (apiKey) {
    try {
      const res = await geminiService.generate(apiKey, prompt, "You are an AI task assistant.");
      if (res) {
        // Clean up markdown if Gemini wrapped it
        const cleaned = res.replace(/```json/g, '').replace(/```/g, '').trim();
        parsed = JSON.parse(cleaned);
      }
    } catch (e) {
      console.error('AI Parse failed', e);
    }
  }

  return c.json(parsed);
})

app.get('/api/student/assignments', authMiddleware, roleMiddleware(['student']), async (c) => {
  const payload = c.get('jwtPayload') as any;
  let assignments: any[] = [];

  if (c.env.DB) {
    try {
      // Fetch assignments for classes the student is enrolled in
      const query = `
        SELECT 
          a.id, a.title, a.description, a.due_date, c.name as subject,
          COALESCE(s.status, 'pending') as status
        FROM assignments a
        JOIN classes c ON a.class_id = c.id
        JOIN enrollments e ON c.id = e.class_id
        LEFT JOIN submissions s ON a.id = s.assignment_id AND s.student_id = ?
        WHERE e.student_id = ?
      `;
      const { results } = await c.env.DB.prepare(query).bind(payload.id, payload.id).all();
      assignments = results;
    } catch (e) {
      console.error('Failed to fetch assignments', e);
    }
  }

  // Fallback / Demo Data if no assignments found (for testing purposes)
  if (assignments.length === 0) {
    assignments = [
      {
        id: 'demo_1',
        title: 'Algebra: Quadratic Basics (Demo)',
        subject: 'Math',
        due_date: 'Tomorrow, 11:59 PM',
        status: 'in-progress',
        description: 'Solve the 5 quadratic equations generated by your AI tutor.'
      },
      {
        id: 'demo_2',
        title: 'Cell Biology Review (Demo)',
        subject: 'Science',
        due_date: 'Jan 18, 2026',
        status: 'pending',
        description: 'Generate a study guide for the upcoming exam on Mitosis.'
      }
    ];
  }

  return c.json(assignments);
});

// Teacher Assignment Management
app.get('/api/assignments', authMiddleware, roleMiddleware(['teacher']), async (c) => {
  if (c.env.DB) {
    try {
      const { results } = await c.env.DB.prepare(
        'SELECT a.*, (SELECT COUNT(*) FROM submissions s WHERE s.assignment_id = a.id) as submitted_count, (SELECT COUNT(*) FROM enrollments e WHERE e.class_id = a.class_id) as total_students FROM assignments a ORDER BY created_at DESC'
      ).all();
      return c.json(results);
    } catch (e) {
      console.error('Fetch assignments failed', e);
      return c.json([], 500);
    }
  }
  return c.json([]);
});

app.post('/api/assignments', authMiddleware, roleMiddleware(['teacher']), async (c) => {
  const { title, subject, tool, description, due_date, class_id } = await c.req.json();
  const id = crypto.randomUUID();

  if (c.env.DB) {
    await c.env.DB.prepare(
      'INSERT INTO assignments (id, class_id, title, description, due_date) VALUES (?, ?, ?, ?, ?)'
    ).bind(id, class_id || 'default_class', title, description, due_date).run();
  }
  return c.json({ success: true, id });
});

app.delete('/api/assignments/:id', authMiddleware, roleMiddleware(['teacher']), async (c) => {
  const id = c.req.param('id');
  if (c.env.DB) {
    await c.env.DB.prepare('DELETE FROM assignments WHERE id = ?').bind(id).run();
  }
  return c.json({ success: true });
});

app.get('/api/teacher/students', authMiddleware, roleMiddleware(['teacher']), async (c) => {
  if (c.env.DB) {
    const { results } = await c.env.DB.prepare('SELECT id, name, email FROM users WHERE role = "student"').all();
    return c.json(results);
  }
  return c.json([]);
});

app.post('/api/teacher/assign-tasks', authMiddleware, roleMiddleware(['teacher']), async (c) => {
  const payload = c.get('jwtPayload') as any;
  const { studentIds, task } = await c.req.json();

  if (c.env.DB) {
    try {
      const stmt = c.env.DB.prepare(`
        INSERT INTO student_tasks (id, student_id, title, description, subject, due_date, priority, source, assigned_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const promises = studentIds.map((studentId: string) =>
        stmt.bind(crypto.randomUUID(), studentId, task.title, task.description || '', task.subject || 'General', task.dueDate || 'TBD', task.priority || 'Med', 'teacher_assigned', payload.id).run()
      );

      await Promise.all(promises);
      return c.json({ success: true, count: studentIds.length });
    } catch (e: any) {
      return c.json({ success: false, error: e.message }, 500);
    }
  }
  return c.json({ success: false, message: 'DB not found' }, 500);
});

// Student Management
app.post('/api/students', authMiddleware, roleMiddleware(['teacher']), async (c) => {
  const { name, email, studentId } = await c.req.json();
  const id = crypto.randomUUID();

  if (c.env.DB) {
    // Add to Users and Enrollments
    try {
      await c.env.DB.batch([
        c.env.DB.prepare('INSERT OR IGNORE INTO authorized_access (email, role) VALUES (?, ?)').bind(email, 'student'),
        c.env.DB.prepare('INSERT INTO users (id, email, name, role) VALUES (?, ?, ?, ?)').bind(id, email, name, 'student'),
        c.env.DB.prepare('INSERT INTO enrollments (student_id, class_id) VALUES (?, ?)').bind(id, 'default_class')
      ]);
      return c.json({ success: true, id });
    } catch (e: any) {
      return c.json({ success: false, error: e.message }, 500);
    }
  }
  return c.json({ success: true, id: 'mock_id' });
});

app.post('/api/assignments/:assignmentId/submit', authMiddleware, async (c) => {
  const assignmentId = c.req.param('assignmentId')
  const { content } = await c.req.json()
  const payload = c.get('jwtPayload') as any

  await c.env.DB.prepare(
    'INSERT INTO submissions (id, assignment_id, student_id, content) VALUES (?, ?, ?, ?)'
  ).bind(crypto.randomUUID(), assignmentId, payload.id, content).run()

  return c.json({ success: true, message: 'Assignment submitted' })
})

app.get('/api/recommendations/:classId', authMiddleware, roleMiddleware(['teacher']), async (c) => {
  const classId = c.req.param('classId')
  const recs = await aiIntelligence.getRecommendedassignments(c.env.DB, classId)
  return c.json(recs)
})

app.get('/api/alerts/stuck', authMiddleware, roleMiddleware(['teacher', 'volunteer']), async (c) => {
  const alerts = await aiIntelligence.checkStuckStudents(c.env.DB)
  return c.json(alerts)
})

app.get('/api/submissions/pending', authMiddleware, roleMiddleware(['teacher']), async (c) => {
  const submissions = await c.env.DB.prepare(
    'SELECT s.*, u.name as student_name FROM submissions s JOIN users u ON s.student_id = u.id WHERE s.grade IS NULL ORDER BY s.created_at DESC'
  ).all();
  return c.json(submissions.results);
})

app.get('/api/parent/child-data', authMiddleware, roleMiddleware(['parent']), async (c) => {
  const payload = c.get('jwtPayload') as any;

  if (c.env.DB) {
    // 1. Find the linked student(s) for this parent
    const map = await c.env.DB.prepare(
      'SELECT student_id FROM parent_student_map WHERE parent_id = ? LIMIT 1'
    ).bind(payload.id).first() as any;

    let studentId = map?.student_id;

    // Demo Fallback: If no mapping exists, find the first student
    if (!studentId) {
      const firstStudent = await c.env.DB.prepare('SELECT id FROM users WHERE role = "student" LIMIT 1').first() as any;
      studentId = firstStudent?.id;
    }

    if (!studentId) return c.json({ error: 'No student found' }, 404);

    const [student, progress, assignments, tokens] = await Promise.all([
      c.env.DB.prepare('SELECT id, name, email, google_classroom_link FROM users WHERE id = ?').bind(studentId).first() as any,
      c.env.DB.prepare('SELECT * FROM progress_logs WHERE student_id = ? ORDER BY created_at DESC LIMIT 10').bind(studentId).all(),
      c.env.DB.prepare('SELECT a.*, c.name as class_name FROM assignments a JOIN enrollments e ON a.class_id = e.class_id JOIN classes c ON a.class_id = c.id WHERE e.student_id = ? ORDER BY due_date ASC LIMIT 5').bind(studentId).all(),
      c.env.DB.prepare('SELECT created_at FROM google_oauth_tokens WHERE user_id = ?').bind(studentId).first() as any
    ]);

    return c.json({
      student,
      recentActivity: progress.results,
      activeAssignments: assignments.results,
      lastSynced: tokens?.created_at || null
    });
  }

  return c.json({ error: 'DB not found' }, 500);
})

app.get('/api/messages/:chatId', authMiddleware, async (c) => {
  const chatId = c.req.param('chatId')
  const messages = await c.env.DB.prepare(
    'SELECT * FROM messages WHERE class_id = ? OR student_id = ? ORDER BY created_at ASC'
  ).bind(chatId, chatId).all();
  return c.json(messages.results);
})

app.post('/api/messages', authMiddleware, async (c) => {
  const { recipientId, content, role } = await c.req.json()
  const payload = c.get('jwtPayload') as any;

  const id = crypto.randomUUID()
  await c.env.DB.prepare(
    'INSERT INTO messages (id, student_id, content, sender_id, created_at) VALUES (?, ?, ?, ?, ?)'
  ).bind(id, recipientId, content, payload.id, new Date().toISOString()).run();

  return c.json({ success: true, id });
})

app.get('/api/parent/ai-summary', authMiddleware, roleMiddleware(['parent']), async (c) => {
  const payload = c.get('jwtPayload') as any;
  const apiKey = (c.env as any).GEMINI_API_KEY;

  if (c.env.DB) {
    // 1. Identify student
    const map = await c.env.DB.prepare('SELECT student_id FROM parent_student_map WHERE parent_id = ? LIMIT 1').bind(payload.id).first() as any;
    const studentId = map?.student_id || (await c.env.DB.prepare('SELECT id FROM users WHERE role = "student" LIMIT 1').first() as any)?.id;

    if (!studentId) return c.json({ summary: "We are still collecting data for your student. Check back soon for a weekly synthesis!" });

    // 2. Fetch recent activity for AI analysis
    const logs = await c.env.DB.prepare(
      'SELECT activity_type, performance_score, tool_id FROM progress_logs WHERE student_id = ? AND created_at > datetime("now", "-7 days")'
    ).bind(studentId).all();

    const studentData = logs.results.length > 0
      ? JSON.stringify(logs.results)
      : "Student joined recently. High engagement with the initial platform tour.";

    const prompt = `Synthesize this student activity data from the last 7 days into a warm, encouraging 3-sentence summary for a parent. 
    Focus on specific strengths identified in the logs and maintain a "growth mindset" tone. 
    Data: ${studentData}`;

    if (apiKey) {
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        });

        const genData = await res.json() as any;
        const summary = genData.candidates?.[0]?.content?.parts?.[0]?.text || "Excellent progress this week! Your student is engaging well with STEM missions.";
        return c.json({ summary });
      } catch (e) {
        console.error('AI Summary generation failed', e);
      }
    }

    return c.json({ summary: "Your student is making great strides in their STEM journey! They've been active across multiple learning modules this week." });
  }

  return c.json({ error: 'DB not found' }, 500);
})

// --- Gamified Mastery & AI Learning Paths ---

app.get('/api/student/mastery', authMiddleware, async (c) => {
  const payload = c.get('jwtPayload') as any;
  const mastery = await c.env.DB.prepare(
    'SELECT * FROM student_mastery WHERE student_id = ?'
  ).bind(payload.id).all();

  // If none exists, return mock defaults for UX
  if (mastery.results.length === 0) {
    return c.json([
      { subject: 'math', score: 65, level: 3 },
      { subject: 'science', score: 40, level: 1 },
      { subject: 'language_arts', score: 82, level: 5 }
    ]);
  }

  return c.json(mastery.results);
})

app.get('/api/student/achievements', authMiddleware, async (c) => {
  const payload = c.get('jwtPayload') as any;
  const achievements = await c.env.DB.prepare(
    'SELECT a.*, (ua.earned_at IS NOT NULL) as earned FROM achievements a LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ?'
  ).bind(payload.id).all();

  // Seed if empty
  if (achievements.results.length === 0) {
    const seeds = [
      { id: 'apprentice', name: 'AI Apprentice', desc: 'Used an AI tool for the first time.', icon: 'Sparkles' },
      { id: 'math_whiz', name: 'Math Whiz', desc: 'Completed 5 math-related missions.', icon: 'Star' },
      { id: 'consistent', name: 'Always Active', desc: 'Logged in 3 days in a row.', icon: 'Heart' }
    ];
    for (const s of seeds) {
      await c.env.DB.prepare('INSERT OR IGNORE INTO achievements (id, name, description, icon) VALUES (?, ?, ?, ?)').bind(s.id, s.name, s.desc, s.icon).run();
    }
    return c.json(seeds.map(s => ({ ...s, earned: false })));
  }

  return c.json(achievements.results);
})

app.get('/api/student/leaderboard', authMiddleware, async (c) => {
  if (c.env.DB) {
    try {
      // Calculate rank based on mastery and activity
      const { results } = await c.env.DB.prepare(`
        SELECT 
          u.name, 
          u.id,
          (SELECT SUM(score * level) FROM student_mastery WHERE student_id = u.id) as mastery_pts,
          (SELECT COUNT(*) FROM progress_logs WHERE student_id = u.id) as activity_pts
        FROM users u 
        WHERE u.role = 'student'
        LIMIT 10
      `).all();

      const ranked = results.map((r: any) => {
        const total = (Number(r.mastery_pts) || 0) + ((Number(r.activity_pts) || 0) * 10);

        // Ranking Logic
        let rankLabel = 'Novice';
        if (total > 1000) rankLabel = 'Quasar Commander';
        else if (total > 500) rankLabel = 'Nebula Explorer';
        else if (total > 200) rankLabel = 'Orbit Specialist';
        else if (total > 50) rankLabel = 'Apollo Cadet';

        return {
          name: r.name || 'Anonymous Learner',
          score: total,
          rank: rankLabel
        };
      }).sort((a, b) => b.score - a.score);

      return c.json(ranked);
    } catch (e) {
      console.error('Leaderboard fetch failed', e);
      return c.json([], 500);
    }
  }
  return c.json([]);
});

app.get('/api/student/squads', authMiddleware, async (c) => {
  const payload = c.get('jwtPayload') as any;
  if (c.env.DB) {
    try {
      const { results } = await c.env.DB.prepare(`
        SELECT a.id as assignment_id, u.name as student_name
        FROM assignments a
        JOIN enrollments e ON a.class_id = e.class_id
        JOIN users u ON e.student_id = u.id
        WHERE a.class_id IN (SELECT class_id FROM enrollments WHERE student_id = ?)
        AND u.id != ?
      `).bind(payload.id, payload.id).all();

      const squads = (results || []).reduce((acc: any, curr: any) => {
        if (!acc[curr.assignment_id]) acc[curr.assignment_id] = [];
        acc[curr.assignment_id].push(curr.student_name);
        return acc;
      }, {});

      return c.json(squads);
    } catch (e) {
      console.error('Squad fetch failed', e);
      return c.json({});
    }
  }
  return c.json({});
});

app.get('/api/student/recommendations', authMiddleware, async (c) => {
  const payload = c.get('jwtPayload') as any;
  const apiKey = (c.env as any).GEMINI_API_KEY;
  const recs = await aiIntelligence.getStudentRecommendations(c.env.DB, payload.id, apiKey);
  return c.json(recs);
})

app.post('/api/ai/generate-study-guide', authMiddleware, async (c) => {
  const { title, subject, description } = await c.req.json();
  if (!title) return c.json({ error: 'Missing assignment title' }, 400);

  try {
    const prompt = `You are a helpful STEM tutor. Generate a comprehensive, structured study guide for a student working on the following assignment:
    Subject: ${subject || 'General'}
    Title: ${title}
    Description: ${description || 'No detailed instructions.'}

    The study guide should include:
    1. Key Concepts: A list of core ideas to understand.
    2. Step-by-Step Approach: How to tackle the assignment.
    3. Practice Questions: 3 conceptual questions to test understanding.
    4. Helpful Tips: Pro-tips for mastering the topic.

    Format the response in clear, beautiful Markdown. Use headers, bullet points, and bold text for readability.`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${(c.env as any).GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await res.json() as any;
    const studyGuide = data.candidates?.[0]?.content?.parts?.[0]?.text || 'I could not generate a study guide at this time.';

    return c.json({ studyGuide });
  } catch (err: any) {
    console.error('Study guide generation failed', err);
    return c.json({ error: 'Failed to generate study guide' }, 500);
  }
});

app.post('/api/ai/draft-feedback', authMiddleware, roleMiddleware(['teacher']), async (c) => {
  const { submissionContent, title, description } = await c.req.json();
  if (!submissionContent) return c.json({ error: 'Missing submission content' }, 400);

  try {
    const prompt = `You are a supportive STEM teacher at Apollo Academy. Provide constructive, professional, and encouraging feedback for the following student submission:
    
    Assignment: ${title}
    Description: ${description || 'No detailed instructions.'}
    Student Submission: "${submissionContent}"
    
    Guidelines for feedback:
    1. Acknowledge effort and specific strengths.
    2. Provide 1-2 clear areas for improvement or further exploration.
    3. Maintain an encouraging and professional tone.
    4. Keep it concise (max 150 words).`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${(c.env as any).GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await res.json() as any;
    const draft = data.candidates?.[0]?.content?.parts?.[0]?.text || 'I could not generate a feedback draft at this time.';

    return c.json({ draft });
  } catch (err: any) {
    console.error('Feedback draft generation failed', err);
    return c.json({ error: 'Failed to generate feedback draft' }, 500);
  }
});

app.post('/api/ai/generate-missions', authMiddleware, async (c) => {
  const payload = c.get('jwtPayload') as any;
  const apiKey = (c.env as any).GEMINI_API_KEY;

  try {
    // 1. Fetch student context (mastery + pending tasks)
    const [mastery, pendingAsgns, pendingTasks] = await Promise.all([
      c.env.DB.prepare('SELECT subject, score, level FROM student_mastery WHERE student_id = ?').bind(payload.id).all(),
      c.env.DB.prepare('SELECT title, subject, due_date FROM assignments a JOIN enrollments e ON a.class_id = e.class_id WHERE e.student_id = ? AND status != "submitted"').bind(payload.id).all(),
      c.env.DB.prepare('SELECT title, subject, due_date FROM student_tasks WHERE student_id = ? AND is_completed = 0').bind(payload.id).all()
    ]);

    const studentContext = {
      mastery: mastery.results,
      pending: [...(pendingAsgns.results || []), ...(pendingTasks.results || [])]
    };

    const contextString = mastery.results.length > 0 || studentContext.pending.length > 0
      ? JSON.stringify(studentContext)
      : "New student. Focus on foundational STEM concepts.";

    // 2. Call Gemini to generate 3 missions
    const prompt = `Based on this student's academic context (mastery and pending work): ${contextString}, generate 3 short, engaging "Learning Missions" (each 3-5 words). 
    IMPORTANT: Prioritize missions that help the student prepare for or complete their PENDING assignments if any exist. 
    Return them as a simple comma-separated string.`;

    const systemPrompt = "You are the Apollo Academy AI Coordinator. You create personalized, high-impact learning trajectories for STEM students.";

    let answer = "Master Linear Equations, Explore Cell Structures, Building Your First App"; // Fallback

    if (apiKey) {
      try {
        const aiResponse = await geminiService.generate(apiKey, prompt, systemPrompt);
        if (aiResponse) answer = aiResponse;
      } catch (e) {
        console.error("Mission generation failed, using fallbacks");
      }
    }

    const missions = answer.split(',').map(m => m.trim()).slice(0, 3);

    // 3. Log the activity
    if (c.env.DB) {
      await c.env.DB.prepare(
        'INSERT INTO progress_logs (id, student_id, tool_id, activity_type, performance_score, metadata) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind(
        crypto.randomUUID(),
        payload.id,
        'ai_hub',
        'GENERATE_MISSIONS',
        100,
        JSON.stringify({ missions })
      ).run();
    }

    return c.json({ success: true, missions });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
})

async function checkAchievements(db: D1Database, userId: string) {
  // Simple logic: If user has > 1 progress log, give them 'apprentice'
  const count = await db.prepare('SELECT COUNT(*) as c FROM progress_logs WHERE student_id = ?').bind(userId).first() as any;
  if (count.c >= 1) {
    await db.prepare('INSERT OR IGNORE INTO user_achievements (user_id, achievement_id) VALUES (?, ?)').bind(userId, 'apprentice').run();
  }
}

app.get('/teacher/dashboard', authMiddleware, roleMiddleware(['teacher']), (c) => {
  return c.json({ message: 'Welcome to the Teacher Dashboard' })
})

app.get('/api/teacher/dashboard-stats', authMiddleware, roleMiddleware(['teacher']), async (c) => {
  const stats = {
    students: 0,
    assignments: 0,
    submissions: 0,
    engagement: 0
  };

  if (c.env.DB) {
    try {
      const studentCount = await c.env.DB.prepare('SELECT COUNT(*) as c FROM users WHERE role = "student"').first() as any;
      const asgnCount = await c.env.DB.prepare('SELECT COUNT(*) as c FROM assignments').first() as any;
      const subCount = await c.env.DB.prepare('SELECT COUNT(*) as c FROM submissions WHERE status = "submitted"').first() as any;

      // Mock engagement based on recent logs
      const logs = await c.env.DB.prepare('SELECT COUNT(*) as c FROM progress_logs WHERE created_at > datetime("now", "-7 days")').first() as any;
      // Simple algorithm: engagement is high if more logs
      stats.engagement = Math.min(100, 80 + (logs.c * 2));

      stats.students = studentCount.c;
      stats.assignments = asgnCount.c;
      stats.submissions = subCount.c;
    } catch (e) {
      console.error('Stats fetch failed', e);
    }
  }

  return c.json(stats);
})

// Shared AI Generation Logic
async function handleAIGenerate(c: any) {
  const body = await c.req.json();
  const prompt = body.prompt;
  const toolKey = body.toolKey || 'math_solver'; // Default for simple prompts
  const payload = c.get('jwtPayload') as any;
  const apiKey = (c.env as any).GEMINI_API_KEY;

  try {
    let answer = "";

    // Realistic STEM Fallbacks for Demo Mode
    const fallbacks: Record<string, string> = {
      math_solver: "Calculated Solution:\n\n1. Identify Variables: We define the knowns and unknowns based on your input.\n2. Strategy: Apply the relevant mathematical properties (e.g., Distributive, Associative).\n3. Step-by-Step: Perform calculations with precision, ensuring each transformation is valid.\n4. Verification: Substitute the result back into the original expression to confirm accuracy.\n\n[Apollo STEM Academy: AI-Powered Learning Support]",
      worksheet_gen: "Apollo STEM Worksheet - Topic: Research Focus\n\nPart I: Targeted Practice\n- Concept Review: Foundational principles tailored to the selected grade.\n- Problem Set: 5 customized challenges designed to build mastery.\n\nPart II: Solution Key\n- Detailed explanations for each problem to reinforce the learning loop.\n\n[Apollo STEM Academy: Mission-Ready Curriculum]",
      science_lab: "Lab Protocol & Insight:\n\n- Scientific Context: Understanding the underlying physics/chemistry of the concept.\n- Experimental Design: Safe, effective steps to observe the phenomenon in action.\n- Data Analysis: What to look for and how to interpret your findings.\n\n[Apollo STEM Academy: Future-Ready Science Support]",
      study_guide: "Strategic Study Guide:\n\n- Essential Themes: The 'big ideas' you need to master for success.\n- Key Glossary: Definitions of critical terminology.\n- Retention Plan: Active recall questions and memorization techniques.\n\n[Apollo STEM Academy: Personalized Mastery Guide]"
    };

    answer = fallbacks[toolKey] || `Helpful response generated for ${toolKey}. Please describe your STEM project in more detail for a deeper analysis.`;

    if (apiKey) {
      try {
        const systemPrompt = "You are an expert STEM tutor at Apollo Academy. Provide a helpful, encouraging, and accurate answer to the student. CRITICAL: Do not use LaTeX formatting. Do not use dollar signs ($) for math. Use plain, readable text only.";
        const realAnswer = await geminiService.generate(apiKey, prompt, systemPrompt);
        if (realAnswer) answer = realAnswer;
      } catch (e: any) {
        console.error("Gemini Generation Failed Info:", { error: e.message, keyPrefix: apiKey.substring(0, 5) });
        // Fall back remains in 'answer'
      }
    } else {
      console.warn("GEMINI_API_KEY is missing from environment");
    }
    if (c.env.DB) {
      try {
        await c.env.DB.prepare(
          'INSERT INTO progress_logs (id, student_id, tool_id, activity_type, performance_score, metadata) VALUES (?, ?, ?, ?, ?, ?)'
        ).bind(
          crypto.randomUUID(),
          payload?.id || 'anonymous_user',
          toolKey,
          `AI_TOOL_${toolKey.toUpperCase()}`,
          85,
          JSON.stringify({ prompt, answer, source: 'ai_tool_endpoint' })
        ).run();
      } catch (dbError) {
        // Logging is secondary to functionality
      }
    }

    return c.json({ success: true, answer });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
}

// Centralized AI Tool Endpoint
app.post('/api/ai/generate', async (c) => {
  return handleAIGenerate(c);
});


// --- Google Classroom Integration (Phase 4/5) ---

// Check connection status
app.get('/api/student/classroom-link', authMiddleware, async (c) => {
  const payload = c.get('jwtPayload') as any;
  const userId = payload.id;

  if (!c.env.DB) return c.json({ link: '', connected: false });

  const result = await c.env.DB.prepare(
    'SELECT google_classroom_link FROM users WHERE id = ?'
  ).bind(userId).first() as any;

  return c.json({
    link: result?.google_classroom_link || '',
    connected: !!result?.google_classroom_link
  });
});

// Connect (save link)
app.post('/api/google/connect', authMiddleware, async (c) => {
  const payload = c.get('jwtPayload') as any;
  const userId = payload.id;
  const { link } = await c.req.json();

  if (c.env.DB) {
    await c.env.DB.prepare(
      'UPDATE users SET google_classroom_link = ? WHERE id = ?'
    ).bind(link, userId).run();
  }

  return c.json({ success: true });
});

// Disconnect
app.post('/api/google/disconnect', authMiddleware, async (c) => {
  const payload = c.get('jwtPayload') as any;
  const userId = payload.id;

  if (c.env.DB) {
    await c.env.DB.prepare(
      'UPDATE users SET google_classroom_link = NULL WHERE id = ?'
    ).bind(userId).run();
  }

  return c.json({ success: true });
});

app.post('/api/google/sync', authMiddleware, roleMiddleware(['student']), async (c) => {
  const payload = c.get('jwtPayload') as any;
  const { token: providedToken, link } = await c.req.json().catch(() => ({ token: null, link: null }));

  if (c.env.DB) {
    try {
      // If a link was provided during sync, save it
      if (link) {
        await c.env.DB.prepare('UPDATE users SET google_classroom_link = ? WHERE id = ?').bind(link, payload.id).run();
      }

      // Try to find a stored token
      let tokenToUse = providedToken;
      if (!tokenToUse) {
        const stored = await c.env.DB.prepare('SELECT access_token FROM google_oauth_tokens WHERE user_id = ?').bind(payload.id).first() as any;
        if (stored) tokenToUse = stored.access_token;
      }

      // 1. Real Sync Path (if token available)
      if (tokenToUse && (tokenToUse.startsWith('sq.') || tokenToUse.length > 20)) {
        const { googleClassroom } = await import('./google_classroom');
        const result = await googleClassroom.syncStudentCourses(c.env, tokenToUse, payload.id);
        return c.json({
          success: true,
          message: `Successfully synchronized! ${result.count} real assignments imported.`,
          imported: result.count
        });
      }

      // 2. Mock/Demo Sync Path (Default fallback if no real token)
      const mockClassId = 'default_class';
      const importedAssignments = [
        {
          id: 'imported_gc_1',
          title: '[Google Classroom] Physics: Motion Lab',
          description: 'Imported from GC: Submit your lab report on projectile motion.',
          section: 'Physics 101'
        },
        {
          id: 'imported_gc_2',
          title: '[Google Classroom] History: Civil War Essay',
          description: 'Imported from GC: Draft your 5-paragraph essay.',
          section: 'US History'
        }
      ];

      // Ensure student is enrolled in default_class
      await c.env.DB.prepare(
        'INSERT OR IGNORE INTO enrollments (student_id, class_id) VALUES (?, ?)'
      ).bind(payload.id, mockClassId).run();

      for (const asgn of importedAssignments) {
        await c.env.DB.prepare(
          'INSERT OR IGNORE INTO assignments (id, class_id, title, description, due_date) VALUES (?, ?, ?, ?, ?)'
        ).bind(asgn.id, mockClassId, asgn.title, asgn.description, 'Next Monday').run();
      }

      return c.json({
        success: true,
        message: "Demo Mode: Synced 2 sample assignments. (To use real Google Classroom, enable OAuth in admin setup).",
        imported: 2
      });

    } catch (e: any) {
      console.error('GC Sync failed', e);
      return c.json({ success: false, error: e.message }, 500);
    }
  }

  return c.json({ success: false, message: "Database not connected" }, 500);
});

export default app;
