import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Star, Globe, Heart, BookOpen, Microscope, Code, Calculator, Atom, Zap, FileText, UserPlus } from 'lucide-react';

const CLOUDFLARE_WORKER_URL = 'https://apolloacademyaiteacher.revanaglobal.workers.dev/api/ai/generate';

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
    const callRealAI = async (prompt: string, toolKey: string = 'general') => {
        try {
            const res = await fetch(CLOUDFLARE_WORKER_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, toolKey })
            });

            const text = await res.text();
            console.log('AI Worker Raw Response:', text);

            try {
                const data = JSON.parse(text);
                return data.success ? data.answer : `Error: ${data.error}`;
            } catch (jsonErr) {
                // If it's not JSON, maybe it's the raw answer or an error message
                if (text.length > 0 && (text.includes('{') || text.includes('}'))) {
                    throw new Error(`Invalid JSON format: ${text.substring(0, 50)}...`);
                }
                return text || 'Empty response from AI worker';
            }
        } catch (err: any) {
            console.error('AI Fetch Error:', err);
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
        const answer = await callRealAI(`Solve this math problem step by step for a student: ${mathProblem}. Explain each step clearly.`, 'math_solver');
        setMathOutput({ text: answer, color: 'text-green-300' });
    };

    const handleWorksheet = async () => {
        if (!worksheetTopic.trim()) {
            setWorksheetOutput({ text: 'Please enter a topic', color: 'text-red-400' });
            return;
        }
        setWorksheetOutput({ text: '📘 AI is creating your worksheet...', color: 'text-yellow-400' });
        const answer = await callRealAI(`Create a ${worksheetGrade} math worksheet about ${worksheetTopic} with 5 problems. Include answers at the end. Make it appropriate for ${worksheetGrade} level.`, 'worksheet_gen');
        setWorksheetOutput({ text: answer, color: 'text-white' });
    };

    const handleScience = async () => {
        if (!scienceTopic.trim()) {
            setScienceOutput({ text: 'Please describe an experiment or science concept', color: 'text-red-400' });
            return;
        }
        setScienceOutput({ text: '🧪 AI is explaining the science...', color: 'text-yellow-400' });
        const answer = await callRealAI(`Explain this science experiment/concept for a student: ${scienceTopic}. Provide materials, steps, scientific principles, safety, and real-world applications.`, 'science_lab');
        setScienceOutput({ text: answer, color: 'text-white' });
    };

    const handleStudyGuide = async () => {
        if (!studyTopic.trim()) {
            setStudyOutput({ text: 'Please enter a study topic', color: 'text-red-400' });
            return;
        }
        setStudyOutput({ text: '📘 AI is creating your study guide...', color: 'text-yellow-400' });
        const answer = await callRealAI(`Create a comprehensive study guide about ${studyTopic} for ${studyLevel} level. Include key concepts, definitions, examples, practice questions, and memory tricks.`, 'study_guide');
        setStudyOutput({ text: answer, color: 'text-white' });
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-gray-800 text-white antialiased font-sans">
            {/* NAV */}
            <header className="max-w-6xl mx-auto p-4 md:p-6 fade-in sticky top-0 z-50 bg-gray-900/90 backdrop-blur-md border-b border-gray-800">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 md:gap-4">
                        <img src="/logo.png" alt="Apollo Logo" style={{ height: '220px', width: 'auto', minWidth: '220px' }} className="object-contain" />
                        <div>
                            <h1 className="text-lg md:text-xl font-semibold tracking-tight">Apollo STEM Academy</h1>
                            <p className="text-xs text-gray-400 hidden md:block">AI-Powered Learning Tools</p>
                        </div>
                    </div>
                    <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
                        <a href="#about" className="text-gray-300 hover:text-white transition">About</a>
                        <a href="#subjects" className="text-gray-300 hover:text-white transition">Subjects</a>
                        <a href="#tools" className="text-gray-300 hover:text-white transition">AI Tools</a>
                        <a href="#enroll" className="text-gray-300 hover:text-white transition">Volunteer</a>
                        <a href="#sponsors" className="text-gray-300 hover:text-white transition">Sponsors</a>
                        <button onClick={() => navigate('/login')} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded text-white transition">Login</button>
                    </nav>
                    <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-white focus:outline-none">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                    </button>
                </div>
                {mobileMenuOpen && (
                    <nav className="mt-4 pb-4 md:hidden flex flex-col space-y-3 border-t border-gray-800 pt-4">
                        <a href="#about" className="text-gray-300 hover:text-white" onClick={() => setMobileMenuOpen(false)}>About</a>
                        <a href="#subjects" className="text-gray-300 hover:text-white" onClick={() => setMobileMenuOpen(false)}>Subjects</a>
                        <a href="#tools" className="text-gray-300 hover:text-white" onClick={() => setMobileMenuOpen(false)}>AI Tools</a>
                        <a href="#enroll" className="text-gray-300 hover:text-white" onClick={() => setMobileMenuOpen(false)}>Volunteer</a>
                        <a href="#sponsors" className="text-gray-300 hover:text-white" onClick={() => setMobileMenuOpen(false)}>Sponsors</a>
                        <button onClick={() => navigate('/login')} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded w-fit">Login</button>
                    </nav>
                )}
            </header>

            {/* HERO */}
            <main className="py-20 md:py-28 relative overflow-hidden">
                <section className="max-w-6xl mx-auto px-4 md:px-6 relative z-10">
                    <div className="text-center fade-in max-w-3xl mx-auto">
                        <div className="inline-block px-4 py-1 mb-6 rounded-full bg-indigo-900/30 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-widest">
                            The Future of Education
                        </div>
                        <h2 className="text-5xl md:text-7xl font-extrabold leading-tight gradient-shift mb-6">
                            Master STEM & AP Courses with AI
                        </h2>
                        <p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-10">
                            Expert-led tutoring for <span className="text-indigo-400 font-bold">AP Physics, Calculus, & Computer Science</span>. <br className="hidden md:block" />
                            Personalized learning powered by advanced AI and guided by expert mentors.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <a href="#enroll" className="px-8 py-4 bg-yellow-400 text-black font-bold rounded-lg hover:scale-105 transition shadow-lg shadow-yellow-400/20">
                                Apply for Fall 2026
                            </a>
                            <a href="#tools" className="px-8 py-4 bg-gray-800 border border-gray-700 text-white font-bold rounded-lg hover:bg-gray-700 transition">
                                Try AI Tools Free
                            </a>
                        </div>
                    </div>
                </section>
            </main>

            {/* ABOUT SECTION */}
            <section id="about" className="py-20 bg-gray-900 border-y border-gray-800 scroll-mt-64">
                <div className="max-w-6xl mx-auto px-4 md:px-6">
                    <div className="text-center mb-16">
                        <h3 className="text-3xl font-bold mb-4 text-white">Why Apollo STEM Academy?</h3>
                        <p className="text-gray-400 max-w-2xl mx-auto">We bridge the gap between traditional education and future technology with a unique hybrid model.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="p-8 bg-gray-800 rounded-2xl border border-gray-700">
                            <div className="w-12 h-12 bg-indigo-900/50 rounded-lg flex items-center justify-center text-indigo-400 mb-6"><Atom /></div>
                            <h4 className="text-xl font-bold mb-3">AI-Native Curriculum</h4>
                            <p className="text-gray-400">Our courses adapt in real-time to your learning pace, offering personalized challenges and support.</p>
                        </div>
                        <div className="p-8 bg-gray-800 rounded-2xl border border-gray-700">
                            <div className="w-12 h-12 bg-purple-900/50 rounded-lg flex items-center justify-center text-purple-400 mb-6"><Heart /></div>
                            <h4 className="text-xl font-bold mb-3">Human Mentorship</h4>
                            <p className="text-gray-400">Expert teachers review your work, providing the empathy and creative guidance AI cannot match.</p>
                        </div>
                        <div className="p-8 bg-gray-800 rounded-2xl border border-gray-700">
                            <div className="w-12 h-12 bg-green-900/50 rounded-lg flex items-center justify-center text-green-400 mb-6"><Zap /></div>
                            <h4 className="text-xl font-bold mb-3">Future-Ready Skills</h4>
                            <p className="text-gray-400">Focus on problem-solving, coding, and critical thinking skills needed for the 21st century workforce.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* SUBJECTS SECTION */}
            <section id="subjects" className="py-20 scroll-mt-64">
                <div className="max-w-6xl mx-auto px-4 md:px-6">
                    <div className="text-center mb-16">
                        <h3 className="text-3xl font-bold mb-4 text-white">Core Subjects</h3>
                        <div className="h-1 w-20 bg-indigo-600 mx-auto rounded"></div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { name: 'Mathematics', icon: Calculator, color: 'text-blue-400' },
                            { name: 'Science', icon: Microscope, color: 'text-green-400' },
                            { name: 'Computer Science', icon: Code, color: 'text-purple-400' },
                            { name: 'Language Arts', icon: BookOpen, color: 'text-yellow-400' },
                        ].map((sub, i) => (
                            <div key={i} className="p-6 bg-gray-800/50 rounded-xl border border-gray-700 text-center hover:bg-gray-800 transition cursor-default">
                                <div className={`mb-4 inline-block p-3 rounded-full bg-gray-900 ${sub.color}`}>
                                    <sub.icon size={28} />
                                </div>
                                <h4 className="font-semibold">{sub.name}</h4>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* AI TOOLS */}
            <section id="tools" className="max-w-6xl mx-auto px-4 md:px-6 py-20 border-t border-gray-800 scroll-mt-64">
                <div className="text-center mb-12">
                    <span className="text-indigo-400 font-bold tracking-widest uppercase text-xs">Interactive Demo</span>
                    <h3 className="text-3xl font-bold mt-2">Free AI Learning Tools</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Math Solver */}
                    <div className="glass rounded-2xl border border-gray-700 p-6 hover:border-gray-600 transition">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-yellow-400/10 rounded text-yellow-400"><Calculator size={20} /></div>
                            <h4 className="text-xl font-semibold">Math Problem Solver</h4>
                        </div>
                        <textarea
                            value={mathProblem}
                            onChange={(e) => setMathProblem(e.target.value)}
                            rows={3}
                            placeholder={`Enter any math problem...\nExample: Solve 2x + 5 = 15`}
                            className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 focus:outline-none focus:border-yellow-400 mb-4 text-white placeholder-gray-500"
                        />
                        <button onClick={handleMath} className="w-full px-4 py-3 bg-yellow-400 text-black rounded-lg font-bold hover:bg-yellow-300 transition">Get Step-by-Step Solution</button>
                        {mathOutput && (
                            <div className={`mt-4 p-4 rounded bg-black/40 border border-gray-700 text-sm whitespace-pre-wrap ${mathOutput.color}`}>
                                {mathOutput.text}
                            </div>
                        )}
                    </div>

                    {/* Worksheet Generator */}
                    <div className="glass rounded-2xl border border-gray-700 p-6 hover:border-gray-600 transition">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-400/10 rounded text-blue-400"><FileText size={20} /></div>
                            <h4 className="text-xl font-semibold">Worksheet Generator</h4>
                        </div>
                        <input
                            type="text"
                            value={worksheetTopic}
                            onChange={(e) => setWorksheetTopic(e.target.value)}
                            placeholder="Topic (e.g., Fractions)"
                            className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 focus:outline-none focus:border-blue-400 mb-4 text-white"
                        />
                        <select
                            value={worksheetGrade}
                            onChange={(e) => setWorksheetGrade(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 mb-4 text-gray-300"
                        >
                            {['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'].map(g => (
                                <option key={g} value={g}>{g}</option>
                            ))}
                        </select>
                        <button onClick={handleWorksheet} className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-500 transition">Generate Worksheet</button>
                        {worksheetOutput && (
                            <div className={`mt-4 p-4 rounded bg-black/40 border border-gray-700 text-sm whitespace-pre-wrap ${worksheetOutput.color}`}>
                                {worksheetOutput.text}
                            </div>
                        )}
                    </div>

                    {/* Science Lab Assistant */}
                    <div className="glass rounded-2xl border border-gray-700 p-6 hover:border-gray-600 transition">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-green-400/10 rounded text-green-400"><Microscope size={20} /></div>
                            <h4 className="text-xl font-semibold">Science Lab Assistant</h4>
                        </div>
                        <textarea
                            value={scienceTopic}
                            onChange={(e) => setScienceTopic(e.target.value)}
                            rows={3}
                            placeholder={`Describe an experiment...\nExample: Photosynthesis process`}
                            className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 focus:outline-none focus:border-green-400 mb-4 text-white placeholder-gray-500"
                        />
                        <button onClick={handleScience} className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-500 transition">Explain Science Concept</button>
                        {scienceOutput && (
                            <div className={`mt-4 p-4 rounded bg-black/40 border border-gray-700 text-sm whitespace-pre-wrap ${scienceOutput.color}`}>
                                {scienceOutput.text}
                            </div>
                        )}
                    </div>

                    {/* Study Guide Generator */}
                    <div className="glass rounded-2xl border border-gray-700 p-6 hover:border-gray-600 transition">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-amber-400/10 rounded text-amber-400"><BookOpen size={20} /></div>
                            <h4 className="text-xl font-semibold">Study Guide Generator</h4>
                        </div>
                        <input
                            type="text"
                            value={studyTopic}
                            onChange={(e) => setStudyTopic(e.target.value)}
                            placeholder="Topic (e.g., World War II)"
                            className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 focus:outline-none focus:border-amber-400 mb-4 text-white"
                        />
                        <select
                            value={studyLevel}
                            onChange={(e) => setStudyLevel(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 mb-4 text-gray-300"
                        >
                            {['Elementary School', 'Middle School', 'High School', 'College'].map(l => (
                                <option key={l} value={l}>{l}</option>
                            ))}
                        </select>
                        <button onClick={handleStudyGuide} className="w-full px-4 py-3 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-500 transition">Generate Study Guide</button>
                        {studyOutput && (
                            <div className={`mt-4 p-4 rounded bg-black/40 border border-gray-700 text-sm whitespace-pre-wrap ${studyOutput.color}`}>
                                {studyOutput.text}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* ENROLLMENT & VOLUNTEER */}
            <section id="enroll" className="py-20 bg-indigo-900/10 border-t border-gray-800 scroll-mt-64">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold mb-4 text-white">Join Our Mission</h2>
                    <div className="mb-10 p-6 bg-yellow-400/10 border border-yellow-400/20 rounded-2xl max-w-2xl mx-auto">
                        <p className="text-2xl font-black text-white mb-2">$15 Enrollment Fee</p>
                        <p className="text-yellow-400 font-bold uppercase tracking-widest text-sm">Limited Time Offer</p>
                        <p className="text-gray-300 mt-4">The first <span className="text-white font-bold text-lg">50 students</span> receive <span className="text-green-400 font-bold text-lg underline">FREE</span> enrollment!</p>
                    </div>

                    <div id="volunteer" className="grid md:grid-cols-2 gap-8">
                        <div className="p-8 bg-gray-800 rounded-2xl border border-gray-700 text-left relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition"><UserPlus size={40} /></div>
                            <h4 className="text-xl font-bold mb-2">Student Enrollment</h4>
                            <p className="text-gray-400 text-sm mb-6">Apply for our limited founding cohort. Open to grades 1-12.</p>
                            <a href="https://docs.google.com/forms/d/e/1FAIpQLSchUXzauH_d0SQaKhAhS7To2Op07CUkGcsLrxaNqpXLzvx2jQ/viewform" target="_blank" className="block w-full py-3 bg-yellow-400 text-black text-center font-bold rounded hover:bg-yellow-300 transition">Student Application</a>
                        </div>
                        <div className="p-8 bg-gray-800 rounded-2xl border border-gray-700 text-left relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition"><Heart size={40} /></div>
                            <h4 className="text-xl font-bold mb-2">Volunteer Faculty</h4>
                            <p className="text-gray-400 text-sm mb-6">Join us as a teacher, mentor, or curriculum developer.</p>
                            <a href="https://docs.google.com/forms/d/e/1FAIpQLSeXDLtEx-oIcMUORk8vyQkQD-sKMwpfR5a5YPEFKMahhAT8nQ/viewform" target="_blank" className="block w-full py-3 bg-indigo-600 text-white text-center font-bold rounded hover:bg-indigo-500 transition">Volunteer Application</a>
                        </div>
                    </div>
                </div>
            </section>

            {/* SPONSORS */}
            <section id="sponsors" className="py-20 border-t border-gray-800 bg-black/20 scroll-mt-64">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h3 className="text-3xl font-bold text-white mb-2">Our Sponsors</h3>
                        <p className="text-gray-500">Powering the future of STEM education</p>
                    </div>
                    <div className="grid md:grid-cols-4 gap-6">
                        {/* Platinum */}
                        <div className="p-8 bg-gray-800/50 rounded-2xl border border-gray-700 hover:border-yellow-400/50 transition text-center group">
                            <div className="mb-4 text-yellow-400 mx-auto w-fit p-3 bg-yellow-400/10 rounded-full group-hover:scale-110 transition"><Award size={32} /></div>
                            <h4 className="text-lg font-bold text-white mb-2">Platinum</h4>
                            <p className="text-2xl font-bold text-yellow-400 my-2">$10k</p>
                            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Sponsor</p>
                        </div>
                        {/* Gold */}
                        <div className="p-8 bg-gray-800/50 rounded-2xl border border-gray-700 hover:border-yellow-600/50 transition text-center group">
                            <div className="mb-4 text-yellow-600 mx-auto w-fit p-3 bg-yellow-600/10 rounded-full group-hover:scale-110 transition"><Star size={32} /></div>
                            <h4 className="text-lg font-bold text-white mb-2">Gold</h4>
                            <p className="text-2xl font-bold text-yellow-600 my-2">$5k</p>
                            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Sponsor</p>
                        </div>
                        {/* Visionary */}
                        <div className="p-8 bg-gray-800/50 rounded-2xl border border-gray-700 hover:border-purple-400/50 transition text-center group">
                            <div className="mb-4 text-purple-400 mx-auto w-fit p-3 bg-purple-400/10 rounded-full group-hover:scale-110 transition"><Zap size={32} /></div>
                            <h4 className="text-lg font-bold text-white mb-2">Visionary</h4>
                            <p className="text-2xl font-bold text-purple-400 my-2">$1k</p>
                            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Sponsor</p>
                        </div>
                        {/* Community */}
                        <div className="p-8 bg-gray-800/50 rounded-2xl border border-gray-700 hover:border-green-400/50 transition text-center group">
                            <div className="mb-4 text-green-400 mx-auto w-fit p-3 bg-green-400/10 rounded-full group-hover:scale-110 transition"><Heart size={32} /></div>
                            <h4 className="text-lg font-bold text-white mb-2">Community</h4>
                            <p className="text-2xl font-bold text-green-400 my-2">$50</p>
                            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Partner</p>
                        </div>
                    </div>
                    <div className="text-center mt-12">
                        <a href="https://docs.google.com/forms/d/e/1FAIpQLSfOTUSXYJbQM9S9k5sTrr6TNTWnAGGwc4G3wjNuSMTdJdmaUQ/viewform?usp=publish-editor" target="_blank" className="inline-flex items-center gap-2 px-8 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg text-white font-semibold transition">
                            <Globe size={16} /> Become a Sponsor
                        </a>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="max-w-6xl mx-auto p-6 mt-12 border-t border-gray-800 text-gray-500 text-center text-sm">
                <div className="mb-4">© 2026 Apollo STEM Academy — AI Learning Tools</div>
                <div>Contact: <a href="mailto:Robinpandey@apollotunes.com" className="text-indigo-400 hover:text-indigo-300">Robinpandey@apollotunes.com</a></div>
            </footer>
        </div>
    );
};

export default LandingPage;
