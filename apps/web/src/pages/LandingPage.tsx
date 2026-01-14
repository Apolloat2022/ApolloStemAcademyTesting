import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CLOUDFLARE_WORKER_URL = 'https://apolloacademyaiteacher.revanaglobal.workers.dev/';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // AI Tool States
    const [mathProblem, setMathProblem] = useState('');
    const [mathOutput, setMathOutput] = useState<{ text: string, color: string } | null>(null);

    const [worksheetTopic, setWorksheetTopic] = useState('');
    const [worksheetGrade, setWorksheetGrade] = useState('Grade 1');
    const [worksheetOutput, setWorksheetOutput] = useState<{ text: string, color: string } | null>(null);

    const [scienceTopic, setScienceTopic] = useState('');
    const [scienceOutput, setScienceOutput] = useState<{ text: string, color: string } | null>(null);

    const [studyTopic, setStudyTopic] = useState('');
    const [studyLevel, setStudyLevel] = useState('Elementary School');
    const [studyOutput, setStudyOutput] = useState<{ text: string, color: string } | null>(null);

    // Call AI Helper
    const callRealAI = async (prompt: string) => {
        try {
            const res = await fetch(CLOUDFLARE_WORKER_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });
            const data = await res.json();
            return data.success ? data.answer : `Error: ${data.error}`;
        } catch (err: any) {
            return `AI unavailable: ${err.message}`;
        }
    };

    // Tool Handlers
    const handleMath = async () => {
        if (!mathProblem.trim()) {
            setMathOutput({ text: 'Please enter a math problem', color: 'text-red-400' });
            return;
        }
        setMathOutput({ text: '🤔 AI is solving your problem...', color: 'text-yellow-400' });
        const answer = await callRealAI(`Solve this math problem step by step for a student: ${mathProblem}. Explain each step clearly.`);
        setMathOutput({ text: answer, color: 'text-green-300' });
    };

    const handleWorksheet = async () => {
        if (!worksheetTopic.trim()) {
            setWorksheetOutput({ text: 'Please enter a topic', color: 'text-red-400' });
            return;
        }
        setWorksheetOutput({ text: '📘 AI is creating your worksheet...', color: 'text-yellow-400' });
        const answer = await callRealAI(`Create a ${worksheetGrade} math worksheet about ${worksheetTopic} with 5 problems. Include answers at the end. Make it appropriate for ${worksheetGrade} level.`);
        setWorksheetOutput({ text: answer, color: 'text-white' });
    };

    const handleScience = async () => {
        if (!scienceTopic.trim()) {
            setScienceOutput({ text: 'Please describe an experiment or science concept', color: 'text-red-400' });
            return;
        }
        setScienceOutput({ text: '🧪 AI is explaining the science...', color: 'text-yellow-400' });
        const answer = await callRealAI(`Explain this science experiment/concept for a student: ${scienceTopic}. Provide materials, steps, scientific principles, safety, and real-world applications.`);
        setScienceOutput({ text: answer, color: 'text-white' });
    };

    const handleStudyGuide = async () => {
        if (!studyTopic.trim()) {
            setStudyOutput({ text: 'Please enter a study topic', color: 'text-red-400' });
            return;
        }
        setStudyOutput({ text: '📘 AI is creating your study guide...', color: 'text-yellow-400' });
        const answer = await callRealAI(`Create a comprehensive study guide about ${studyTopic} for ${studyLevel} level. Include key concepts, definitions, examples, practice questions, and memory tricks.`);
        setStudyOutput({ text: answer, color: 'text-white' });
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-gray-800 text-white antialiased font-sans">
            {/* NAV */}
            <header className="max-w-6xl mx-auto p-4 md:p-6 fade-in">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center">
                            <span className="text-xl font-bold">A</span>
                        </div>
                        <div>
                            <h1 className="text-lg md:text-xl font-semibold">Apollo STEM Academy</h1>
                            <p className="text-xs text-gray-400 hidden md:block">AI-Powered Learning Tools</p>
                        </div>
                    </div>
                    <nav className="hidden md:flex items-center space-x-4">
                        <a href="#tools" className="text-gray-300 hover:text-white">AI Tools</a>
                        <a href="#enroll" className="text-gray-300 hover:text-white">Enroll</a>
                        <button onClick={() => navigate('/login')} className="ml-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded whitespace-nowrap">Student Login</button>
                    </nav>
                    <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-white focus:outline-none">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                    </button>
                </div>
                {mobileMenuOpen && (
                    <nav className="mt-4 pb-4 md:hidden flex flex-col space-y-3">
                        <a href="#tools" className="text-gray-300 hover:text-white" onClick={() => setMobileMenuOpen(false)}>AI Tools</a>
                        <a href="#enroll" className="text-gray-300 hover:text-white" onClick={() => setMobileMenuOpen(false)}>Enroll</a>
                        <button onClick={() => navigate('/login')} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded w-fit">Student Login</button>
                    </nav>
                )}
            </header>

            {/* HERO */}
            <main className="py-16 md:py-20">
                <section className="max-w-6xl mx-auto px-4 md:px-6">
                    <div className="text-center fade-in">
                        <h2 className="text-4xl md:text-5xl font-extrabold leading-tight gradient-shift">AI-Powered Learning Tools</h2>
                        <p className="mt-4 md:mt-6 text-gray-300 max-w-xl mx-auto">Instant AI helpers for students - no login required. Get step-by-step solutions and personalized learning support.</p>
                    </div>
                </section>
            </main>

            {/* AI TOOLS */}
            <section id="tools" className="max-w-6xl mx-auto px-4 md:px-6 py-10 md:py-12 fade-in">
                <h3 className="text-2xl font-bold text-center mb-8">Free AI Learning Tools</h3>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Math Solver */}
                    <div className="glass rounded-2xl border border-gray-700 p-6">
                        <h4 className="text-xl font-semibold mb-4">Math Problem Solver</h4>
                        <textarea
                            value={mathProblem}
                            onChange={(e) => setMathProblem(e.target.value)}
                            rows={3}
                            placeholder={`Enter any math problem...\nExample: Solve 2x + 5 = 15\nExample: Find derivative of x² + 3x\nExample: Calculate area of a circle with radius 5`}
                            className="w-full px-4 py-3 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-300 mb-4 text-white"
                        />
                        <button onClick={handleMath} className="w-full px-4 py-3 bg-yellow-400 text-black rounded font-semibold hover:scale-105 transition">Get Step-by-Step Solution</button>
                        {mathOutput && (
                            <div className={`mt-4 p-4 rounded bg-gray-900 border border-gray-700 text-sm whitespace-pre-wrap ${mathOutput.color}`}>
                                {mathOutput.text}
                            </div>
                        )}
                    </div>

                    {/* Worksheet Generator */}
                    <div className="glass rounded-2xl border border-gray-700 p-6">
                        <h4 className="text-xl font-semibold mb-4">Worksheet Generator</h4>
                        <input
                            type="text"
                            value={worksheetTopic}
                            onChange={(e) => setWorksheetTopic(e.target.value)}
                            placeholder="Topic (e.g., Fractions, Algebra, Geometry)"
                            className="w-full px-4 py-3 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-300 mb-4 text-white"
                        />
                        <select
                            value={worksheetGrade}
                            onChange={(e) => setWorksheetGrade(e.target.value)}
                            className="w-full px-4 py-3 rounded bg-gray-800 border border-gray-700 mb-4 text-white"
                        >
                            {['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'].map(g => (
                                <option key={g} value={g}>{g}</option>
                            ))}
                        </select>
                        <button onClick={handleWorksheet} className="w-full px-4 py-3 bg-indigo-600 text-white rounded font-semibold hover:scale-105 transition">Generate Practice Worksheet</button>
                        {worksheetOutput && (
                            <div className={`mt-4 p-4 rounded bg-gray-900 border border-gray-700 text-sm whitespace-pre-wrap ${worksheetOutput.color}`}>
                                {worksheetOutput.text}
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mt-8">
                    {/* Science Lab Assistant */}
                    <div className="glass rounded-2xl border border-gray-700 p-6">
                        <h4 className="text-xl font-semibold mb-4">Science Lab Assistant</h4>
                        <textarea
                            value={scienceTopic}
                            onChange={(e) => setScienceTopic(e.target.value)}
                            rows={3}
                            placeholder={`Describe an experiment or ask about a science concept...\nExamples:\n- Photosynthesis process\n- Chemical reactions\n- Newton's laws of motion`}
                            className="w-full px-4 py-3 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-300 mb-4 text-white"
                        />
                        <button onClick={handleScience} className="w-full px-4 py-3 bg-green-600 text-white rounded font-semibold hover:scale-105 transition">Explain Science Concept</button>
                        {scienceOutput && (
                            <div className={`mt-4 p-4 rounded bg-gray-900 border border-gray-700 text-sm whitespace-pre-wrap ${scienceOutput.color}`}>
                                {scienceOutput.text}
                            </div>
                        )}
                    </div>

                    {/* Study Guide Generator */}
                    <div className="glass rounded-2xl border border-gray-700 p-6">
                        <h4 className="text-xl font-semibold mb-4">Study Guide Generator</h4>
                        <input
                            type="text"
                            value={studyTopic}
                            onChange={(e) => setStudyTopic(e.target.value)}
                            placeholder="Topic (e.g., World War II, Algebra, Cell Biology)"
                            className="w-full px-4 py-3 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-300 mb-4 text-white"
                        />
                        <select
                            value={studyLevel}
                            onChange={(e) => setStudyLevel(e.target.value)}
                            className="w-full px-4 py-3 rounded bg-gray-800 border border-gray-700 mb-4 text-white"
                        >
                            {['Elementary School', 'Middle School', 'High School', 'College'].map(l => (
                                <option key={l} value={l}>{l}</option>
                            ))}
                        </select>
                        <button onClick={handleStudyGuide} className="w-full px-4 py-3 bg-amber-600 text-white rounded font-semibold hover:scale-105 transition">Generate Study Guide</button>
                        {studyOutput && (
                            <div className={`mt-4 p-4 rounded bg-gray-900 border border-gray-700 text-sm whitespace-pre-wrap ${studyOutput.color}`}>
                                {studyOutput.text}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* ENROLLMENT */}
            <section id="enroll" className="max-w-4xl mx-auto p-6 md:p-8 mt-12 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl border border-gray-700 fade-in">
                <h3 className="text-2xl font-bold text-center">Limited Founding Enrollment</h3>
                <p className="mt-3 text-gray-300 text-center">We are offering free access to the first 50 students for a limited time.</p>
                <div className="mt-6 text-center">
                    <a href="https://docs.google.com/forms/d/e/1FAIpQLSchUXzauH_d0SQaKhAhS7To2Op07CUkGcsLrxaNqpXLzvx2jQ/viewform" target="_blank" className="inline-block px-6 py-3 bg-yellow-400 text-black rounded font-semibold hover:scale-105 transition">Apply for Free Access</a>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="max-w-6xl mx-auto p-6 mt-12 border-t border-gray-800 text-gray-400 text-center">
                <div>© 2026 Apollo STEM Academy — AI Learning Tools</div>
                <div className="text-sm mt-2">Contact: <a href="mailto:Robinpandey@apollotunes.com" className="text-yellow-300">Robinpandey@apollotunes.com</a></div>
            </footer>
        </div>
    );
};

export default LandingPage;
