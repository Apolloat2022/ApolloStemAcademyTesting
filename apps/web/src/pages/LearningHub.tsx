import React, { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Sparkles, BrainCircuit, Rocket, Target, Zap, ArrowRight, BookOpen, Calculator, Beaker } from 'lucide-react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

const LearningHub: React.FC = () => {
    const navigate = useNavigate();
    const [isGenerating, setIsGenerating] = useState(false);
    const [missions, setMissions] = useState<string[]>([]);

    const handleGenerateMissions = async () => {
        setIsGenerating(true);
        try {
            const res = await api.post('/api/ai/generate-missions', {});
            if (res.data.success) {
                setMissions(res.data.missions);
            }
        } catch (err) {
            console.error('Failed to generate missions', err);
            // Fallback for demo
            setMissions(['Master Quadratic Functions', 'Analyze Cellular Respiration', 'Intro to Neural Networks']);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="p-8 max-w-6xl mx-auto">
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
                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 bg-apollo-indigo/20 rounded-2xl flex items-center justify-center font-black text-apollo-indigo">
                                                    0{i + 1}
                                                </div>
                                                <div className="font-bold text-white text-lg">{mission}</div>
                                            </div>
                                            <button
                                                onClick={() => navigate('/student/assignments')}
                                                className="p-3 bg-white/5 rounded-2xl text-gray-500 group-hover:text-white group-hover:bg-apollo-indigo transition-all"
                                            >
                                                <ArrowRight size={20} />
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
                                {[
                                    { icon: <Calculator className="text-blue-400" />, name: 'STEM Math Solver', desc: 'Step-by-step logic engine' },
                                    { icon: <Beaker className="text-green-400" />, name: 'Virtual Science Lab', desc: 'Experimental simulations' },
                                    { icon: <BookOpen className="text-yellow-400" />, name: 'Concept Explorer', desc: 'AI-powered study guides' }
                                ].map((tool, i) => (
                                    <div key={i} className="p-5 bg-white/5 rounded-3xl border border-white/5 hover:bg-white/10 transition-all cursor-pointer group flex items-center gap-4">
                                        <div className="p-3 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform">{tool.icon}</div>
                                        <div>
                                            <div className="font-bold text-white text-sm">{tool.name}</div>
                                            <div className="text-[10px] text-gray-500 uppercase font-black tracking-tighter">{tool.desc}</div>
                                        </div>
                                    </div>
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
            </div>
        </DashboardLayout>
    );
};

export default LearningHub;
