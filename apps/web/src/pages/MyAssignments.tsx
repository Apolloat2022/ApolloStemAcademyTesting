import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { ClipboardList, Clock, CheckCircle2, Play, AlertCircle, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';


const MyAssignments: React.FC = () => {
    const navigate = useNavigate();

    const [assignments, setAssignments] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchAssignments = async () => {
            try {
                const res = await api.get('/api/student/assignments');
                setAssignments(res.data);
            } catch (err) {
                console.error('Failed to fetch assignments', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAssignments();
    }, []);

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
            // In a real app, we would refresh the list
            window.location.reload();
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
                        <p className="text-gray-400">Keep track of your active learning tasks.</p>
                    </div>
                    <div className="flex gap-4 items-center">
                        <button
                            onClick={async () => {
                                try {
                                    await api.post('/api/google/sync');
                                    alert('Google Classroom Linked & Synced!');
                                } catch (e) {
                                    alert('Failed to sync');
                                }
                            }}
                            className="bg-white/5 border border-white/10 hover:bg-white/10 text-white px-6 py-2 rounded-2xl font-bold flex items-center gap-2 transition-all transition-colors"
                        >
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                            Link Google Classroom
                        </button>
                        <div className="glass px-6 py-2 rounded-2xl flex items-center gap-2 border-white/5">
                            <AlertCircle size={18} className="text-red-400" />
                            <span className="text-sm font-bold">2 Due Soon</span>
                        </div>
                    </div>
                </header>

                <div className="grid gap-6">
                    {loading ? (
                        <div className="text-center py-20 text-gray-400 animate-pulse">Loading assignments...</div>
                    ) : assignments.length === 0 ? (
                        <div className="text-center py-20 text-gray-400">No assignments found.</div>
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
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default MyAssignments;
