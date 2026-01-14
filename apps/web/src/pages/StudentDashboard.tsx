import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { authService } from '../services/authService';
import {
    BookOpen,
    ClipboardList,
    TrendingUp,
    ArrowRight,
    Sparkles,
    BrainCircuit,
    X,
    Award
} from 'lucide-react';
import { api } from '../services/api';

const StudentDashboard: React.FC = () => {
    const navigate = useNavigate();
    const user = authService.getUser();
    const [recs, setRecs] = useState<string[]>([]);
    const [newAchievement, setNewAchievement] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // api client automatically handles token
                const [rRes, aRes] = await Promise.all([
                    api.get('/api/student/recommendations'),
                    api.get('/api/student/achievements')
                ]);
                setRecs(rRes.data);

                // Detection logic for "New Achievement" toast
                const justEarned = aRes.data.find((a: any) => a.earned && !localStorage.getItem(`notified_${a.id}`));
                if (justEarned) {
                    setNewAchievement(justEarned);
                    localStorage.setItem(`notified_${justEarned.id}`, 'true');
                    setTimeout(() => setNewAchievement(null), 8000);
                }

            } catch (err) {
                console.error('Failed to fetch dashboard data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <DashboardLayout>
                <div className="p-8 flex items-center justify-center min-h-[60vh]">
                    <div className="animate-spin w-12 h-12 border-4 border-apollo-indigo/20 border-t-apollo-indigo rounded-full" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="p-8">
                <header className="mb-10 flex justify-between items-start">
                    <div>
                        <h1 className="text-4xl font-black text-white mb-2">Welcome back, {user?.name.split(' ')[0]}! 👋</h1>
                        <p className="text-gray-400">Your STEM journey is evolving. View your missions below.</p>
                    </div>
                    <button
                        onClick={() => navigate('/student/hub')}
                        className="bg-apollo-indigo px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-apollo-indigo/20 text-white"
                    >
                        <Sparkles size={18} />
                        Launch AI Hub
                    </button>
                </header>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Quick Stats */}
                    <div onClick={() => navigate('/student/progress')} className="glass rounded-3xl p-6 flex items-center gap-4 hover:bg-white/5 transition-all cursor-pointer group border-white/5">
                        <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400">
                            <BookOpen size={24} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white">12</div>
                            <div className="text-gray-400 text-sm">Lessons Completed</div>
                        </div>
                        <ArrowRight className="ml-auto opacity-0 group-hover:opacity-100 transition-all text-gray-500" size={18} />
                    </div>

                    <div onClick={() => navigate('/student/assignments')} className="glass rounded-3xl p-6 flex items-center gap-4 hover:bg-white/5 transition-all cursor-pointer group border-white/5">
                        <div className="p-3 bg-yellow-500/10 rounded-2xl text-yellow-400">
                            <ClipboardList size={24} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white">4</div>
                            <div className="text-gray-400 text-sm">Pending Assignments</div>
                        </div>
                        <ArrowRight className="ml-auto opacity-0 group-hover:opacity-100 transition-all text-gray-500" size={18} />
                    </div>

                    <div onClick={() => navigate('/student/progress')} className="glass rounded-3xl p-6 flex items-center gap-4 hover:bg-white/5 transition-all cursor-pointer group border-white/5">
                        <div className="p-3 bg-green-500/10 rounded-2xl text-green-400">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white">85%</div>
                            <div className="text-gray-400 text-sm">Average Accuracy</div>
                        </div>
                        <ArrowRight className="ml-auto opacity-0 group-hover:opacity-100 transition-all text-gray-500" size={18} />
                    </div>
                </div>

                <div className="mt-10 grid lg:grid-cols-3 gap-8">
                    {/* AI Learning Path */}
                    <div className="lg:col-span-2 glass rounded-[40px] p-10 relative overflow-hidden group border-white/5">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <BrainCircuit size={160} />
                        </div>
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-3xl font-black text-white flex items-center gap-2">
                                    <Sparkles className="text-apollo-indigo" /> AI Learning Missions
                                </h2>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Personalized trajectory for {user?.name.split(' ')[0]}</p>
                            </div>
                            <button onClick={() => navigate('/student/progress')} className="text-sm text-apollo-indigo font-bold hover:underline">View Mastery</button>
                        </div>
                        <div className="space-y-4 relative z-10">
                            {recs.length > 0 ? recs.map((mission, i) => (
                                <div key={i} className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5 hover:border-apollo-indigo/30 transition-all group cursor-pointer shadow-xl">
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center font-black text-apollo-indigo text-xl">
                                            {i + 1}
                                        </div>
                                        <div>
                                            <div className="font-bold text-white text-lg">{mission}</div>
                                            <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-1">Strategy: Targeted Practice</div>
                                        </div>
                                    </div>
                                    <button className="px-5 py-2.5 bg-apollo-indigo text-white text-[10px] font-black rounded-xl hover:scale-110 transition-all uppercase tracking-widest shadow-lg shadow-apollo-indigo/20">Resume Mission</button>
                                </div>
                            )) : (
                                <div className="text-center py-10 opacity-50 italic text-gray-500">No active missions. Generate some in the AI Hub!</div>
                            )}
                        </div>
                    </div>

                    {/* Quick Launch & Achievements Hub */}
                    <div className="flex flex-col gap-8">
                        <div className="glass rounded-[40px] p-8 bg-apollo-indigo/5 border-apollo-indigo/10 flex-1">
                            <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                                <Sparkles className="text-apollo-indigo" size={20} />
                                Tool Hub
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { name: 'Math', path: '/student/hub', desc: 'Solver' },
                                    { name: 'Lab', path: '/student/hub', desc: 'Sim' },
                                    { name: 'Quiz', path: '/student/hub', desc: 'Review' },
                                    { name: 'Study', path: '/student/hub', desc: 'Gen' }
                                ].map((tool, i) => (
                                    <button
                                        key={i}
                                        onClick={() => navigate(tool.path)}
                                        className="p-5 bg-white/5 rounded-3xl border border-white/5 hover:bg-white/10 transition-all text-center group"
                                    >
                                        <div className="text-sm font-bold text-white mb-1 group-hover:text-apollo-indigo transition-colors">{tool.name}</div>
                                        <div className="text-[8px] text-gray-600 font-black uppercase tracking-tighter">{tool.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="glass rounded-[40px] p-8 border-yellow-400/10 bg-yellow-400/5">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-black text-white text-sm flex items-center gap-2">
                                    <Award className="text-yellow-400" size={18} /> PROGRESS
                                </h3>
                                <div className="text-[10px] font-black text-yellow-400 uppercase tracking-widest">RANK: GOLD</div>
                            </div>
                            <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/5 p-1 mb-4">
                                <div className="h-full bg-yellow-400 rounded-full w-[65%] shadow-[0_0_15px_rgba(250,204,21,0.4)]" />
                            </div>
                            <p className="text-[10px] text-gray-500 font-bold text-center uppercase tracking-widest">35 missions to NEXT RANK</p>
                        </div>
                    </div>
                </div>

                {/* Achievement Toast */}
                {newAchievement && (
                    <div className="fixed bottom-10 right-10 z-50 animate-in slide-in-from-right-10 duration-500">
                        <div className="glass p-6 rounded-[32px] border-yellow-400/30 flex items-center gap-5 shadow-[0_0_50px_rgba(250,204,21,0.2)] bg-black/80 backdrop-blur-3xl">
                            <div className="w-16 h-16 bg-yellow-400/20 rounded-2xl flex items-center justify-center">
                                <Award className="text-yellow-400" size={32} />
                            </div>
                            <div>
                                <div className="text-[10px] text-yellow-400 font-black uppercase tracking-[0.2em] mb-1">Achievement Unlocked!</div>
                                <div className="text-xl font-black text-white leading-tight">{newAchievement.name}</div>
                                <div className="text-xs text-gray-500 mt-1 font-bold">{newAchievement.description}</div>
                            </div>
                            <button
                                onClick={() => setNewAchievement(null)}
                                className="ml-4 p-2 text-gray-600 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default StudentDashboard;
