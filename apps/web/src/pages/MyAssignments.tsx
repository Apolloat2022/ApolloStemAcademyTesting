import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import {
    ClipboardList,
    Clock,
    CheckCircle2,
    Play,
    Send,
    Plus,
    Target,
    Calendar,
    BookOpen,
    RefreshCw,
    X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const MyAssignments: React.FC = () => {
    const navigate = useNavigate();

    const [assignments, setAssignments] = useState<any[]>([]);
    const [goals, setGoals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'assignments' | 'goals'>('assignments');
    const [showGoalModal, setShowGoalModal] = useState(false);
    const [newGoal, setNewGoal] = useState({
        title: '',
        description: '',
        subject: '',
        targetDate: '',
        priority: 'medium' as 'low' | 'medium' | 'high'
    });
    const [googleStatus, setGoogleStatus] = useState({
        connected: false,
        link: '',
        assignmentCount: 0
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [aRes, gRes, gsRes] = await Promise.all([
                api.get('/api/student/assignments'),
                api.get('/api/student/goals'),
                api.get('/api/google/status')
            ]);
            setAssignments(aRes.data || []);
            setGoals(gRes.data.goals || []);
            setGoogleStatus(gsRes.data);
        } catch (err) {
            console.error('Failed to fetch data', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCreateGoal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newGoal.title.trim()) return;
        try {
            const res = await api.post('/api/student/goals', newGoal);
            if (res.data.success) {
                setGoals([...goals, res.data.goal]);
                setNewGoal({ title: '', description: '', subject: '', targetDate: '', priority: 'medium' });
                setShowGoalModal(false);
                alert('Goal created successfully!');
            }
        } catch (e) {
            console.error(e);
            alert('Failed to create goal');
        }
    };

    const toggleGoal = async (id: number) => {
        try {
            await api.put(`/api/student/goals/${id}/complete`);
            setGoals(goals.map(g => g.id === id ? { ...g, completed: true, completed_at: new Date().toISOString() } : g));
        } catch (e) {
            console.error(e);
            alert('Failed to update goal');
        }
    };

    const handleGoogleConnect = async () => {
        const link = prompt('Enter Google Classroom link or class code:');
        if (!link) return;

        try {
            const response = await api.post('/api/google/connect', { link });
            if (response.data.success) {
                alert('Connected successfully! Syncing assignments...');
                // Trigger sync
                await api.post('/api/google/sync');
                fetchData();
            } else {
                alert('Failed to connect. Please check the link.');
            }
        } catch (error) {
            console.error('Connection error:', error);
            alert('Connection failed. Please try again.');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'submitted':
            case 'completed': return 'text-green-400 bg-green-400/10';
            case 'in-progress': return 'text-yellow-400 bg-yellow-400/10';
            case 'pending': return 'text-blue-400 bg-blue-400/10';
            default: return 'text-gray-400 bg-gray-400/10';
        }
    };

    const handleSubmission = async (assignmentId: string) => {
        try {
            await api.post(`/api/assignments/${assignmentId}/submit`, {
                content: "AI-assisted assignment content completed via Hub."
            });
            alert('Mission Accomplished! Your work has been submitted.');
            fetchData();
        } catch (err: any) {
            console.error('Submission failed', err);
            alert('Submission failed. Please try again.');
        }
    };

    return (
        <DashboardLayout>
            <div className="p-8 max-w-7xl mx-auto">
                <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">My Assignments</h1>
                        <p className="text-gray-400">Manage your coursework and personal learning goals.</p>
                    </div>
                </header>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    <div className="glass p-6 rounded-[32px] border-white/5 bg-blue-500/5">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">Assignments</p>
                            <BookOpen className="w-6 h-6 text-blue-400" />
                        </div>
                        <p className="text-4xl font-black text-white">{assignments.length}</p>
                    </div>

                    <div className="glass p-6 rounded-[32px] border-white/5 bg-green-500/5">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">Personal Goals</p>
                            <Target className="w-6 h-6 text-green-400" />
                        </div>
                        <p className="text-4xl font-black text-white">{goals.length}</p>
                    </div>

                    <div className="glass p-6 rounded-[32px] border-white/5 bg-yellow-500/5">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">Due Soon</p>
                            <Calendar className="w-6 h-6 text-yellow-400" />
                        </div>
                        <p className="text-4xl font-black text-white">
                            {assignments.filter(a => {
                                if (!a.due_date) return false;
                                const dueDate = new Date(a.due_date);
                                const now = new Date();
                                const nextWeek = new Date();
                                nextWeek.setDate(now.getDate() + 7);
                                return dueDate >= now && dueDate <= nextWeek;
                            }).length}
                        </p>
                    </div>

                    <div className="glass p-6 rounded-[32px] border-white/5 bg-purple-500/5">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">Google Classroom</p>
                            <div className={`p-1.5 rounded-full ${googleStatus.connected ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                                <div className={`w-2 h-2 rounded-full ${googleStatus.connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                            </div>
                        </div>
                        <p className="text-lg font-bold text-white">
                            {googleStatus.connected ? 'Connected' : 'Not Linked'}
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-4 mb-10">
                    <button
                        onClick={() => setShowGoalModal(true)}
                        className="flex items-center gap-2 px-8 py-4 bg-apollo-indigo text-white rounded-2xl font-bold hover:scale-105 transition-all shadow-lg shadow-apollo-indigo/20"
                    >
                        <Plus size={20} />
                        Create New Goal
                    </button>

                    <button
                        onClick={handleGoogleConnect}
                        className="flex items-center gap-2 px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold hover:bg-white/10 transition-all"
                    >
                        <BookOpen size={20} />
                        {googleStatus.connected ? 'Reconnect Classroom' : 'Link Google Classroom'}
                    </button>

                    <button
                        onClick={fetchData}
                        className="flex items-center gap-2 px-6 py-4 bg-white/5 border border-white/10 text-gray-400 rounded-2xl font-bold hover:text-white transition-all"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-8 mb-8 border-b border-white/10">
                    <button
                        onClick={() => setActiveTab('assignments')}
                        className={`pb-4 px-2 font-black text-sm uppercase tracking-[0.2em] transition-all ${activeTab === 'assignments' ? 'text-apollo-indigo border-b-2 border-apollo-indigo' : 'text-gray-500 hover:text-white'}`}
                    >
                        Class Assignments ({assignments.filter(a => a.status !== 'submitted').length})
                    </button>
                    <button
                        onClick={() => setActiveTab('goals')}
                        className={`pb-4 px-2 font-black text-sm uppercase tracking-[0.2em] transition-all ${activeTab === 'goals' ? 'text-apollo-indigo border-b-2 border-apollo-indigo' : 'text-gray-500 hover:text-white'}`}
                    >
                        Personal Goals ({goals.filter(g => !g.completed).length})
                    </button>
                </div>

                {/* Content */}
                <div className="grid gap-6">
                    {loading && assignments.length === 0 ? (
                        <div className="text-center py-20">
                            <RefreshCw className="w-12 h-12 animate-spin mx-auto mb-4 text-apollo-indigo" />
                            <p className="text-gray-500 font-bold uppercase tracking-widest">Loading missions...</p>
                        </div>
                    ) : activeTab === 'assignments' ? (
                        assignments.length === 0 ? (
                            <div className="text-center py-20 glass rounded-[32px] border-white/5 border-dashed">
                                <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-700" />
                                <h3 className="text-xl font-bold text-white mb-2">No Class Assignments</h3>
                                <p className="text-gray-500 max-w-sm mx-auto">Link your Google Classroom to automatically sync your STEM academy missions.</p>
                            </div>
                        ) : (
                            assignments.map((asgn) => (
                                <div key={asgn.id} className="glass rounded-[32px] p-8 border-white/5 hover:border-apollo-indigo/30 transition-all group">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                                        <div className="flex items-start gap-6">
                                            <div className={`p-5 rounded-[24px] ${asgn.status === 'submitted' ? 'bg-green-500/10' : 'bg-apollo-indigo/10'}`}>
                                                <ClipboardList className={asgn.status === 'submitted' ? 'text-green-400' : 'text-apollo-indigo'} size={28} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-4 mb-2">
                                                    <h3 className="text-2xl font-black text-white">{asgn.title}</h3>
                                                    <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(asgn.status)}`}>
                                                        {asgn.status}
                                                    </span>
                                                </div>
                                                <p className="text-gray-400 leading-relaxed max-w-2xl">{asgn.description}</p>
                                                <div className="flex items-center gap-6 mt-4 text-xs font-bold uppercase tracking-widest text-gray-500">
                                                    <span className="flex items-center gap-2"><Clock size={14} className="text-apollo-indigo" /> {asgn.due_date || 'No Date'}</span>
                                                    <span className="flex items-center gap-2"><Target size={14} className="text-apollo-indigo" /> {asgn.subject}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            {asgn.status !== 'submitted' ? (
                                                <>
                                                    <button
                                                        onClick={() => {
                                                            const toolMap: Record<string, string> = { 'Math': 'math', 'Science': 'science', 'Language Arts': 'study' };
                                                            const tool = toolMap[asgn.subject] || 'study';
                                                            navigate(`/student/hub?tool=${tool}`);
                                                        }}
                                                        className="px-8 py-4 bg-apollo-indigo text-white rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-apollo-indigo/20"
                                                    >
                                                        <Play size={18} fill="currentColor" />
                                                        {asgn.status === 'in-progress' ? 'Resume Mission' : 'Start Mission'}
                                                    </button>

                                                    {asgn.status === 'in-progress' && (
                                                        <button
                                                            onClick={async () => {
                                                                const content = window.prompt("Submit your assignment response:");
                                                                if (content) await handleSubmission(asgn.id);
                                                            }}
                                                            className="p-4 bg-white/5 border border-white/10 text-white rounded-2xl hover:bg-white/10 transition-all"
                                                            title="Submit Now"
                                                        >
                                                            <Send size={20} />
                                                        </button>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="flex items-center gap-3 text-green-400 font-black uppercase tracking-widest px-6 py-3 bg-green-400/5 rounded-2xl border border-green-400/20">
                                                    <CheckCircle2 size={20} />
                                                    Mission Accomplished
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )
                    ) : (
                        // Goals View
                        <div className="space-y-4">
                            {goals.length > 0 ? goals.map((goal) => (
                                <div
                                    key={goal.id}
                                    className={`p-8 rounded-[32px] border transition-all flex items-center justify-between group ${goal.completed ? 'bg-green-500/5 border-green-500/10' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                                >
                                    <div className="flex items-center gap-6">
                                        <button
                                            onClick={() => !goal.completed && toggleGoal(goal.id)}
                                            disabled={goal.completed}
                                            className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all ${goal.completed ? 'bg-green-500 border-green-500' : 'border-gray-500 hover:border-apollo-indigo'}`}
                                        >
                                            {goal.completed && <CheckCircle2 size={24} className="text-black" strokeWidth={3} />}
                                        </button>
                                        <div>
                                            <h4 className={`text-xl font-bold transition-all ${goal.completed ? 'text-gray-500 line-through' : 'text-white'}`}>
                                                {goal.title}
                                            </h4>
                                            {goal.description && <p className="text-gray-500 text-sm mt-1">{goal.description}</p>}
                                            <div className="flex items-center gap-4 mt-2">
                                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${goal.priority === 'high' ? 'bg-red-500/10 text-red-500' :
                                                    goal.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-blue-500/10 text-blue-500'
                                                    }`}>
                                                    {goal.priority}
                                                </span>
                                                {goal.target_date && (
                                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                                        Target: {goal.target_date}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {goal.completed && (
                                        <div className="text-xs font-bold text-green-500 uppercase tracking-widest">
                                            Completed {new Date(goal.completed_at).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>
                            )) : (
                                <div className="text-center py-20 glass rounded-[32px] border-white/5 border-dashed">
                                    <Target className="w-16 h-16 mx-auto mb-4 text-gray-700" />
                                    <h3 className="text-xl font-bold text-white mb-2">No Personal Goals</h3>
                                    <p className="text-gray-500 max-w-sm mx-auto">Set your own STEM objectives and track your path to mastery.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Goal Creation Modal */}
            {showGoalModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="glass w-full max-w-lg rounded-[40px] border-white/10 p-10 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-2 h-full bg-apollo-indigo" />

                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-3xl font-black text-white italic">Create New <span className="text-apollo-indigo">Goal</span></h2>
                            <button onClick={() => setShowGoalModal(false)} className="p-2 hover:bg-white/10 rounded-full text-gray-400">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateGoal} className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 font-black">Goal Title</label>
                                <input
                                    autoFocus
                                    required
                                    type="text"
                                    value={newGoal.title}
                                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                                    placeholder="E.g., Master Rocket Physics"
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-apollo-indigo/50 font-bold"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">Description (Optional)</label>
                                <textarea
                                    value={newGoal.description}
                                    onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                                    placeholder="Enter details about this goal..."
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-apollo-indigo/50 h-24 resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">Priority</label>
                                    <select
                                        value={newGoal.priority}
                                        onChange={(e) => setNewGoal({ ...newGoal, priority: e.target.value as any })}
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-apollo-indigo/50 font-bold appearance-none"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">Target Date</label>
                                    <input
                                        type="date"
                                        value={newGoal.targetDate}
                                        onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-apollo-indigo/50 font-bold"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-5 bg-apollo-indigo text-white font-black rounded-2xl hover:scale-[1.02] transition-all shadow-xl shadow-apollo-indigo/20 mt-4 uppercase tracking-widest text-sm"
                            >
                                Launch Goal
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default MyAssignments;
