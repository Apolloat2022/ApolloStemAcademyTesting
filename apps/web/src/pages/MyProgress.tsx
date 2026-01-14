import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { TrendingUp, Award, Zap, BrainCircuit, Target, Star, Lock } from 'lucide-react';
import { api } from '../services/api';


const MyProgress: React.FC = () => {
    const [mastery, setMastery] = useState<any[]>([]);
    const [achievements, setAchievements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [mRes, aRes] = await Promise.all([
                    api.get('/api/student/mastery'),
                    api.get('/api/student/achievements')
                ]);
                setMastery(mRes.data);
                setAchievements(aRes.data);
            } catch (err) {
                console.error('Failed to fetch progress data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const stats = [
        { label: 'Weekly Activity', value: '12.5 hrs', icon: Zap, color: 'text-yellow-400' },
        { label: 'Avg. Accuracy', value: mastery.length ? `${Math.round(mastery.reduce((a, b) => a + b.score, 0) / mastery.length)}%` : '0%', icon: Target, color: 'text-green-400' },
        { label: 'Level Sum', value: mastery.reduce((a, b) => a + b.level, 0), icon: Star, color: 'text-blue-400' },
    ];

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
                <header className="mb-10">
                    <h1 className="text-4xl font-bold mb-2">My Growth</h1>
                    <p className="text-gray-400">Visualizing your STEM journey and achievements.</p>
                </header>

                {/* Quick Stats */}
                <div className="grid md:grid-cols-3 gap-6 mb-10">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="glass p-6 rounded-3xl border-white/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <stat.icon size={64} />
                            </div>
                            <div className={`p-3 rounded-2xl bg-white/5 w-fit mb-4 ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                            <div className="text-3xl font-bold text-white mb-1 tracking-tighter">{stat.value}</div>
                            <div className="text-gray-500 text-sm font-medium uppercase tracking-wider">{stat.label}</div>
                        </div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Subject Mastery Visualization */}
                    <div className="glass rounded-3xl p-8 border-white/5">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                <BrainCircuit className="text-apollo-indigo" /> Subject Mastery
                            </h2>
                            <TrendingUp className="text-green-400" size={20} />
                        </div>
                        <div className="space-y-6">
                            {mastery.map((m, idx) => (
                                <div key={idx}>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-gray-300 font-medium uppercase tracking-widest text-[10px]">{m.subject}</span>
                                        <span className="text-white font-bold">Level {m.level} • {m.score}%</span>
                                    </div>
                                    <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                        <div
                                            className="h-full bg-apollo-indigo rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                                            style={{ width: `${m.score}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Accomplishments */}
                    <div className="glass rounded-3xl p-8 border-yellow-500/10 bg-yellow-500/5">
                        <div className="flex items-center gap-3 mb-8">
                            <Award className="text-yellow-400" />
                            <h2 className="text-2xl font-bold text-white">STEM Achievements</h2>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {achievements.map((badge, idx) => (
                                <div
                                    key={idx}
                                    className={`bg-white/5 border border-white/5 p-4 rounded-2xl flex flex-col items-center text-center transition-all ${badge.earned ? 'hover:bg-white/10 cursor-pointer group' : 'opacity-40 grayscale'}`}
                                >
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${badge.earned ? 'bg-yellow-400/10 group-hover:scale-110 transition-transform' : 'bg-gray-500/10'}`}>
                                        {badge.earned ? <Award size={24} className="text-yellow-400" /> : <Lock size={20} className="text-gray-500" />}
                                    </div>
                                    <div className="font-bold text-white text-sm">{badge.name}</div>
                                    <div className="text-[10px] text-gray-500 mt-1 leading-tight">{badge.description}</div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-8 py-3 bg-white/5 border border-white/10 rounded-xl font-bold text-sm hover:bg-white/10 transition-all">
                            View All Badges
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default MyProgress;
