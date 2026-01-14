import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import {
    Eye,
    TrendingUp,
    Award,
    Calendar,
    BrainCircuit,
    Star,
    Heart,
    ChevronRight,
    Sparkles,
    Info
} from 'lucide-react';
import { api } from '../services/api';
import { authService } from '../services/authService';

const ParentDashboard: React.FC = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [dataRes, summaryRes] = await Promise.all([
                    api.get('/api/parent/child-data'),
                    api.get('/api/parent/ai-summary')
                ]);
                setData(dataRes.data);
                setSummary(summaryRes.data.summary);
            } catch (err) {
                console.error('Failed to fetch parent data', err);
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

    const student = data?.student || { name: 'Apollo Student' };

    return (
        <DashboardLayout>
            <div className="p-8">
                <header className="mb-10">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="px-3 py-1 rounded-full bg-apollo-indigo/10 text-apollo-indigo font-black text-[10px] uppercase tracking-widest">
                            <Eye size={12} className="inline mr-1" /> Observation Mode
                        </div>
                    </div>
                    <h1 className="text-4xl font-black text-white mb-2">Hello, {authService.getUser()?.name.split(' ')[0]}</h1>
                    <p className="text-gray-400">Monitoring progress for <span className="text-white font-bold">{student.name}</span>.</p>
                </header>

                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="glass rounded-[40px] p-10 border-white/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Sparkles size={120} />
                            </div>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-yellow-400/10 rounded-2xl border border-yellow-400/20">
                                    <BrainCircuit className="text-yellow-400" />
                                </div>
                                <h2 className="text-2xl font-black text-white">AI Weekly Synthesis</h2>
                            </div>
                            <p className="text-gray-300 leading-relaxed mb-6 italic">
                                "{summary || "Analyzing your student's progress and synthesizing a custom growth report... ✨"}"
                            </p>
                            <button className="flex items-center gap-2 text-apollo-indigo font-bold hover:gap-3 transition-all">
                                View Full Narrative Report <ChevronRight size={20} />
                            </button>
                        </div>

                        <div className="glass rounded-[40px] p-8 border-white/5">
                            <h2 className="text-xl font-bold text-white mb-6">Recent Learning Missions</h2>
                            <div className="space-y-4">
                                {(data?.recentActivity || []).map((log: any, idx: number) => (
                                    <div key={idx} className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-white/5 rounded-xl text-gray-400 group-hover:text-white transition-colors">
                                                <Calendar size={18} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-white">{log.activity_type}</div>
                                                <div className="text-xs text-gray-500 uppercase font-black tracking-widest">{log.tool_id}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-green-400 font-black">{log.performance_score}%</div>
                                            <div className="text-[10px] text-gray-600 font-bold uppercase tracking-tighter">Performance</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="glass rounded-[40px] p-8 border-white/5 bg-apollo-indigo/5">
                            <div className="flex items-center gap-3 mb-6">
                                <TrendingUp className="text-apollo-indigo" />
                                <h3 className="font-bold text-white">Growth Stats</h3>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">
                                        <span>Curriculum Mastery</span>
                                        <span className="text-white">78%</span>
                                    </div>
                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-apollo-indigo w-[78%] rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">
                                        <span>Engagement Rank</span>
                                        <span className="text-white">Gold</span>
                                    </div>
                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-yellow-400 w-[92%] rounded-full shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="glass rounded-[40px] p-8 border-white/5">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-white flex items-center gap-2">
                                    <Award className="text-yellow-400" /> Recent Badges
                                </h3>
                                <button className="text-[10px] text-apollo-indigo font-black uppercase">View All</button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center group hover:bg-white/10 transition-all cursor-pointer">
                                    <Star className="text-yellow-400 mx-auto mb-2 group-hover:scale-110 transition-transform" size={24} />
                                    <div className="text-[10px] font-black text-white uppercase tracking-tighter">Math Whiz</div>
                                </div>
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center group hover:bg-white/10 transition-all cursor-pointer">
                                    <Heart className="text-red-400 mx-auto mb-2 group-hover:scale-110 transition-transform" size={24} />
                                    <div className="text-[10px] font-black text-white uppercase tracking-tighter">Consistent</div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-blue-500/10 rounded-[40px] border border-blue-500/20 relative overflow-hidden">
                            <Info className="absolute -top-4 -right-4 w-24 h-24 text-blue-400 opacity-5" />
                            <h3 className="font-bold text-blue-400 mb-3 flex items-center gap-2">
                                <Sparkles size={16} /> Pro Parent Tip
                            </h3>
                            <p className="text-xs text-blue-200/60 leading-relaxed font-medium">
                                Studies show that students who review their AI narrative reports with a parent improve their retention by up to 22%.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ParentDashboard;
