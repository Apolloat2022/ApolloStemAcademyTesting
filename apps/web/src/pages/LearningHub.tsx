import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Sparkles, BrainCircuit, Rocket, Target, Zap, ArrowRight, BookOpen, Calculator, Beaker, X } from 'lucide-react';
import { api } from '../services/api';
import { useNavigate, useSearchParams } from 'react-router-dom';

const CLOUDFLARE_WORKER_URL = 'https://apolloacademyaiteacher.revanaglobal.workers.dev/api/ai/generate';

const LearningHub: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [isGenerating, setIsGenerating] = useState(false);
    const [missions, setMissions] = useState<any[]>([]);
    const [activeTool, setActiveTool] = useState<string | null>(null);

    // AI Tool States
    const [input, setInput] = useState('');
    const [output, setOutput] = useState<{ text: string, color: string } | null>(null);
    const [toolLoading, setToolLoading] = useState(false);

    useEffect(() => {
        const toolParam = searchParams.get('tool');
        if (toolParam) {
            if (toolParam === 'math') setActiveTool('STEM Math Solver');
            if (toolParam === 'science') setActiveTool('Virtual Science Lab');
            if (toolParam === 'study') setActiveTool('Concept Explorer');
        }
    }, [searchParams]);

    const handleGenerateMissions = async () => {
        setIsGenerating(true);
        try {
            const res = await api.post('/api/ai/missions');
            setMissions(res.data.missions);
        } catch (err) {
            console.error('Failed to generate missions', err);
            // Fallback for demo
            setMissions([
                {
                    title: 'Master Quadratic Functions',
                    subject: 'math',
                    difficulty: 'intermediate',
                    xpReward: 150,
                    estimatedTime: '2h'
                },
                {
                    title: 'Analyze Cellular Respiration',
                    subject: 'biology',
                    difficulty: 'advanced',
                    xpReward: 250,
                    estimatedTime: '3h'
                },
                {
                    title: 'Intro to Neural Networks',
                    subject: 'cs',
                    difficulty: 'beginner',
                    xpReward: 100,
                    estimatedTime: '1.5h'
                }
            ]);
        } finally {
            setIsGenerating(false);
        }
    };

    const callRealAI = async (prompt: string, toolKey: string = 'general') => {
        try {
            const res = await fetch(CLOUDFLARE_WORKER_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, toolKey })
            });

            const text = await res.text();
            try {
                const data = JSON.parse(text);
                return data.success ? data.answer : `Error: ${data.error}`;
            } catch (jsonErr) {
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

    const handleToolSubmit = async () => {
        if (!input.trim()) return;
        setToolLoading(true);

        let prompt = input;
        let toolKey = 'general';
        let context = '';

        if (activeTool === 'STEM Math Solver') {
            toolKey = 'math_solver';
            context = 'Solve this math problem step by step for a student. Explain each step clearly.';
        } else if (activeTool === 'Virtual Science Lab') {
            toolKey = 'science_lab';
            context = 'Explain this science experiment/concept for a student. Provide materials, steps, scientific principles, safety, and real-world applications.';
        } else if (activeTool === 'Concept Explorer') {
            toolKey = 'study_guide';
            context = 'Create a short concept summary and 3 review questions for this topic.';
        }

        const answer = await callRealAI(`${context} Input: ${prompt}`, toolKey);
        setOutput({ text: answer, color: 'text-white' });
        setToolLoading(false);
    };

    const tools = [
        { icon: <Calculator className="text-blue-400" />, name: 'STEM Math Solver', desc: 'Step-by-step logic engine', color: 'text-blue-400', border: 'border-blue-400/20' },
        { icon: <Beaker className="text-green-400" />, name: 'Virtual Science Lab', desc: 'Experimental simulations', color: 'text-green-400', border: 'border-green-400/20' },
        { icon: <BookOpen className="text-yellow-400" />, name: 'Concept Explorer', desc: 'AI-powered study guides', color: 'text-yellow-400', border: 'border-yellow-400/20' }
    ];

    return (
        <DashboardLayout>
            <div className="p-8 max-w-6xl mx-auto min-h-screen pb-20">
                <header className="mb-12 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-apollo-indigo/10 text-apollo-indigo font-black text-xs uppercase tracking-[0.2em] mb-6">
                        <Sparkles size={14} /> Neural Compute Engine Active
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-white mb-6">AI Learning Hub</h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Your personalized STEM command center. Use Gemini AI to curate your next mastery mission.
                    </p>
                </header>

                <div className="grid lg:grid-cols-3 gap-8 mb-12">
                    {/* Mission Control */}
                    <div className="lg:col-span-2 glass rounded-[40px] p-10 border-apollo-indigo/20 bg-apollo-indigo/5 relative overflow-hidden group">
                        <div className="absolute -top-20 -right-20 w-80 h-80 bg-apollo-indigo/10 rounded-full blur-[100px] group-hover:bg-apollo-indigo/20 transition-all" />

                        <div className="relative z-10">
                            <h2 className="text-3xl font-black text-white mb-8 flex items-center gap-3">
                                <Rocket className="text-apollo-indigo" />
                                Mission Control
                            </h2>

                            {missions.length > 0 ? (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    {missions.map((mission, i) => (
                                        <div key={i} className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5 hover:border-apollo-indigo/30 transition-all cursor-pointer group shadow-xl">
                                            <div className="flex items-center gap-6">
                                                <div className="w-14 h-14 bg-apollo-indigo/20 rounded-2xl flex items-center justify-center font-black text-apollo-indigo text-xl">
                                                    {i + 1}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="px-2 py-0.5 bg-apollo-indigo/10 text-apollo-indigo rounded text-[10px] font-black uppercase tracking-widest border border-apollo-indigo/20">
                                                            {mission.subject}
                                                        </span>
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${mission.difficulty === 'advanced' ? 'bg-red-500/10 text-red-500' :
                                                                mission.difficulty === 'intermediate' ? 'bg-yellow-500/10 text-yellow-500' :
                                                                    'bg-green-500/10 text-green-500'
                                                            }`}>
                                                            {mission.difficulty}
                                                        </span>
                                                    </div>
                                                    <div className="font-bold text-white text-xl">{mission.title}</div>
                                                    <div className="flex items-center gap-4 mt-1 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                                        <span>{mission.estimatedTime || mission.estimated_time}</span>
                                                        <span className="text-apollo-indigo">+{mission.xpReward || mission.xp_reward} XP</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => navigate('/student/assignments')}
                                                className="p-4 bg-white/5 rounded-2xl text-gray-500 group-hover:text-white group-hover:bg-apollo-indigo transition-all"
                                            >
                                                <ArrowRight size={24} />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={handleGenerateMissions}
                                        className="w-full mt-6 py-4 text-sm font-bold text-gray-500 hover:text-white transition-all uppercase tracking-widest"
                                    >
                                        Regenerate Missions
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center py-20">
                                    <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-8">
                                        <BrainCircuit size={40} className="text-gray-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-4">No Active Missions</h3>
                                    <p className="text-gray-500 mb-10 max-w-sm mx-auto uppercase text-[10px] font-black tracking-widest leading-loose">
                                        Analyze your Mastery Map and create 3 high-impact learning paths specifically for your growth.
                                    </p>
                                    <button
                                        onClick={handleGenerateMissions}
                                        disabled={isGenerating}
                                        className="px-10 py-5 bg-apollo-indigo text-white font-black rounded-3xl hover:scale-105 transition-all shadow-[0_20px_50px_rgba(79,70,229,0.3)] flex items-center gap-3 mx-auto"
                                    >
                                        {isGenerating ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                                Synthesizing Data...
                                            </>
                                        ) : (
                                            <>
                                                <Zap size={20} fill="currentColor" />
                                                Generate Missions
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Core Tools */}
                    <div className="space-y-8">
                        <div className="glass rounded-[40px] p-8 border-white/5">
                            <h3 className="font-black text-xs text-gray-500 uppercase tracking-widest mb-8 flex items-center gap-2">
                                <Target size={14} className="text-apollo-indigo" /> Core Mastery Tools
                            </h3>
                            <div className="space-y-4">
                                {tools.map((tool, i) => (
                                    <button
                                        key={i}
                                        onClick={() => {
                                            setActiveTool(tool.name);
                                            setInput('');
                                            setOutput(null);
                                        }}
                                        className="w-full p-5 bg-white/5 rounded-3xl border border-white/5 hover:bg-white/10 transition-all cursor-pointer group flex items-center gap-4 text-left hover:scale-[1.02]"
                                    >
                                        <div className="p-3 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform">{tool.icon}</div>
                                        <div>
                                            <div className="font-bold text-white text-sm">{tool.name}</div>
                                            <div className="text-[10px] text-gray-500 uppercase font-black tracking-tighter">{tool.desc}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="glass rounded-[40px] p-8 border-yellow-400/10 bg-yellow-400/5">
                            <h3 className="font-black text-xs text-yellow-400 uppercase tracking-widest mb-4">Mastery Insight</h3>
                            <p className="text-xs text-gray-400 leading-relaxed mb-6">
                                Your performance in **Algebra** has increased by 12% this week. Focus on **Quadratic Equations** to unlock the next rank.
                            </p>
                            <button onClick={() => navigate('/student/progress')} className="text-[10px] font-black text-white hover:text-yellow-400 transition-colors uppercase tracking-widest flex items-center gap-2">
                                Open Mastery Map <ArrowRight size={12} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Active Tool Overlay/Modal */}
                {activeTool && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
                        <div className="glass w-full max-w-2xl rounded-[40px] border-white/10 p-8 shadow-2xl relative">
                            <button
                                onClick={() => setActiveTool(null)}
                                className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-all"
                            >
                                <X size={20} className="text-gray-400 hover:text-white" />
                            </button>

                            <div className="flex items-center gap-4 mb-6">
                                <div className={`p-4 rounded-3xl bg-white/5 ${tools.find(t => t.name === activeTool)?.color}`}>
                                    {tools.find(t => t.name === activeTool)?.icon}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white">{activeTool}</h2>
                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        AI Agent Online
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder={
                                        activeTool === 'STEM Math Solver' ? "Enter a math problem (e.g., Solve 3x + 5 = 20)..." :
                                            activeTool === 'Virtual Science Lab' ? "Describe an experiment or concept (e.g., Photosynthesis)..." :
                                                "Enter a topic to explore..."
                                    }
                                    className="w-full h-32 bg-black/20 border border-white/10 rounded-2xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-apollo-indigo/50 transition-colors resize-none"
                                />

                                <div className="flex justify-end">
                                    <button
                                        onClick={handleToolSubmit}
                                        disabled={toolLoading || !input.trim()}
                                        className="px-8 py-3 bg-apollo-indigo text-white font-bold rounded-2xl hover:bg-apollo-indigo/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {toolLoading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <Zap size={18} fill="currentColor" />
                                                Run Simulation
                                            </>
                                        )}
                                    </button>
                                </div>

                                {output && (
                                    <div className="mt-8 p-6 bg-white/5 rounded-3xl border border-white/10 animate-in slide-in-from-bottom-2">
                                        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <Sparkles size={12} className="text-yellow-400" />
                                            AI Analysis Result
                                        </div>
                                        <div className="text-gray-200 whitespace-pre-wrap leading-relaxed">
                                            {output.text}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default LearningHub;
