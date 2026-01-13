import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Heart, MessagesSquare, ShieldAlert, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const VolunteerDashboard: React.FC = () => {
    const navigate = useNavigate();

    return (
        <DashboardLayout>
            <div className="p-8">
                <header className="mb-10 flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">Volunteer Portal</h1>
                        <p className="text-gray-400">Supporting the next generation of STEM leaders.</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="glass px-6 py-2 rounded-2xl flex items-center gap-2 border-red-500/20 bg-red-500/5">
                            <ShieldAlert size={18} className="text-red-400 animate-pulse" />
                            <span className="text-sm font-bold text-red-400">2 Urgent Alerts</span>
                        </div>
                    </div>
                </header>

                <div className="grid md:grid-cols-2 gap-8">
                    <div className="glass p-8 rounded-3xl border-white/5 hover:bg-white/5 transition-all group cursor-pointer">
                        <div className="w-14 h-14 bg-pink-500/10 rounded-2xl flex items-center justify-center mb-6">
                            <Heart className="text-pink-400" size={28} />
                        </div>
                        <h2 className="text-2xl font-bold mb-4">Assigned Students</h2>
                        <p className="text-gray-400 mb-6">Monitor the progress and activity of your assigned mentees. Currently 4 students assigned.</p>
                        <button className="text-pink-400 font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
                            View Roster <ArrowRight size={18} />
                        </button>
                    </div>

                    <div
                        onClick={() => navigate('/volunteer/messages')}
                        className="glass p-8 rounded-3xl border-white/5 hover:bg-white/5 transition-all group cursor-pointer"
                    >
                        <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6">
                            <MessagesSquare className="text-blue-400" size={28} />
                        </div>
                        <h2 className="text-2xl font-bold mb-4">Communication Hub</h2>
                        <p className="text-gray-400 mb-6">Direct access to your mentees and their teachers for coordinated support.</p>
                        <button className="text-blue-400 font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
                            Open Messages <ArrowRight size={18} />
                        </button>
                    </div>
                </div>

                <div className="mt-12 glass rounded-3xl p-8 border-white/5">
                    <h2 className="text-2xl font-bold mb-6">Mentorship Alerts</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-6 bg-red-500/5 border border-red-500/10 rounded-2xl">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-red-400/20 flex items-center justify-center">
                                    <ShieldAlert size={20} className="text-red-400" />
                                </div>
                                <div>
                                    <div className="font-bold text-white">Alice Smith - At Risk</div>
                                    <div className="text-sm text-gray-500">Failed 3 consecutive Science Lab attempts. Intervention needed.</div>
                                </div>
                            </div>
                            <button onClick={() => navigate('/volunteer/messages')} className="px-4 py-2 bg-red-400 text-white text-xs font-bold rounded-xl">Message Alice</button>
                        </div>
                        <div className="flex items-center justify-between p-6 bg-white/5 border border-white/5 rounded-2xl">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-apollo-indigo/20 flex items-center justify-center font-bold text-apollo-indigo">KM</div>
                                <div>
                                    <div className="font-bold text-white">Kevin Lee - Milestone Reached</div>
                                    <div className="text-sm text-gray-500">Kevin just completed the Algebra Foundations module!</div>
                                </div>
                            </div>
                            <button onClick={() => navigate('/volunteer/messages')} className="px-4 py-2 bg-apollo-indigo text-white text-xs font-bold rounded-xl">Congrats Kevin</button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default VolunteerDashboard;
