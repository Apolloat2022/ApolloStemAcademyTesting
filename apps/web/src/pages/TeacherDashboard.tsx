import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import GoogleClassroomConnect from '../components/GoogleClassroomConnect';
import { Users, BookOpen, ClipboardCheck, BarChart3, Sparkles, X, BrainCircuit, CheckCircle2, RefreshCw, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import AssignmentSuite from './AssignmentSuite';


const TeacherDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [reviewItem, setReviewItem] = useState<any>(null);
    const [aiInsight, setAiInsight] = useState<string | null>(null);
    const [aiFeedbackDraft, setAiFeedbackDraft] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isDraftingFeedback, setIsDraftingFeedback] = useState(false);
    const [pendingSubmissions, setPendingSubmissions] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'overview' | 'assignments'>('overview');
    const [stats, setStats] = useState({ students: 0, assignments: 0, submissions: 0, engagement: 0 });

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

    useEffect(() => {
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

                            <div className="mt-8 pt-8 border-t border-white/5">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Grading & Feedback</h3>
                                    {!aiFeedbackDraft && !isDraftingFeedback && (
                                        <button
                                            onClick={async () => {
                                                setIsDraftingFeedback(true);
                                                try {
                                                    const res = await api.post(`/api/submissions/${reviewItem.id}/generate-feedback`);
                                                    setAiFeedbackDraft(res.data.feedback);
                                                } catch (e) {
                                                    console.error(e);
                                                    setAiFeedbackDraft('Failed to generate feedback. Please try again.');
                                                }
                                                setIsDraftingFeedback(false);
                                            }}
                                            className="px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400 text-xs font-bold flex items-center gap-2 hover:bg-purple-500/20 transition-all"
                                        >
                                            {isDraftingFeedback ? (
                                                <>
                                                    <Loader2 size={14} className="animate-spin" />
                                                    Drafting...
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles size={14} />
                                                    AI Draft Feedback
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>

                                {aiFeedbackDraft && (
                                    <div className="bg-purple-500/5 border border-purple-500/10 rounded-2xl p-4 mb-4 animate-in fade-in slide-in-from-top-2">
                                        <p className="text-gray-300 text-sm leading-relaxed">{aiFeedbackDraft}</p>
                                    </div>
                                )}

                                <input type="number" placeholder="Grade (0-100)" className="w-full mb-4 bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-white focus:border-apollo-indigo/50 outline-none" />
                                <textarea placeholder="Optional teacher feedback..." className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-white focus:border-apollo-indigo/50 outline-none mb-4" rows={4} />
                                <button className="w-full py-3 bg-green-500 rounded-xl text-white font-bold flex items-center justify-center gap-2 hover:bg-green-600 transition-all">
                                    <CheckCircle2 size={18} />
                                    Submit Grade & Feedback
                                </button>
                            </div>
                        </div>

                        {/* AI Analysis Panel */}
                        <div className="glass rounded-3xl p-8 border-white/5">
                            <h2 className="text-2xl font-bold mb-6 text-white">AI Insight</h2>

                            {!aiInsight ? (
                                <div className="text-center py-16">
                                    <BrainCircuit size={60} className="mx-auto mb-6 text-gray-700" />
                                    <p className="text-gray-500 mb-6">Get AI-powered analysis on this submission</p>
                                    <button
                                        onClick={runAIAnalyze}
                                        className="px-6 py-3 bg-apollo-indigo rounded-xl font-bold text-white hover:scale-105 transition-all flex items-center gap-2 mx-auto"
                                        disabled={isAnalyzing}
                                    >
                                        {isAnalyzing ? (
                                            <>
                                                <Loader2 className="animate-spin" size={18} />
                                                Analyzing...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles size={18} />
                                                Analyze with AI
                                            </>
                                        )}
                                    </button>
                                </div>
                            ) : (
                                <div className="bg-white/5 rounded-2xl p-6 border border-white/5 animate-in fade-in slide-in-from-bottom-4">
                                    <p className="text-gray-300 leading-relaxed whitespace-pre-line">{aiInsight}</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Google Classroom Integration */}
                        <div className="mb-8">
                            <GoogleClassroomConnect 
                                userRole="teacher" 
                                onSyncComplete={fetchDashboardData}
                            />
                        </div>

                        <div className="flex gap-6 border-b border-white/5 mb-8">
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