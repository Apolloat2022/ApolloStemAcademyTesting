import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import {
    BookOpen,
    GraduationCap,
    Calendar,
    Users,
    Clock,
    Award,
    BrainCircuit,
    Sparkles
} from 'lucide-react';

const APTeachers: React.FC = () => {
    const stats = [
        { label: 'AP Physics C', students: 12, prep: '85%', color: 'text-blue-400' },
        { label: 'AP Calculus BC', students: 18, prep: '92%', color: 'text-indigo-400' },
        { label: 'AP Computer Science', students: 24, prep: '78%', color: 'text-purple-400' },
    ];

    const milestones = [
        { title: 'Unit 4 Exam Prep', date: 'Next Tuesday', status: 'Upcoming' },
        { title: 'Syllabus Alignment Review', date: 'Completed', status: 'Done' },
        { title: 'College Credit Documentation', date: 'Jan 25, 2026', status: 'Pending' },
    ];

    return (
        <DashboardLayout>
            <div className="p-8">
                <header className="mb-10">
                    <div className="flex items-center gap-3 mb-2">
                        <GraduationCap className="text-apollo-indigo" size={32} />
                        <h1 className="text-4xl font-bold text-white">AP Teacher Dashboard</h1>
                    </div>
                    <p className="text-gray-400">Curate elite college-credit learning experiences and track exam readiness.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                    {stats.map((item, idx) => (
                        <div key={idx} className="glass p-6 rounded-3xl border-white/5 hover:border-apollo-indigo/30 transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className={`font-bold text-lg ${item.color}`}>{item.label}</h3>
                                <div className="p-2 bg-white/5 rounded-xl group-hover:bg-apollo-indigo/10 transition-colors">
                                    <Users size={18} className="text-gray-400 group-hover:text-apollo-indigo" />
                                </div>
                            </div>
                            <div className="text-3xl font-black text-white mb-1">{item.students}</div>
                            <div className="text-xs text-gray-500 uppercase tracking-widest font-bold">Students Enrolled</div>
                            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                                <span className="text-sm text-gray-400">Exam Readiness:</span>
                                <span className="text-sm font-bold text-green-400">{item.prep}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* AP Preparation Timeline */}
                    <div className="glass p-8 rounded-3xl border-white/5 h-fit">
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Calendar className="text-apollo-indigo" size={20} />
                            Exam Prep Timeline
                        </h2>
                        <div className="space-y-6">
                            {milestones.map((m, idx) => (
                                <div key={idx} className="flex gap-4 group">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-3 h-3 rounded-full mt-1.5 ${m.status === 'Done' ? 'bg-green-400' : 'bg-apollo-indigo'}`} />
                                        {idx !== milestones.length - 1 && <div className="w-px h-full bg-white/10 my-1" />}
                                    </div>
                                    <div className="pb-4">
                                        <h4 className="font-bold text-white">{m.title}</h4>
                                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                            <span className="flex items-center gap-1 font-medium italic"><Clock size={14} /> {m.date}</span>
                                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${m.status === 'Done' ? 'bg-green-400/10 text-green-400' : 'bg-apollo-indigo/10 text-apollo-indigo'}`}>
                                                {m.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-4 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                            <Sparkles size={18} className="text-yellow-400" />
                            Generate AI Exam Strategy
                        </button>
                    </div>

                    {/* Quick Tools */}
                    <div className="space-y-6">
                        <div className="glass p-8 rounded-3xl border-white/5">
                            <h2 className="text-xl font-bold text-white mb-4">Syllabus Insights</h2>
                            <p className="text-gray-400 text-sm leading-relaxed mb-6">
                                Your current pacing is 4 days ahead of the national AP average for Mechanics.
                                Consider introducing "Rotational Dynamics" early.
                            </p>
                            <div className="flex gap-4">
                                <div className="flex-1 bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-apollo-indigo/20 transition-all cursor-pointer">
                                    <Award size={24} className="text-yellow-400 mb-2" />
                                    <div className="font-bold text-white text-sm">Collge Credit</div>
                                    <div className="text-[10px] text-gray-500 uppercase">Alignment Tool</div>
                                </div>
                                <div className="flex-1 bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-apollo-indigo/20 transition-all cursor-pointer">
                                    <BrainCircuit size={24} className="text-indigo-400 mb-2" />
                                    <div className="font-bold text-white text-sm">Curriculum</div>
                                    <div className="text-[10px] text-gray-500 uppercase">AI Generator</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-apollo-indigo p-8 rounded-3xl shadow-xl shadow-apollo-indigo/20 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                                <BookOpen size={120} />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2 relative z-10">AP Exam Bank</h3>
                            <p className="text-indigo-100 text-sm mb-6 relative z-10">Access 500+ curated AP questions with AI-generated step-by-step hint systems.</p>
                            <button className="px-6 py-3 bg-white text-apollo-indigo font-bold rounded-xl hover:scale-105 transition-all relative z-10">
                                Browse Question Bank
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default APTeachers;
