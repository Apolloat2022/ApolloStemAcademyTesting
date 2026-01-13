import React, { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Search, Filter, MoreVertical, GraduationCap, TrendingUp, Mail, ShieldAlert } from 'lucide-react';

const ClassRoster: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const students = [
        { id: '1', name: 'John Doe', level: 'Grade 8', status: 'Active', progress: 85, lastActive: '2 hours ago', alert: false },
        { id: '2', name: 'Alice Smith', level: 'Grade 7', status: 'Struggling', progress: 62, lastActive: '5 mins ago', alert: true },
        { id: '3', name: 'Bob Wilson', level: 'Grade 8', status: 'Active', progress: 91, lastActive: '1 day ago', alert: false },
        { id: '4', name: 'Sarah Connor', level: 'Grade 9', status: 'Excelling', progress: 98, lastActive: '10 mins ago', alert: false },
        { id: '5', name: 'Kevin Lee', level: 'Grade 8', status: 'Inactive', progress: 45, lastActive: '3 days ago', alert: true },
    ];

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="p-8">
                <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-bold mb-2 text-white">Class Roster</h1>
                        <p className="text-gray-400">Manage your students and monitor their real-time growth.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                type="text"
                                placeholder="Search students..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-6 text-sm focus:ring-2 focus:ring-apollo-indigo outline-none w-64 transition-all"
                            />
                        </div>
                        <button className="p-3 bg-white/5 border border-white/10 rounded-2xl text-gray-400 hover:text-white transition-all">
                            <Filter size={20} />
                        </button>
                    </div>
                </header>

                <div className="grid gap-4">
                    <div className="glass px-8 py-4 rounded-2xl border-white/5 bg-white/5 flex items-center justify-between text-xs font-bold text-gray-500 uppercase tracking-widest">
                        <div className="flex-1">Student Name</div>
                        <div className="w-32">Status</div>
                        <div className="w-48 px-4">AI Progress</div>
                        <div className="w-32">Last Activity</div>
                        <div className="w-10"></div>
                    </div>

                    {filteredStudents.map((student) => (
                        <div key={student.id} className="glass px-8 py-6 rounded-3xl border-white/5 hover:border-apollo-indigo/30 transition-all group flex items-center justify-between">
                            <div className="flex-1 flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl text-white ${student.alert ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-apollo-indigo/20 text-apollo-indigo border border-apollo-indigo/30'}`}>
                                    {student.name[0]}
                                </div>
                                <div>
                                    <div className="font-bold text-white flex items-center gap-2">
                                        {student.name}
                                        {student.alert && <ShieldAlert size={14} className="text-red-400 animate-pulse" />}
                                    </div>
                                    <div className="text-xs text-gray-500 flex items-center gap-1">
                                        <GraduationCap size={12} /> {student.level}
                                    </div>
                                </div>
                            </div>

                            <div className="w-32">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${student.status === 'Struggling' ? 'text-red-400 bg-red-400/10' :
                                    student.status === 'Excelling' ? 'text-green-400 bg-green-400/10' :
                                        student.status === 'Inactive' ? 'text-gray-400 bg-gray-400/10' :
                                            'text-blue-400 bg-blue-400/10'
                                    }`}>
                                    {student.status}
                                </span>
                            </div>

                            <div className="w-48 px-4">
                                <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1.5 font-bold">
                                    <span>PROFICIENCY</span>
                                    <span>{student.progress}%</span>
                                </div>
                                <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ${student.progress > 80 ? 'bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.3)]' :
                                            student.progress > 60 ? 'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.3)]' :
                                                'bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.3)]'
                                            }`}
                                        style={{ width: `${student.progress}%` }}
                                    />
                                </div>
                            </div>

                            <div className="w-32 text-sm text-gray-400">
                                {student.lastActive}
                            </div>

                            <div className="w-10 flex justify-end">
                                <div className="relative group/menu">
                                    <button className="p-2 text-gray-500 hover:text-white transition-all">
                                        <MoreVertical size={20} />
                                    </button>
                                    <div className="absolute right-0 top-full mt-2 w-48 glass rounded-2xl border-white/10 p-2 hidden group-hover/menu:block z-50 shadow-2xl">
                                        <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 rounded-xl transition-all">
                                            <TrendingUp size={16} /> View Analytics
                                        </button>
                                        <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 rounded-xl transition-all">
                                            <Mail size={16} /> Message Student
                                        </button>
                                        <div className="h-px bg-white/5 my-2" />
                                        <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-400/5 rounded-xl transition-all">
                                            <ShieldAlert size={16} /> AI Intervention
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ClassRoster;
