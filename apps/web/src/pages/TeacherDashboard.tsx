import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Users, BookOpen, ClipboardCheck, BarChart3, Sparkles, X, BrainCircuit, CheckCircle2, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import AssignmentSuite from './AssignmentSuite';


const TeacherDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [reviewItem, setReviewItem] = useState<any>(null);
    const [aiInsight, setAiInsight] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [pendingSubmissions, setPendingSubmissions] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'overview' | 'assignments'>('overview');
    const [isSyncing, setIsSyncing] = useState(false);
    const [stats, setStats] = useState({ students: 0, assignments: 0, submissions: 0, engagement: 0 });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [pendingRes, statsRes] = await Promise.all([
                    api.get('/api/submissions/pending'),
                    api.get('/api/teacher/dashboard-stats')
                ]);
                setPendingSubmissions(pendingRes.data);
                setStats(statsRes.data);
            } catch (err) {
                console.error('Failed to fetch dashboard data', err);
            }
        };
        fetchDashboardData();
    }, []);

    const handleReview = (item: any) => {
        setReviewItem(item);
        setAiInsight(null);
    };

    const runAIAnalyze = () => {
        setIsAnalyzing(true);
        // Simulate API call to /api/submissions/:id/analyze
        setTimeout(() => {
            setAiInsight(`AI Analysis for ${reviewItem.student_name}: The student demonstrated proficiency in the submitted work. 
            Strengths: Good technical execution and conceptual understanding.
            Area for Growth: Detail refinement.
            Suggested Grade: 92/100.`);
            setIsAnalyzing(false);
        }, 2000);
    };

    return (
        <DashboardLayout>
            <div className="p-8">
                <header className="mb-10 flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold mb-2 text-white">Teacher Command Center</h1>
                        <p className="text-gray-400">Manage your students and AI-powered curriculum.</p>
                    </div>
                    <div className="flex gap-4 items-center">
                        <button
                            onClick={async () => {
                                setIsSyncing(true);
                                try {
                                    await api.post('/api/google/sync');
                                } catch (e) {
                                    console.error('Sync failed', e);
                                }
                                setIsSyncing(false);
                            }}
                            className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-white/10 transition-all text-sm group"
                        >
                            <RefreshCw size={18} className={`${isSyncing ? 'animate-spin text-apollo-indigo' : 'text-gray-400 group-hover:text-white'}`} />
                            {isSyncing ? 'Syncing Classroom...' : 'Sync Google Classroom'}
                        </button>
                        {reviewItem && (
                            <button
                                onClick={() => setReviewItem(null)}
                                className="bg-white/5 border border-white/10 p-2 rounded-xl hover:bg-white/10 transition-all"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>
                </header>

                {reviewItem ? (
                    <div className="grid lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Submission Details */}
                        <div className="glass rounded-3xl p-8 border-apollo-indigo/20">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 bg-apollo-indigo/20 rounded-full flex items-center justify-center text-2xl font-bold text-apollo-indigo">
                                    {reviewItem.student_name ? reviewItem.student_name[0] : '?'}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">{reviewItem.student_name}</h2>
                                    <p className="text-gray-400">{reviewItem.title || 'Assignment'} • Submitted {new Date(reviewItem.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="bg-white/5 rounded-2xl p-6 border border-white/5 min-h-[300px]">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Student Work</h3>
                                <p className="text-gray-200 leading-relaxed">
                                    {reviewItem.content}
                                </p>
                            </div>

                            <div className="mt-6 flex gap-4">
                                <button className="flex-1 bg-green-500 text-black font-bold py-4 rounded-2xl hover:bg-green-400 transition-all flex items-center justify-center gap-2">
                                    <CheckCircle2 size={20} />
                                    Approve & Grade
                                </button>
                                <button className="px-6 bg-white/5 border border-white/10 rounded-2xl font-bold hover:bg-white/10 transition-all">
                                    Request Revision
                                </button>
                            </div>
                        </div>

                        {/* AI Grading Assistant */}
                        <div className="glass rounded-3xl p-8 border-yellow-500/20 bg-yellow-500/5">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3 text-white">
                                <BrainCircuit className="text-yellow-400" />
                                AI Grading Assistant
                            </h2>

                            {!aiInsight && !isAnalyzing ? (
                                <div className="text-center py-20">
                                    <p className="text-gray-400 mb-6">Need a second opinion? Let Apollo AI analyze this submission.</p>
                                    <button
                                        onClick={runAIAnalyze}
                                        className="bg-yellow-400 text-black px-8 py-4 rounded-2xl font-bold flex items-center gap-2 mx-auto hover:scale-105 transition-all shadow-lg shadow-yellow-400/20"
                                    >
                                        <Sparkles size={20} />
                                        Analyze Submission
                                    </button>
                                </div>
                            ) : isAnalyzing ? (
                                <div className="text-center py-20">
                                    <div className="w-12 h-12 border-4 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin mx-auto mb-4"></div>
                                    <p className="text-yellow-400 font-bold animate-pulse">Consulting Gemini AI...</p>
                                </div>
                            ) : (
                                <div className="space-y-6 animate-in fade-in zoom-in duration-300">
                                    <div className="bg-white/5 border border-yellow-500/20 rounded-2xl p-6 text-gray-200 indent-0">
                                        {aiInsight}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                                            <div className="text-xs text-gray-500 uppercase font-bold mb-1">AI Confidence</div>
                                            <div className="text-xl font-bold text-white">98%</div>
                                        </div>
                                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                                            <div className="text-xs text-gray-500 uppercase font-bold mb-1">Detected Effort</div>
                                            <div className="text-xl font-bold text-white">High</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setAiInsight(null)}
                                        className="w-full text-sm text-gray-400 hover:text-white transition-all"
                                    >
                                        Dismiss AI Analysis
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex gap-8 border-b border-white/10 mb-10">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'overview' ? 'text-apollo-indigo border-b-2 border-apollo-indigo' : 'text-gray-500 hover:text-white'}`}
                            >
                                Overview
                            </button>
                            <button
                                onClick={() => setActiveTab('assignments')}
                                className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'assignments' ? 'text-apollo-indigo border-b-2 border-apollo-indigo' : 'text-gray-500 hover:text-white'}`}
                            >
                                Assignments
                            </button>
                        </div>

                        {activeTab === 'overview' ? (
                            <>
                                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                                    <div onClick={() => navigate('/teacher/classes')} className="glass p-6 rounded-3xl border-white/5 bg-blue-500/5 hover:bg-blue-500/10 transition-all cursor-pointer group">
                                        <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-all">
                                            <Users className="text-blue-400" />
                                        </div>
                                        <h3 className="text-lg font-bold mb-2">Class Roster</h3>
                                        <p className="text-3xl font-bold text-white mb-1">{stats.students}</p>
                                        <p className="text-gray-400 text-sm">Students Enrolled</p>
                                    </div>
                                    <div onClick={() => setActiveTab('assignments')} className="glass p-6 rounded-3xl border-white/5 bg-yellow-500/5 hover:bg-yellow-500/10 transition-all cursor-pointer group">
                                        <div className="w-12 h-12 bg-yellow-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-all">
                                            <BookOpen className="text-yellow-400" />
                                        </div>
                                        <h3 className="text-lg font-bold mb-2">Assignments</h3>
                                        <p className="text-3xl font-bold text-white mb-1">{stats.assignments}</p>
                                        <p className="text-gray-400 text-sm">Active Tasks</p>
                                    </div>
                                    <div className="glass p-6 rounded-3xl border-white/5 bg-green-500/5 cursor-default">
                                        <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center mb-4">
                                            <ClipboardCheck className="text-green-400" />
                                        </div>
                                        <h3 className="text-lg font-bold mb-2">Review Queue</h3>
                                        <p className="text-3xl font-bold text-white mb-1">{stats.submissions}</p>
                                        <p className="text-gray-400 text-sm">New Submissions</p>
                                    </div>
                                    <div onClick={() => navigate('/teacher/progress')} className="glass p-6 rounded-3xl border-white/5 bg-purple-500/5 hover:bg-purple-500/10 transition-all cursor-pointer group">
                                        <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-all">
                                            <BarChart3 className="text-purple-400" />
                                        </div>
                                        <h3 className="text-lg font-bold mb-2">Analytics</h3>
                                        <p className="text-3xl font-bold text-white mb-1">{stats.engagement}%</p>
                                        <p className="text-gray-400 text-sm">Class Engagement</p>
                                    </div>
                                </div>

                                <div className="grid lg:grid-cols-3 gap-8">
                                    <div className="lg:col-span-2 glass rounded-3xl p-8">
                                        <div className="flex justify-between items-center mb-6">
                                            <h2 className="text-2xl font-bold text-white">Review Queue</h2>
                                            <button className="text-sm text-apollo-indigo font-semibold hover:underline">View All</button>
                                        </div>
                                        <div className="space-y-4">
                                            {pendingSubmissions.length > 0 ? pendingSubmissions.map((item, idx) => (
                                                <div
                                                    key={idx}
                                                    onClick={() => handleReview(item)}
                                                    className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 hover:border-apollo-indigo/30 transition-all cursor-pointer"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center font-bold text-gray-300">
                                                            {item.student_name.split(' ').map((n: any) => n[0]).join('')}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-white">{item.student_name}</div>
                                                            <div className="text-xs text-gray-500">Submission ID: {item.id.slice(0, 8)} • {new Date(item.created_at).toLocaleDateString()}</div>
                                                        </div>
                                                    </div>
                                                    <button className="px-4 py-2 bg-apollo-indigo text-white text-sm rounded-xl font-bold hover:scale-105 transition-all">Review</button>
                                                </div>
                                            )) : (
                                                <div className="text-center py-12 text-gray-500 italic">No pending submissions found.</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="glass rounded-3xl p-8 border-yellow-500/10 bg-yellow-500/5">
                                        <h2 className="text-2xl font-bold mb-2 text-white">AI Assignment Suite</h2>
                                        <p className="text-gray-400 text-sm mb-6">Create smart differentiation for your class.</p>

                                        <div className="space-y-4">
                                            <button className="w-full p-4 bg-white/5 rounded-2xl border border-white/5 text-left hover:bg-white/10 transition-all flex items-center gap-3">
                                                <Sparkles className="text-yellow-400" size={20} />
                                                <div>
                                                    <div className="font-bold text-sm">Generate Worksheet</div>
                                                    <div className="text-xs text-gray-500">Based on recent class struggle</div>
                                                </div>
                                            </button>
                                            <button className="w-full p-4 bg-white/5 rounded-2xl border border-white/5 text-left hover:bg-white/10 transition-all flex items-center gap-3">
                                                <BarChart3 className="text-purple-400" size={20} />
                                                <div>
                                                    <div className="font-bold text-sm">Identify Knowledge Gaps</div>
                                                    <div className="text-xs text-gray-500">Analyze last 7 days of activity</div>
                                                </div>
                                            </button>
                                            <button
                                                onClick={() => navigate('/teacher/assignments')}
                                                className="w-full mt-4 py-3 bg-yellow-400 text-black rounded-xl font-bold transition-all hover:scale-105 shadow-lg shadow-yellow-400/20"
                                            >
                                                Create New Lab
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="animate-in fade-in zoom-in-95 duration-300">
                                <AssignmentSuite />
                            </div>
                        )}
                    </>
                )}
            </div>
        </DashboardLayout>
    );
};

export default TeacherDashboard;
