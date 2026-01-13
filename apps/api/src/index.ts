import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { D1Database } from '@cloudflare/workers-types'
import { createToken, authMiddleware, roleMiddleware } from './auth'
import { aiIntelligence, geminiService } from './ai_services'
import { User } from '@apollo/types'

const app = new Hono<{ Bindings: { DB: D1Database } }>()

app.use('*', cors())

app.get('/', (c) => {
  return c.text('Apollo STEM Academy API')
})

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

    // In a real production app, you would check if the user exists in the DB
    // and create them if they don't. For now, we use the verified info:
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

// Protected Routes Example
app.get('/student/dashboard', authMiddleware, roleMiddleware(['student']), (c) => {
  return c.json({ message: 'Welcome to the Student Dashboard' })
})

// AI Intelligence Routes
app.get('/api/reports/:studentId', authMiddleware, roleMiddleware(['teacher', 'volunteer']), async (c) => {
  const studentId = c.req.param('studentId')
  // Accessing GEMINI_API_KEY from environment bindings
  const apiKey = (c.env as any).GEMINI_API_KEY
  const report = await aiIntelligence.generateNarrativeReport(c.env.DB, studentId, apiKey)
  return c.json(report)
})

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

  // In a real app, we'd have a parent_student_map table. 
  // For now, we mock finding the "first" student for this parent's email domain or similar.
  const student = await c.env.DB.prepare(
    'SELECT * FROM users WHERE role = "student" LIMIT 1'
  ).first();

  if (!student) return c.json({ error: 'No student found' }, 404);

  const progress = await c.env.DB.prepare(
    'SELECT * FROM progress_logs WHERE student_id = ? ORDER BY created_at DESC LIMIT 5'
  ).bind(student.id).all();

  const assignments = await c.env.DB.prepare(
    'SELECT * FROM assignments WHERE class_id IN (SELECT id FROM classes) LIMIT 5'
  ).all();

  return c.json({
    student,
    recentActivity: progress.results,
    activeAssignments: assignments.results
  });
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
  const apiKey = (c.env as any).GEMINI_API_KEY
  // In a real app, gather student progress data first
  const studentData = "Student showed improvement in Math (85%) but needs more help in Science worksheets."

  const prompt = `Synthesize this student data into a warm, encouraging 3-sentence summary for a parent. Focus on a "growth mindset" tone. Data: ${studentData}`

  // Use a simple fetch to Gemini for now as a lightweight worker pattern
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  const genData = await res.json() as any;
  const summary = genData.candidates?.[0]?.content?.parts?.[0]?.text || "Excellent progress this week! Encourage continued exploration of new STEM concepts.";

  return c.json({ summary });
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

app.get('/api/student/recommendations', authMiddleware, async (c) => {
  const payload = c.get('jwtPayload') as any;
  const apiKey = (c.env as any).GEMINI_API_KEY;
  const recs = await aiIntelligence.getStudentRecommendations(c.env.DB, payload.id, apiKey);
  return c.json(recs);
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

// Centralized AI Tool Endpoint
app.post('/api/ai/generate', authMiddleware, async (c) => {
  const { prompt, toolKey } = await c.req.json();
  const payload = c.get('jwtPayload') as any;
  const apiKey = (c.env as any).GEMINI_API_KEY;

  try {
    let answer = `This is a generated response for ${toolKey}. [AI Insight Placeholder]`;

    if (apiKey) {
      try {
        const systemPrompt = "You are an expert STEM tutor at Apollo Academy. Provide a helpful, encouraging, and accurate answer to the student.";
        answer = await geminiService.generate(apiKey, prompt, systemPrompt);
      } catch (e) {
        console.error("Gemini Generation Failed", e);
      }
    }

    // Log the activity
    await c.env.DB.prepare(
      'INSERT INTO progress_logs (id, student_id, tool_id, activity_type, performance_score, metadata) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(
      crypto.randomUUID(),
      payload.id,
      toolKey,
      `AI_TOOL_${toolKey.toUpperCase()}`,
      85, // Mock score for analysis
      JSON.stringify({ prompt, answer })
    ).run();

    // Trigger achievement check
    await checkAchievements(c.env.DB, payload.id);

    return c.json({ success: true, answer });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

export default app
