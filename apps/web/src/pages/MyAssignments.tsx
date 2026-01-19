import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { ClipboardList, Clock, CheckCircle2, Play, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';


const MyAssignments: React.FC = () => {
    const navigate = useNavigate();

    const [assignments, setAssignments] = React.useState<any[]>([]);
    const [tasks, setTasks] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [newTask, setNewTask] = React.useState('');
    const [showTaskInput, setShowTaskInput] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState<'assignments' | 'tasks'>('assignments');

    const fetchData = React.useCallback(async () => {
        try {
            const [aRes, tRes] = await Promise.all([
                api.get('/api/student/assignments'),
                api.get('/api/student/tasks')
            ]);
            setAssignments(aRes.data);
            setTasks(tRes.data);
        } catch (err) {
            console.error('Failed to fetch data', err);
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchData();
    }, [fetchData]);

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
        // Optimistic
        setTasks(tasks.map(t => t.id === id ? { ...t, is_completed: !currentStatus } : t));
        try {
            await api.put(`/api/student/tasks/${id}`, { is_completed: !currentStatus });
        } catch (e) {
            console.error(e);
            setTasks(tasks.map(t => t.id === id ? { ...t, is_completed: currentStatus } : t));
        }
    };

    const handleGoogleSync = async () => {
        try {
            const res = await api.post('/api/google/sync');
            alert(res.data.message || 'Google Classroom Linked & Synced!');
            fetchData(); // Refresh to show imported assignments
        } catch (e) {
            alert('Failed to sync');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'text-green-400 bg-green-400/10';
            case 'in-progress': return 'text-yellow-400 bg-yellow-400/10';
            case 'todo': return 'text-blue-400 bg-blue-400/10';
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
            <div className="p-8">
                <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">My Assignments</h1>
                        <p className="text-gray-400">Manage your coursework and personal learning goals.</p>
                    </div>
                    <div className="flex gap-4 items-center">
                        <button
                            onClick={handleGoogleSync}
                            className="bg-white/5 border border-white/10 hover:bg-white/10 text-white px-6 py-2 rounded-2xl font-bold flex items-center gap-2 transition-all"
                        >
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                            Link Google Classroom
                        </button>
                    </div>
                </header>

                {/* Tabs */}
                <div className="flex items-center gap-6 mb-8 border-b border-white/10">
                    <button
                        onClick={() => setActiveTab('assignments')}
                        className={`pb-4 px-2 font-bold text-lg transition-all ${activeTab === 'assignments' ? 'text-apollo-indigo border-b-2 border-apollo-indigo' : 'text-gray-500 hover:text-white'}`}
                    >
                        Class Assignments ({assignments.filter(a => a.status !== 'completed').length})
                    </button>
                    <button
                        onClick={() => setActiveTab('tasks')}
                        className={`pb-4 px-2 font-bold text-lg transition-all ${activeTab === 'tasks' ? 'text-apollo-indigo border-b-2 border-apollo-indigo' : 'text-gray-500 hover:text-white'}`}
                    >
                        Personal Goals ({tasks.filter(t => !t.is_completed).length})
                    </button>
                </div>

                <div className="grid gap-6">
                    {loading ? (
                        <div className="text-center py-20 text-gray-400 animate-pulse">Loading...</div>
                    ) : activeTab === 'assignments' ? (
                        assignments.length === 0 ? (
                            <div className="text-center py-20 text-gray-400">No assignments found. Sync Google Classroom to import!</div>
                        ) : (
                            assignments.map((asgn) => (
                                <div key={asgn.id} className="glass rounded-3xl p-6 border-white/5 hover:border-apollo-indigo/30 transition-all group">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="flex items-start gap-5">
                                            <div className={`p-4 rounded-2xl ${asgn.status === 'completed' ? 'bg-green-500/10' : 'bg-apollo-indigo/10'}`}>
                                                <ClipboardList className={asgn.status === 'completed' ? 'text-green-400' : 'text-apollo-indigo'} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3 className="text-xl font-bold text-white">{asgn.title}</h3>
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(asgn.status)}`}>
                                                        {asgn.status}
                                                    </span>
                                                </div>
                                                <p className="text-gray-400 text-sm max-w-xl">{asgn.description}</p>
                                                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                                                    <span className="flex items-center gap-1"><Clock size={14} /> {asgn.due_date || asgn.dueDate}</span>
                                                    <span className="w-1 h-1 bg-gray-700 rounded-full" />
                                                    <span className="font-bold text-apollo-indigo uppercase">{asgn.subject}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 self-end md:self-auto">
                                            {asgn.status !== 'completed' ? (
                                                <>
                                                    {asgn.status === 'in-progress' && (
                                                        <button
                                                            onClick={async () => {
                                                                const content = window.prompt("Enter your assignment response or URL:");
                                                                if (content) {
                                                                    await handleSubmission(asgn.id);
                                                                }
                                                            }}
                                                            className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-white/10 transition-all"
                                                        >
                                                            <Send size={18} />
                                                            Submit
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => {
                                                            const toolMap: Record<string, string> = { 'Math': 'math', 'Science': 'science', 'Language Arts': 'study' };
                                                            const tool = toolMap[asgn.subject] || 'study';
                                                            navigate(`/student/hub?tool=${tool}`);
                                                        }}
                                                        className="px-6 py-3 bg-apollo-indigo text-white rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-apollo-indigo/20"
                                                    >
                                                        <Play size={18} fill="currentColor" />
                                                        {asgn.status === 'in-progress' ? 'Resume' : 'Start Task'}
                                                    </button>
                                                </>
                                            ) : (
                                                <div className="flex items-center gap-2 text-green-400 font-bold px-4 py-2 bg-green-400/5 rounded-xl border border-green-400/20">
                                                    <CheckCircle2 size={18} />
                                                    Submitted
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )
                    ) : (
                        // Personal Tasks View
                        <div>
                            <div className="flex gap-4 mb-6">
                                <button
                                    onClick={() => setShowTaskInput(!showTaskInput)}
                                    className="bg-white/5 border border-white/10 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-white/10 transition-all text-sm"
                                >
                                    + Add New Goal
                                </button>
                            </div>

                            {showTaskInput && (
                                <form onSubmit={handleAddTask} className="mb-6 animate-in fade-in slide-in-from-top-2 p-4 glass rounded-2xl border-white/10">
                                    <h3 className="text-white font-bold mb-2">Create New Goal</h3>
                                    <div className="flex gap-2">
                                        <input
                                            autoFocus
                                            type="text"
                                            value={newTask}
                                            onChange={(e) => setNewTask(e.target.value)}
                                            placeholder="E.g., Read Chapter 4 of Physics..."
                                            className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-apollo-indigo/50"
                                        />
                                        <button type="submit" className="bg-apollo-indigo px-6 rounded-xl font-bold text-white hover:bg-apollo-indigo/80">
                                            Add
                                        </button>
                                    </div>
                                </form>
                            )}

                            <div className="space-y-4">
                                {tasks.length > 0 ? tasks.map((task) => (
                                    <div
                                        key={task.id}
                                        onClick={() => toggleTask(task.id, Boolean(task.is_completed))}
                                        className={`p-6 rounded-3xl border transition-all cursor-pointer flex items-center gap-4 group ${task.is_completed ? 'bg-green-500/5 border-green-500/10' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                                    >
                                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${task.is_completed ? 'bg-green-500 border-green-500' : 'border-gray-500 group-hover:border-white'}`}>
                                            {task.is_completed && <CheckCircle2 size={16} className="text-black" strokeWidth={3} />}
                                        </div>
                                        <span className={`text-lg transition-colors ${task.is_completed ? 'text-gray-500 line-through decoration-2 decoration-green-500/50' : 'text-white font-bold'}`}>
                                            {task.title}
                                        </span>
                                    </div>
                                )) : (
                                    <div className="text-center py-20 text-gray-400 italic">
                                        No personal goals yet. Create one to organize your self-study!
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default MyAssignments;
