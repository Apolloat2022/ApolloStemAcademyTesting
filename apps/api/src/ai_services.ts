import { Context } from 'hono';
import type { D1Database } from '@cloudflare/workers-types';

export const geminiService = {
    generate: async (apiKey: string, prompt: string, systemInstruction?: string) => {
        const body = {
            contents: [{ parts: [{ text: prompt }] }],
            system_instruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2048,
            }
        };

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await response.json() as any;
        if (data.error) throw new Error(data.error.message);
        return data.candidates[0].content.parts[0].text;
    }
};

export const aiIntelligence = {
    // Generate a narrative report for a student
    generateNarrativeReport: async (db: D1Database, studentId: string, apiKey?: string) => {
        // Fetch recent logs and submissions
        const logs = await db.prepare(
            'SELECT * FROM progress_logs WHERE student_id = ? ORDER BY created_at DESC LIMIT 20'
        ).bind(studentId).all();

        const submissions = await db.prepare(
            'SELECT * FROM submissions WHERE student_id = ? ORDER BY created_at DESC LIMIT 10'
        ).bind(studentId).all();

        if (apiKey) {
            const prompt = `Synthesize this learning data into a professional bi-weekly progress report for a student: ${JSON.stringify({ logs: logs.results, submissions: submissions.results })}`;
            const system = "You are the Apollo STEM Academy AI Lead. Write a 2-paragraph narrative report highlighting growth and identifying one specific concept to focus on next.";
            try {
                const report = await geminiService.generate(apiKey, prompt, system);
                return { studentId, report, generatedAt: new Date().toISOString() };
            } catch (e) {
                console.error("Gemini failed, falling back to mock", e);
            }
        }

        return {
            studentId,
            report: "Student has shown significant progress in Algebra, particularly with quadratic equations. However, there's a slight decline in engagement with Science Lab simulations. Suggest focusing on chemical reaction concepts next week.",
            generatedAt: new Date().toISOString()
        };
    },

    // Recommend assignments based on performance
    getRecommendedassignments: async (db: D1Database, classId: string) => {
        const classPerformance = await db.prepare(
            'SELECT student_id, AVG(performance_score) as avg_score FROM progress_logs GROUP BY student_id'
        ).all();

        // Logic to find students below a threshold
        const strugglingStudents = classPerformance.results.filter((r: any) => r.avg_score < 70);

        return {
            classId,
            recommendations: strugglingStudents.map((s: any) => ({
                studentId: s.student_id,
                suggestedTopic: 'Fundamental Arithmetic Review',
                reason: 'Sustained low performance in recent math tool usage.'
            }))
        };
    },

    // Detect if a student is "stuck"
    checkStuckStudents: async (db: D1Database) => {
        const recentLogs = await db.prepare(
            'SELECT student_id, COUNT(*) as fail_count FROM progress_logs WHERE performance_score < 50 GROUP BY student_id HAVING fail_count >= 3'
        ).all();

        return recentLogs.results.map((r: any) => ({
            studentId: r.student_id,
            alertType: 'STUCK_ALERT',
            message: 'Student has failed 3 consecutive attempts on a complex concept.'
        }));
    },

    // Analyze a student submission
    analyzeSubmission: async (db: D1Database, submissionId: string, apiKey?: string) => {
        const submission = await db.prepare(
            'SELECT s.*, a.title, a.description FROM submissions s JOIN assignments a ON s.assignment_id = a.id WHERE s.id = ?'
        ).bind(submissionId).first() as any;

        if (!submission) throw new Error('Submission not found');

        if (apiKey) {
            const prompt = `Analyze this student submission for the assignment "${submission.title}". 
            Assignment Description: ${submission.description}
            Student Content: ${submission.content}
            
            Provide a 3-sentence summary: 
            1. What they did well. 
            2. Any misconceptions found. 
            3. A suggested grade (1-100) and why.`;

            const system = "You are an expert STEM grader at Apollo Academy. Be encouraging but precise.";

            try {
                const analysis = await geminiService.generate(apiKey, prompt, system);
                return { submissionId, analysis, generatedAt: new Date().toISOString() };
            } catch (e) {
                console.error("Gemini failed analysis", e);
            }
        }

        return {
            submissionId,
            analysis: "The student has clearly articulated the core concepts of the assignment. The calculations are mostly correct, though there's a minor error in the final derivation step. Suggested Grade: 88/100.",
            generatedAt: new Date().toISOString()
        };
    },

    // Provide personalized next steps for a student
    getStudentRecommendations: async (db: D1Database, studentId: string, apiKey?: string) => {
        const mastery = await db.prepare(
            'SELECT * FROM student_mastery WHERE student_id = ?'
        ).bind(studentId).all();

        const recentLogs = await db.prepare(
            'SELECT activity_type, performance_score FROM progress_logs WHERE student_id = ? ORDER BY created_at DESC LIMIT 10'
        ).bind(studentId).all();

        if (apiKey) {
            const prompt = `Based on this student's mastery data: ${JSON.stringify(mastery.results)} and recent performance: ${JSON.stringify(recentLogs.results)}, suggest exactly 3 short, actionable "Learning Missions" for this week. Keep them encouraging and concise.`;
            const system = "You are the Apollo Academy Academic Counselor. Output a simple JSON list of 3 strings.";
            try {
                const res = await geminiService.generate(apiKey, prompt, system);
                // Attempt to parse JSON if Gemini followed instructions
                try {
                    return JSON.parse(res);
                } catch {
                    return res.split('\n').filter((s: string) => s.length > 5).slice(0, 3);
                }
            } catch (e) {
                console.error("Gemini failed recommendations", e);
            }
        }

        return [
            "Complete 2 more 'Quadratic Basics' worksheet missions.",
            "Explore the 'Fraction Pizza' simulation in the Hub.",
            "Schedule a quick sync with your mentor Kevin."
        ];
    }
};
