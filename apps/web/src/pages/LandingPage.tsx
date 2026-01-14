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
    ArrowRight,
    Zap,
    Menu,
    X,
    Heart,
    Star,
    Award,
    BrainCircuit,
    Layers,
    Coffee
} from 'lucide-react';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Tools State
    const [mathProblem, setMathProblem] = useState('');
    const [mathSolution, setMathSolution] = useState<string | null>(null);
    const [worksheetTopic, setWorksheetTopic] = useState('');
    const [worksheetGrade] = useState('Grade 1');
    const [worksheetOutput, setWorksheetOutput] = useState<string | null>(null);
    const [scienceTopic, setScienceTopic] = useState('');
    const [scienceOutput, setScienceOutput] = useState<string | null>(null);
    const [studyTopic, setStudyTopic] = useState('');
    const [studyOutput, setStudyOutput] = useState<string | null>(null);

    const [loadingTool, setLoadingTool] = useState<string | null>(null);

    const callAI = async (prompt: string, toolKey: string, setter: (val: string) => void) => {
        setLoadingTool(toolKey);
        try {
            const token = authService.getToken() || 'public_demo_token';
            const res = await axios.post('/api/ai/generate', {
                prompt,
                toolKey,
                systemPrompt: 'You are an expert STEM tutor at Apollo Academy. Provide a helpful, encouraging, and accurate answer to the student.'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setter(res.data.answer);
        } catch (err) {
            setter("The AI tutor is currently assisting other students. Please try again or join our academy for priority access! ✨");
        } finally {
            setLoadingTool(null);
        }
    };

    return (
        <div className="min-h-screen bg-[#0b1220] text-white font-sans selection:bg-indigo-500/30">
            {/* Global Fixed Style for Logo - Safety First */}
            <style>{`
                img[src="/logo.png"] { width: 48px !important; height: 48px !important; border-radius: 9999px; object-fit: contain; }
                .hero-starfield { position: absolute; inset:0; background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle fill="rgba(255,255,255,0.05)" cx="10" cy="10" r="1"/><circle fill="rgba(255,255,255,0.05)" cx="50" cy="80" r="1.5"/><circle fill="rgba(255,255,255,0.05)" cx="80" cy="40" r="1"/></svg>'); animation: starfield 200s linear infinite; pointer-events: none; }
                @keyframes starfield { from { background-position: 0 0; } to { background-position: -10000px 5000px; } }
            `}</style>

            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 glass border-b border-white/5 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="Apollo Logo" className="w-12 h-12" />
                        <span className="text-xl font-black tracking-tight gradient-shift text-transparent bg-clip-text bg-gradient-to-r from-apollo-yellow via-white to-apollo-indigo">Apollo STEM Academy</span>
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-400 uppercase tracking-widest">
                        <a href="#about" className="hover:text-white transition-colors">About</a>
                        <a href="#tools" className="hover:text-white transition-colors">AI Tools</a>
                        <a href="#enroll" className="hover:text-white transition-colors">Enroll</a>
                        <a href="#sponsors" className="hover:text-white transition-colors">Sponsors</a>
                        <button onClick={() => navigate('/login')} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl hover:scale-105 transition-all shadow-lg shadow-indigo-600/20 font-black">
                            Student Area
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
                        <a href="#tools" className="text-gray-400 font-bold" onClick={() => setIsMenuOpen(false)}>AI Tools</a>
                        <a href="#enroll" className="text-gray-400 font-bold" onClick={() => setIsMenuOpen(false)}>Enroll</a>
                        <button onClick={() => navigate('/login')} className="bg-indigo-600 text-white px-5 py-3 rounded-xl font-bold">Student Login</button>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <header className="pt-40 pb-20 px-6 relative overflow-hidden">
                <div className="hero-starfield" />
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 blur-[150px] rounded-full -mr-80 -mt-40" />

                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
                    <div className="fade-in">
                        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-indigo-600/10 border border-indigo-600/20 text-indigo-400 font-black text-[10px] uppercase tracking-[3px] mb-8">
                            <Sparkles size={14} /> The Future of Mastery
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black leading-tight mb-8">
                            Private, AI-powered <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-apollo-yellow via-white to-apollo-indigo">STEM Excellence.</span>
                        </h1>
                        <p className="text-lg text-gray-400 leading-relaxed mb-10 max-w-xl">
                            World-class STEM curriculum delivered via personalized AI intelligence and human teacher guidance. Limited founding free enrollment for Grades 1–12.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <a href="#enroll" className="px-8 py-4 bg-yellow-400 text-black font-black rounded-2xl hover:scale-105 transition-all shadow-xl shadow-yellow-400/20 flex items-center justify-center gap-2">
                                Apply for Free <ArrowRight size={20} />
                            </a>
                            <a href="#tools" className="px-8 py-4 glass border-white/10 text-white font-bold rounded-2xl hover:bg-white/5 transition-all flex items-center justify-center gap-2 text-center uppercase tracking-widest text-xs">
                                Try Free AI Tools
                            </a>
                        </div>
                        <div className="mt-12 flex gap-10 items-baseline">
                            <div>
                                <div className="text-3xl font-black text-white">50</div>
                                <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-1">Free Spots Left</div>
                            </div>
                            <div className="w-px h-10 bg-white/5" />
                            <div>
                                <div className="text-3xl font-black text-white">$15</div>
                                <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-1">Promo Price</div>
                            </div>
                        </div>
                    </div>

                    {/* Interactive Hero Tool (Math) */}
                    <div className="relative fade-in-delay">
                        <div className="glass rounded-[40px] p-8 md:p-12 border-white/5 relative z-10 animate-float shadow-2xl">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-blue-400">
                                    <Calculator size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">AI Math Solver</h3>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Live Demo • High Accuracy</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    value={mathProblem}
                                    onChange={(e) => setMathProblem(e.target.value)}
                                    placeholder="Enter a math problem (e.g. 2x + 5 = 15)"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-blue-400 transition-all text-white placeholder:text-gray-600 font-medium"
                                />
                                <button
                                    onClick={() => callAI(`Solve this math problem step by step: ${mathProblem}`, 'math', setMathSolution)}
                                    disabled={loadingTool === 'math'}
                                    className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all ${loadingTool === 'math' ? 'bg-white/5 text-gray-500' : 'bg-blue-600 text-white hover:scale-[1.02]'}`}
                                >
                                    {loadingTool === 'math' ? 'Calculating...' : 'Solve with AI'}
                                </button>
                            </div>
                            {mathSolution && (
                                <div className="mt-8 p-6 bg-white/5 rounded-3xl border border-white/5 animate-in zoom-in duration-300">
                                    <p className="text-sm text-gray-300 whitespace-pre-line leading-relaxed italic">{mathSolution}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Shared AI Tools Suite */}
            <section id="tools" className="py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl font-black mb-4">Apollo AI Lab</h2>
                        <p className="text-gray-500 uppercase tracking-[4px] text-[10px] font-black italic">Public Access Learning Modules</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Worksheet Generator */}
                        <div className="glass p-8 rounded-[40px] border-white/5 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-green-500/10 rounded-3xl flex items-center justify-center mb-8 border border-green-500/20 text-green-400">
                                <FileText size={32} />
                            </div>
                            <h3 className="text-2xl font-black mb-4">Worksheet Engine</h3>
                            <input
                                type="text" value={worksheetTopic} onChange={(e) => setWorksheetTopic(e.target.value)}
                                placeholder="Topic (e.g. Fractions)"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 mb-4 text-xs"
                            />
                            <button
                                onClick={() => callAI(`Create a ${worksheetGrade} worksheet for ${worksheetTopic}`, 'worksheet', setWorksheetOutput)}
                                className="w-full py-3 bg-green-600 rounded-xl font-bold text-xs uppercase"
                            >
                                Generate PDF
                            </button>
                            {worksheetOutput && <div className="mt-4 p-4 text-[10px] text-gray-400 text-left bg-black/30 rounded-xl max-h-40 overflow-auto">{worksheetOutput}</div>}
                        </div>

                        {/* Science Lab */}
                        <div className="glass p-8 rounded-[40px] border-white/5 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-purple-500/10 rounded-3xl flex items-center justify-center mb-8 border border-purple-500/20 text-purple-400">
                                <Beaker size={32} />
                            </div>
                            <h3 className="text-2xl font-black mb-4">Science Lab</h3>
                            <input
                                type="text" value={scienceTopic} onChange={(e) => setScienceTopic(e.target.value)}
                                placeholder="Explain Concept (e.g. Solar Cells)"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 mb-4 text-xs"
                            />
                            <button
                                onClick={() => callAI(`Explain this science concept: ${scienceTopic}`, 'science', setScienceOutput)}
                                className="w-full py-3 bg-purple-600 rounded-xl font-bold text-xs uppercase"
                            >
                                Explain Concept
                            </button>
                            {scienceOutput && <div className="mt-4 p-4 text-[10px] text-gray-400 text-left bg-black/30 rounded-xl max-h-40 overflow-auto">{scienceOutput}</div>}
                        </div>

                        {/* Study Guide */}
                        <div className="glass p-8 rounded-[40px] border-white/5 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-amber-500/10 rounded-3xl flex items-center justify-center mb-8 border border-amber-500/20 text-amber-400">
                                <Award size={32} />
                            </div>
                            <h3 className="text-2xl font-black mb-4">Study Assistant</h3>
                            <input
                                type="text" value={studyTopic} onChange={(e) => setStudyTopic(e.target.value)}
                                placeholder="Exam Topic"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 mb-4 text-xs"
                            />
                            <button
                                onClick={() => callAI(`Create a study guide for ${studyTopic}`, 'study', setStudyOutput)}
                                className="w-full py-3 bg-amber-600 rounded-xl font-bold text-xs uppercase"
                            >
                                Build Guide
                            </button>
                            {studyOutput && <div className="mt-4 p-4 text-[10px] text-gray-400 text-left bg-black/30 rounded-xl max-h-40 overflow-auto">{studyOutput}</div>}
                        </div>
                    </div>
                </div>
            </section>

            {/* About Section (Cinematic Description) */}
            <section id="about" className="py-32 px-6 border-t border-white/5 bg-white/[0.01]">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20">
                    <div className="flex-1">
                        <h2 className="text-4xl font-black mb-8">A Private, Guided Approach</h2>
                        <p className="text-gray-400 leading-loose mb-10 text-lg">
                            We combine the raw computing power of AI for scalable, personalized instruction with the selective oversight of world-class mentors. Unlike automated platforms, Apollo teachers asynchronously review, grade, and feedback on every mission a student completes.
                        </p>
                        <ul className="space-y-6">
                            {[
                                { icon: BrainCircuit, title: 'AI-Generated Mastery Paths', text: 'Proprietary algorithms that adapt to every error and strength.' },
                                { icon: Layers, title: 'Deep Performance Analytics', text: 'Parents see what students know, and what they will master next.' },
                                { icon: Coffee, title: 'Human Mentorship', text: 'Real teachers provide the final review and creative feedback.' }
                            ].map((item, i) => (
                                <li key={i} className="flex gap-4">
                                    <div className="text-indigo-500 mt-1"><item.icon size={22} /></div>
                                    <div>
                                        <div className="font-black text-white">{item.title}</div>
                                        <div className="text-sm text-gray-500">{item.text}</div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="flex-1 relative">
                        <div className="aspect-video glass rounded-[60px] overflow-hidden border-white/5 transform rotate-2">
                            <img src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1600&auto=format&fit=crop" alt="Students" className="w-full h-full object-cover" />
                        </div>
                        <div className="absolute -bottom-10 -left-10 glass p-8 rounded-[30px] border-white/10 animate-pulse">
                            <div className="text-4xl font-black text-apollo-yellow">100%</div>
                            <div className="text-[10px] font-black opacity-50 uppercase tracking-widest">Mastery Guaranteed</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Enrollment Section */}
            <section id="enroll" className="py-32 px-6">
                <div className="max-w-5xl mx-auto glass p-12 md:p-20 rounded-[60px] border-white/5 bg-gradient-to-br from-indigo-600/20 via-transparent to-transparent text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-10"><Zap size={200} /></div>
                    <h2 className="text-4xl md:text-5xl font-black mb-8">Limited Founding Enrollment</h2>
                    <p className="text-gray-400 text-lg mb-12 max-w-2xl mx-auto leading-relaxed">
                        Join our founding cohort of students and parents. Apply today for manual approval. We are selecting 50 families for our premium pilot program.
                    </p>
                    <div className="flex flex-col md:flex-row justify-center gap-6">
                        <div className="p-8 glass rounded-[40px] border-white/10 flex-1 text-left">
                            <h4 className="text-xl font-bold mb-4">New Student Enrollment</h4>
                            <p className="text-sm text-gray-500 mb-8">Submit your application for review. Manual approval required for private access.</p>
                            <a href="https://docs.google.com/forms/d/e/1FAIpQLSchUXzauH_d0SQaKhAhS7To2Op07CUkGcsLrxaNqpXLzvx2jQ/viewform" target="_blank" className="inline-block w-full py-4 bg-yellow-400 text-black font-black rounded-2xl text-center uppercase tracking-widest text-xs">Apply Now</a>
                        </div>
                        <div className="p-8 glass bg-black/20 rounded-[40px] border-white/5 flex-1 text-left">
                            <h4 className="text-xl font-bold mb-4">Volunteer Application</h4>
                            <p className="text-sm text-gray-500 mb-8">Join as a teacher, mentor, or tech volunteer. Help shape the future of STEM.</p>
                            <a href="https://docs.google.com/forms/d/e/1FAIpQLSeXDLtEx-oIcMUORk8vyQkQD-sKMwpfR5a5YPEFKMahhAT8nQ/viewform" target="_blank" className="inline-block w-full py-4 border border-indigo-600/30 text-indigo-400 font-bold rounded-2xl text-center uppercase tracking-widest text-xs hover:bg-indigo-600/5">Join Faculty</a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Sponsorship Section */}
            <section id="sponsors" className="py-32 px-6 bg-white/[0.01]">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl font-black mb-4">Corporate & Individual Sponsors</h2>
                        <p className="text-gray-500 uppercase tracking-widest text-[10px] font-black">Support the Mission • Power Global STEM Access</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
                        {/* Platinum */}
                        <div className="glass p-10 rounded-[40px] border-white/5 flex flex-col items-center">
                            <div className="text-yellow-400 mb-2"><Award size={40} /></div>
                            <div className="text-xl font-black mb-2">Platinum</div>
                            <div className="text-3xl font-black mb-4">$10k</div>
                            <p className="text-center text-[10px] text-gray-500 mb-6 font-bold uppercase tracking-tighter leading-tight">Homepage Spotlight • Quarterly Reports • Priority Support</p>
                            <a href="https://docs.google.com/forms/d/e/1FAIpQLSfOTUSXYJbQM9S9k5sTrr6TNTWnAGGwc4G3wjNuSMTdJdmaUQ/viewform?usp=publish-editor" target="_blank" className="w-full py-3 bg-indigo-600 rounded-xl text-center text-xs font-black uppercase ring-2 ring-indigo-600/20">Become Sponsor</a>
                        </div>
                        {/* Gold */}
                        <div className="glass p-10 rounded-[40px] border-white/5 flex flex-col items-center">
                            <div className="text-yellow-500 mb-2"><Star size={40} /></div>
                            <div className="text-xl font-black mb-2">Gold</div>
                            <div className="text-3xl font-black mb-4">$5k</div>
                            <p className="text-center text-[10px] text-gray-500 mb-6 font-bold uppercase tracking-tighter leading-tight">Newsletter Mention • Social Shoutout • Site Recognition</p>
                            <a href="https://docs.google.com/forms/d/e/1FAIpQLSfOTUSXYJbQM9S9k5sTrr6TNTWnAGGwc4G3wjNuSMTdJdmaUQ/viewform?usp=publish-editor" target="_blank" className="w-full py-3 bg-indigo-600/50 rounded-xl text-center text-xs font-black uppercase border border-indigo-600/20">Become Sponsor</a>
                        </div>
                        {/* Individual Visionary */}
                        <div className="glass p-10 rounded-[40px] border-white/5 flex flex-col items-center">
                            <div className="text-indigo-400 mb-2"><Heart size={40} /></div>
                            <div className="text-xl font-black mb-2">Visionary</div>
                            <div className="text-3xl font-black mb-4">$500+</div>
                            <p className="text-center text-[10px] text-gray-500 mb-6 font-bold uppercase tracking-tighter leading-tight">Wall of Honor • Thank-You Letter • Digital Badge</p>
                            <a href="https://docs.google.com/forms/d/e/1FAIpQLScLO2Phm8JrRMYl_uaoxPTO5hPMEe2YDj5SxarrNJ4D9z2L9g/viewform?usp=publish-editor" target="_blank" className="w-full py-3 bg-white/5 rounded-xl text-center text-xs font-black uppercase border border-white/10">Sponsor Now</a>
                        </div>
                        {/* Individual Friend */}
                        <div className="glass p-10 rounded-[40px] border-white/5 flex flex-col items-center">
                            <div className="text-green-400 mb-2"><Globe size={40} /></div>
                            <div className="text-xl font-black mb-2">Friend</div>
                            <div className="text-3xl font-black mb-4">$50</div>
                            <p className="text-center text-[10px] text-gray-500 mb-6 font-bold uppercase tracking-tighter leading-tight">Certificate of Gratitude • Mission Newsletter Updates</p>
                            <a href="https://docs.google.com/forms/d/e/1FAIpQLScLO2Phm8JrRMYl_uaoxPTO5hPMEe2YDj5SxarrNJ4D9z2L9g/viewform?usp=publish-editor" target="_blank" className="w-full py-3 bg-white/5 rounded-xl text-center text-xs font-black uppercase border border-white/10">Sponsor Now</a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 px-6 border-t border-white/5 glass bg-black/50">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <img src="/logo.png" alt="Logo" className="w-12 h-12 shadow-2xl shadow-indigo-600/20" />
                        <div>
                            <div className="font-black text-2xl tracking-tighter uppercase italic text-transparent bg-clip-text bg-gradient-to-r from-apollo-yellow via-white to-apollo-indigo">Apollo STEM Academy</div>
                            <div className="text-[10px] text-gray-600 font-bold tracking-[3px] uppercase">Est. 2024 • Private Online Institution</div>
                        </div>
                    </div>
                    <div className="text-[10px] text-gray-500 flex flex-wrap justify-center gap-8 font-black uppercase tracking-[2px]">
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms</a>
                        <a href="mailto:Robinpandey@apollotunes.com" className="hover:text-amber-400 transition-colors">Contact Support</a>
                    </div>
                    <div className="text-[10px] text-gray-600 font-black uppercase tracking-widest text-center">
                        © 2026 Apollo Technologies US. <br /> All Rights Reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
