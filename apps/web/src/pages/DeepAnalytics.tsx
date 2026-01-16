import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { TrendingUp, Users, Target, Zap, ChevronRight, Sparkles, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';

const DeepAnalytics: React.FC = () => {
    const [alerts, setAlerts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const metrics = [
        { label: 'Avg. Attendance', value: '96%', change: '+2%', icon: Users, color: 'text-blue-400' },
        { label: 'Concept Mastery', value: '78%', change: '+5%', icon: Target, color: 'text-green-400' },
        { label: 'Avg. Engagement', value: '92%', change: '-1%', icon: Zap, color: 'text-yellow-400' },
    ];

    const topTopics = [
        { topic: 'Quadratic Equations', mastery: 92, status: 'Mastered' },
        { topic: 'Linear Functions', mastery: 85, status: 'Mastered' },
        { topic: 'Probability Basics', mastery: 64, status: 'Struggling' },
        { topic: 'Exponents & Radicals', mastery: 42, status: 'Struggling' },
    ];

    useEffect(() => {
        const fetchInsights = async () => {
            try {
                const res = await api.get('/api/alerts/stuck');
                setAlerts(res.data || []);
            } catch (err) {
                console.error("Failed to fetch alerts", err);
            } finally {
                setLoading(false);
            }
        };
        fetchInsights();
    }, []);

    return (
        <DashboardLayout>
            <div className="p-8">
                <header className="mb-10">
                    <h1 className="text-4xl font-bold mb-2">Class Intelligence</h1>
                    <p className="text-gray-400">Deep-dive into performance metrics and AI-driven growth insights.</p>
                </header>

                <div className="grid md:grid-cols-3 gap-6 mb-10">
                    {metrics.map((m, idx) => (
                        <div key={idx} className="glass p-6 rounded-3xl border-white/5 flex items-center justify-between">
                            <div>
                                <div className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">{m.label}</div>
                                <div className="text-4xl font-bold text-white tracking-tighter">{m.value}</div>
                                <div className={`text-xs mt-2 font-bold ${m.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                                    {m.change} from last week
                                </div>
                            </div>
                            <div className={`p-4 rounded-2xl bg-white/5 ${m.color}`}>
                                <m.icon size={28} />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Performance Trends Mock Chart */}
                    <div className="lg:col-span-2 glass rounded-3xl p-8 border-white/5">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                <TrendingUp className="text-apollo-indigo" /> Performance Trends
                            </h2>
                            <div className="flex gap-2">
                                <button className="px-3 py-1 bg-apollo-indigo text-white text-[10px] font-bold rounded-lg">WEEKLY</button>
                                <button className="px-3 py-1 bg-white/5 text-gray-500 text-[10px] font-bold rounded-lg hover:text-white transition-all">MONTHLY</button>
                            </div>
                        </div>

                        <div className="h-64 flex items-end gap-3 mb-4">
                            {[40, 65, 55, 80, 70, 95, 85].map((h, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                                    <div
                                        className="w-full bg-apollo-indigo/20 border-x border-t border-apollo-indigo/40 rounded-t-xl transition-all duration-700 group-hover:bg-apollo-indigo/40 relative overflow-hidden"
                                        style={{ height: `${h}%` }}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10" />
                                    </div>
                                    <span className="text-[10px] text-gray-600 font-bold uppercase">Day {i + 1}</span>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-center text-gray-500 font-medium">Class competence increase of 14% over the last 7 days</p>
                    </div>

                    {/* Topic Mastery */}
                    <div className="glass rounded-3xl p-8 border-white/5">
                        <h2 className="text-2xl font-bold mb-8 text-white">Topic Mastery</h2>
                        <div className="space-y-6">
                            {topTopics.map((item, idx) => (
                                <div key={idx}>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-gray-300 font-medium">{item.topic}</span>
                                        <span className={`font-bold ${item.mastery > 70 ? 'text-green-400' : 'text-red-400'}`}>{item.mastery}%</span>
                                    </div>
                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ${item.mastery > 70 ? 'bg-green-400' : 'bg-red-400'}`}
                                            style={{ width: `${item.mastery}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-10 py-3 bg-white/5 border border-white/10 rounded-xl font-bold text-xs hover:bg-white/10 transition-all flex items-center justify-center gap-2 group">
                            Full Topic Breakdown <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* AI Suggestions */}
                <div className="mt-10 glass rounded-3xl p-8 border-yellow-500/10 bg-yellow-500/5">
                    <div className="flex items-center gap-3 mb-6">
                        <Sparkles size={24} className="text-yellow-400" />
                        <h2 className="text-2xl font-bold text-white">AI-Driven Instruction Plan</h2>
                    </div>
                    {loading ? <div className="text-gray-400 animate-pulse">Analyzing class patterns...</div> : (
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="p-6 bg-white/5 border border-white/5 rounded-2xl relative overflow-hidden group hover:border-red-500/30 transition-all">
                                {alerts.length > 0 && <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full m-4 animate-ping" />}
                                <h3 className="text-lg font-bold text-red-400 mb-2 flex items-center gap-2">
                                    <ShieldAlert size={18} /> Immediate Focus
                                </h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    {alerts.length > 0
                                        ? `${alerts.length} student${alerts.length > 1 ? 's' : ''} triggered 'Stuck' alerts. This indicates repeated struggles with recent concepts.`
                                        : "No critical alerts detected today. Class engagement is optimal."}
                                </p>
                                {alerts.length > 0 && (
                                    <button className="mt-4 text-xs font-bold text-red-300 hover:text-white underline">View {alerts.length} Students</button>
                                )}
                            </div>
                            <div className="p-6 bg-white/5 border border-white/5 rounded-2xl">
                                <h3 className="text-lg font-bold text-green-400 mb-2">Stretch Goals</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    12 students have achieved over 90% in "Quadratic Equations". They are ready for "Introduction to Polynomials" using the Worksheet Generator for extension tasks.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default DeepAnalytics;
