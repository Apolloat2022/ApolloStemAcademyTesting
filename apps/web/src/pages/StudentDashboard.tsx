import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { authService } from '../services/authService';
import GoogleClassroomConnect from '../components/GoogleClassroomConnect';
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
    const [stats, setStats] = useState({ lessons: 0, assignments: 0, accuracy: 0 });
    const [tasks, setTasks] = useState<any[]>([]);
    const [newTask, setNewTask] = useState('');
    const [showTaskInput, setShowTaskInput] = useState(false);

    const fetchDashboardData = async () => {
        try {
            // api client automatically handles token
            const [rRes, aRes, sRes, tRes] = await Promise.all([
                api.get('/api/student/recommendations'),
                api.get('/api/student/achievements'),
                api.get('/api/student/dashboard-stats'),
                api.get('/api/student/tasks')
            ]);
            setRecs(rRes.data);
            setStats(sRes.data);
            setTasks(tRes.data);

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

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTask.trim()) return;
        try {
            const res = await api.post('/api/student/tasks', { title: newTask });
            setTasks([res.data, ...tasks]);
            setNewTask('');
            setShowTaskInput(false);
        } catch (e) {
            console.error(e);
        }
    };

    const toggleTask = async (id: string, currentStatus: boolean) => {
        // Optimistic update
        setTasks(tasks.map(t => t.id === id ? { ...t, is_completed: !currentStatus } : t));
        try {
            await api.put(`/api/student/tasks/${id}`, { is_completed: !currentStatus });
        } catch (e) {
            console.error(e);
            // Revert on fail
            setTasks(tasks.map(t => t.id === id ? { ...t, is_completed: currentStatus } : t));
        }
    };

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
                <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-white mb-2">Welcome back, {user?.name.split(' ')[0]}! 👋</h1>
                        <p className="text-gray-400">Your STEM journey is evolving. View your missions below.</p>
                    </div>
                    <div className="flex gap-4 items-center">
                        <button
                            onClick={() => navigate('/student/hub')}
                            className="bg-apollo-indigo px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-apollo-indigo/20 text-white"
                        >
                            <Sparkles size={18} />
                            Launch AI Hub
                        </button>
                    </div>
                </header>

                {/* Google Classroom Integration */}
                <div className="mb-8">
                    <GoogleClassroomConnect 
                        userRole="student" 
                        onSyncComplete={fetchDashboardData}
                    />
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Quick Stats */}
                    <div onClick={() => navigate('/student/progress')} className="glass rounded-3xl p-6 flex items-center gap-4 hover:bg-white/5 transition-all cursor-pointer group border-white/5">
                        <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400">
                            <BookOpen size={24} />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Lessons Completed</p>
                            <p className="text-3xl font-bold text-white">{stats.lessons}</p>
                        </div>
                    </div>

                    <div onClick={() => navigate('/student/assignments')} className="glass rounded-3xl p-6 flex items-center gap-4 hover:bg-white/5 transition-all cursor-pointer group border-white/5">
                        <div className="p-3 bg-yellow-500/10 rounded-2xl text-yellow-400">
                            <ClipboardList size={24} />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Pending Assignments</p>
                            <p className="text-3xl font-bold text-white">{stats.assignments}</p>
                        </div>
                    </div>

                    <div onClick={() => navigate('/student/progress')} className="glass rounded-3xl p-6 flex items-center gap-4 hover:bg-white/5 transition-all cursor-pointer group border-white/5">
                        <div className="p-3 bg-green-500/10 rounded-2xl text-green-400">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Overall Accuracy</p>
                            <p className="text-3xl font-bold text-white">{stats.accuracy}%</p>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8 mt-8">
                    {/* AI Learning Missions */}
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
                                <div className="text-center py-10">
                                    <p className="opacity-50 italic text-gray-500 mb-6">No active missions. Generate some in the AI Hub!</p>
                                    <button
                                        onClick={() => navigate('/student/hub')}
                                        className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-apollo-indigo hover:text-white transition-all shadow-xl"
                                    >
                                        Start New Mission
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Personal Tasks & Quick Launch */}
                    <div className="flex flex-col gap-8">
                        <div className="glass rounded-[40px] p-8 bg-apollo-indigo/5 border-apollo-indigo/10 flex-1">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <ClipboardList className="text-apollo-indigo" size={20} />
                                    Personal Goals
                                </h2>
                                <button
                                    onClick={() => setShowTaskInput(!showTaskInput)}
                                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all text-white"
                                >
                                    {showTaskInput ? <X size={16} /> : <span className="text-xl leading-none mb-1">+</span>}
                                </button>
                            </div>

                            {showTaskInput && (
                                <form onSubmit={handleAddTask} className="mb-4 animate-in fade-in slide-in-from-top-2">
                                    <input
                                        autoFocus
                                        type="text"
                                        value={newTask}
                                        onChange={(e) => setNewTask(e.target.value)}
                                        placeholder="Add a new goal..."
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-apollo-indigo/50 text-sm"
                                    />
                                </form>
                            )}

                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {tasks.length > 0 ? tasks.map((task) => (
                                    <div
                                        key={task.id}
                                        onClick={() => toggleTask(task.id, Boolean(task.is_completed))}
                                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 group ${task.is_completed ? 'bg-green-500/5 border-green-500/10' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                                    >
                                        <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-colors ${task.is_completed ? 'bg-green-500 border-green-500' : 'border-gray-500 group-hover:border-white'}`}>
                                            {task.is_completed && <X size={12} className="text-black rotate-45" strokeWidth={4} />}
                                        </div>
                                        <span className={`text-sm font-bold transition-colors ${task.is_completed ? 'text-gray-500 line-through decoration-2 decoration-green-500/50' : 'text-gray-200'}`}>
                                            {task.title}
                                        </span>
                                    </div>
                                )) : (
                                    <div className="text-center py-8 text-gray-500 text-sm italic">
                                        No personal goals yet. Add one to stay focused!
                                    </div>
                                )}
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