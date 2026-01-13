import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { authService } from '../services/authService';
import {
    Sparkles,
    Calculator,
    FileText,
    Beaker,
    Globe,
    ShieldCheck,
    ArrowRight,
    ChevronRight,
    Zap,
    CheckCircle2,
    Menu,
    X
} from 'lucide-react';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [mathProblem, setMathProblem] = useState('');
    const [mathSolution, setMathSolution] = useState<string | null>(null);
    const [isSolving, setIsSolving] = useState(false);

    const solveMath = async () => {
        if (!mathProblem) return;
        setIsSolving(true);
        try {
            // Check if we have a token, otherwise use a public/mock flow
            const token = authService.getToken() || 'public_demo_token';
            const res = await axios.post('/api/ai/generate', {
                prompt: mathProblem,
                toolKey: 'math',
                systemPrompt: 'Solve this math problem step by step for a student. Explain each step clearly.'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMathSolution(res.data.answer);
        } catch (err) {
            console.error('AI Solver failed', err);
            setMathSolution("The AI tutor is currently busy assisting other students. Please try again in a moment! ✨");
        } finally {
            setIsSolving(false);
        }
    };

    return (
        <div className="min-h-screen bg-apollo-dark text-white font-sans selection:bg-apollo-indigo/30">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 glass border-b border-white/5 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="Apollo Logo" className="w-10 h-10 rounded-full" />
                        <span className="text-xl font-bold tracking-tight">Apollo STEM Academy</span>
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
                        <a href="#about" className="hover:text-white transition-colors">About</a>
                        <a href="#subjects" className="hover:text-white transition-colors">Subjects</a>
                        <a href="#enroll" className="hover:text-white transition-colors">Enroll</a>
                        <a href="#sponsors" className="hover:text-white transition-colors">Sponsors</a>
                        <button
                            onClick={() => navigate('/login')}
                            className="bg-apollo-indigo text-white px-5 py-2 rounded-xl font-bold hover:scale-105 transition-all shadow-lg shadow-apollo-indigo/20"
                        >
                            Student Login
                        </button>
                    </div>

                    <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 w-full glass border-b border-white/10 p-6 flex flex-col gap-4 animate-in slide-in-from-top-2">
                        <a href="#about" className="text-gray-400 font-bold" onClick={() => setIsMenuOpen(false)}>About</a>
                        <a href="#subjects" className="text-gray-400 font-bold" onClick={() => setIsMenuOpen(false)}>Subjects</a>
                        <a href="#enroll" className="text-gray-400 font-bold" onClick={() => setIsMenuOpen(false)}>Enroll</a>
                        <button
                            onClick={() => navigate('/login')}
                            className="bg-apollo-indigo text-white px-5 py-3 rounded-xl font-bold"
                        >
                            Student Login
                        </button>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <main className="pt-32 pb-20 px-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-apollo-indigo/10 blur-[120px] rounded-full -mr-64 -mt-32" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-yellow-500/5 blur-[120px] rounded-full -ml-64 -mb-32" />

                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                    <div className="fade-in">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-apollo-indigo/10 border border-apollo-indigo/20 text-apollo-indigo font-bold text-xs uppercase tracking-widest mb-8">
                            <Sparkles size={14} /> Intelligence Meets Education
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black leading-tight mb-8">
                            Private, AI-powered <br />
                            <span className="gradient-shift">STEM Excellence.</span>
                        </h1>
                        <p className="text-lg text-gray-400 leading-relaxed mb-10 max-w-xl">
                            Apollo STEM Academy offers personalized lessons and practice for Grades 1–12.
                            Experience high-scale AI tutoring guided by real world-class teachers.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button className="px-8 py-4 bg-yellow-400 text-black font-black rounded-2xl hover:scale-105 transition-all shadow-xl shadow-yellow-400/20 flex items-center justify-center gap-2">
                                Apply for Free <ArrowRight size={20} />
                            </button>
                            <button className="px-8 py-4 glass border-white/10 text-white font-bold rounded-2xl hover:bg-white/5 transition-all flex items-center justify-center gap-2">
                                Explore Subjects <ChevronRight size={20} />
                            </button>
                        </div>
                        <div className="mt-12 grid grid-cols-3 gap-8">
                            <div>
                                <div className="text-2xl font-black text-white">50</div>
                                <div className="text-xs text-gray-500 uppercase font-bold tracking-widest">Free Spots</div>
                            </div>
                            <div>
                                <div className="text-2xl font-black text-white">$15</div>
                                <div className="text-xs text-gray-500 uppercase font-bold tracking-widest">Promo Price</div>
                            </div>
                            <div>
                                <div className="text-2xl font-black text-white">1-12</div>
                                <div className="text-xs text-gray-500 uppercase font-bold tracking-widest">Grade Levels</div>
                            </div>
                        </div>
                    </div>

                    {/* Interactive Demo */}
                    <div className="relative fade-in-delay">
                        <div className="glass rounded-[40px] p-8 md:p-12 border-white/5 relative z-10 animate-float shadow-2xl">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                                    <Calculator className="text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">AI Math Solver</h3>
                                    <p className="text-xs text-gray-500">Live Demo — Powered by Apollo AI</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <input
                                    type="text"
                                    value={mathProblem}
                                    onChange={(e) => setMathProblem(e.target.value)}
                                    placeholder="e.g. 2x + 5 = 15"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-blue-400 transition-all text-white placeholder:text-gray-600"
                                />
                                <button
                                    onClick={solveMath}
                                    disabled={isSolving}
                                    className={`w-full py-4 rounded-2xl font-bold transition-all ${isSolving ? 'bg-blue-400/20 text-blue-400 animate-pulse' : 'bg-blue-400 text-white hover:scale-[1.02] shadow-xl shadow-blue-400/20'}`}
                                >
                                    {isSolving ? 'Analyzing Problem...' : 'Solve with AI'}
                                </button>
                            </div>

                            {mathSolution && (
                                <div className="mt-8 p-6 bg-white/5 rounded-3xl border border-white/5 animate-in zoom-in duration-300">
                                    <p className="text-sm text-gray-300 whitespace-pre-line leading-relaxed italic">
                                        "{mathSolution}"
                                    </p>
                                </div>
                            )}
                        </div>
                        {/* Decorative elements */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] border border-white/5 rounded-[60px] pointer-events-none" />
                        <div className="absolute -top-10 -right-10 w-24 h-24 bg-yellow-400/20 blur-[40px] rounded-full" />
                    </div>
                </div>
            </main>

            {/* Features Preview */}
            <section id="subjects" className="py-24 px-6 bg-white/[0.02]">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-5xl font-black mb-6">Core STEM Disciplines</h2>
                        <p className="text-gray-500 max-w-2xl mx-auto italic">Advanced learning protocols for the next generation of innovators.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { title: 'Mathematics', desc: 'From Arithmetic to Calculus. AI lessons + deep practice.', icon: Calculator, color: 'text-blue-400', delay: 'delay-0' },
                            { title: 'Science', desc: 'Physical, Earth, and Life science with interactive experiments.', icon: Beaker, color: 'text-green-400', delay: 'delay-100' },
                            { title: 'Language Arts', desc: 'Grammar, reading comprehension, and creative writing prompts.', icon: FileText, color: 'text-yellow-400', delay: 'delay-200' },
                        ].map((feat, idx) => (
                            <div key={idx} className={`glass p-10 rounded-[40px] border-white/5 hover:border-apollo-indigo/30 transition-all group hover:scale-105 duration-300`}>
                                <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mb-8 border border-white/10 group-hover:bg-apollo-indigo/10 group-hover:border-apollo-indigo/20 transition-all">
                                    <feat.icon className={feat.color} size={28} />
                                </div>
                                <h3 className="text-2xl font-bold mb-4">{feat.title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">{feat.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Trust Section */}
            <section className="py-24 px-6 border-t border-white/5">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-12">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-500/10 rounded-xl text-green-400"><CheckCircle2 /></div>
                        <div>
                            <div className="font-bold">Verified Teachers</div>
                            <div className="text-xs text-gray-500 uppercase tracking-tighter">Human Review</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400"><ShieldCheck /></div>
                        <div>
                            <div className="font-bold">Family Safe</div>
                            <div className="text-xs text-gray-500 uppercase tracking-tighter">Private Beta</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400"><Globe /></div>
                        <div>
                            <div className="font-bold">Global Access</div>
                            <div className="text-xs text-gray-500 uppercase tracking-tighter">AI Scalability</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-500"><Zap /></div>
                        <div>
                            <div className="font-bold">Live AI Tutors</div>
                            <div className="text-xs text-gray-500 uppercase tracking-tighter">Instant Feedback</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 px-6 border-t border-white/5 glass bg-black/50">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-4">
                        <img src="/logo.png" alt="Logo" className="w-12 h-12 rounded-full" />
                        <div>
                            <div className="font-black text-xl tracking-tighter">Apollo STEM Academy</div>
                            <div className="text-xs text-gray-500 italic">Establishing the future of private education.</div>
                        </div>
                    </div>
                    <div className="text-xs text-gray-500 flex flex-wrap justify-center gap-6 font-bold uppercase tracking-widest">
                        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-white transition-colors">Contact Support</a>
                    </div>
                    <div className="text-xs text-gray-600 font-medium">
                        © 2026 Apollo Technologies. All Rights Reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
