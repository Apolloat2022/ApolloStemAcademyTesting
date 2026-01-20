import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import {
    Zap,
    Mail,
    Plus,
    Download,
    Clock,
    X,
    ClipboardList,
    MoreHorizontal,
    Loader2,
    Sparkles,
    RefreshCw,
    Send,
    MessageSquare,
    BrainCircuit,
    Trophy,
    TrendingUp,
    BookOpen
} from 'lucide-react';
import { api } from '../services/api';

interface Assignment {
    id: string;
    subject: string;
    name: string;
    dueDate: string;
    description?: string;
    priority: 'High' | 'Med' | 'Low';
    status: 'Pending' | 'In Progress' | 'Completed';
    is_personal?: boolean;
    source?: 'student_created' | 'teacher_assigned';
    assigned_by?: string;
}

const AntigravityDashboard: React.FC = () => {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [showImportModal, setShowImportModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showQuickAdd, setShowQuickAdd] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState<Assignment | null>(null);
    const [showContactModal, setShowContactModal] = useState(false);
    const [messageText, setMessageText] = useState('');
    const [importText, setImportText] = useState('');
    const [quickTaskText, setQuickTaskText] = useState('');
    const [isParsing, setIsParsing] = useState(false);
    const [isSendingMessage, setIsSendingMessage] = useState(false);
    const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'teacher_assigned'>('all');
    const [studyGuide, setStudyGuide] = useState<string | null>(null);
    const [isGeneratingGuide, setIsGeneratingGuide] = useState(false);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [squads, setSquads] = useState<Record<string, string[]>>({});
    const [classroomLink, setClassroomLink] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

    // Manual Add Form State
    const [newAsgn, setNewAsgn] = useState<Partial<Assignment>>({
        priority: 'Med',
        status: 'Pending'
    });

    useEffect(() => {
        fetchData();
        checkConnectionStatus();
    }, []);

    const checkConnectionStatus = async () => {
        try {
            const response = await api.get('/api/student/classroom-link');
            if (response.data) {
                setClassroomLink(response.data.link || '');
                setIsConnected(!!response.data.link);
            }
        } catch (error) {
            console.error('Failed to fetch connection status:', error);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch personal tasks, class assignments, and classroom link
            const [personalTasks, classAsgns, statusRes, leaderboardRes, squadsRes] = await Promise.all([
                api.get('/api/student/tasks'),
                api.get('/api/student/assignments'),
                api.get('/api/auth/google/status'),
                api.get('/api/student/leaderboard'),
                api.get('/api/student/squads')
            ]);

            const personalMapped: Assignment[] = personalTasks.data.map((t: any) => ({
                id: t.id,
                subject: t.subject || 'General',
                name: t.title,
                description: t.description,
                dueDate: t.due_date || 'TBD',
                priority: t.priority as any || 'Med',
                status: t.is_completed ? 'Completed' : 'Pending',
                is_personal: true,
                source: t.source || 'student_created',
                assigned_by: t.assigned_by
            }));

            const classMapped: Assignment[] = classAsgns.data.map((a: any) => ({
                id: a.id,
                subject: a.subject || 'STEM',
                name: a.title,
                dueDate: a.due_date || 'TBD',
                priority: 'High', // Default high for class assignments
                status: a.status === 'submitted' ? 'Completed' : 'Pending'
            }));

            setAssignments([...classMapped, ...personalMapped]);
            setIsConnected(statusRes.data.isConnected);
            setLeaderboard(leaderboardRes.data);
            setSquads(squadsRes.data);
        } catch (error) {
            console.error('Failed to fetch dashboard data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        setSyncStatus('syncing');
        try {
            const response = await api.post('/api/google/sync', { link: classroomLink });

            if (response.data.success) {
                setSyncStatus('success');
                setIsConnected(true);
                alert(`Successfully synced ${response.data.imported || 0} assignments from Google Classroom!`);
                fetchData();
                const linkRes = await api.get('/api/student/classroom-link');
                if (linkRes.data) {
                    setClassroomLink(linkRes.data.link || '');
                }
            } else {
                setSyncStatus('error');
                alert('Failed to sync with Google Classroom');
            }
        } catch (error) {
            setSyncStatus('error');
            console.error('Sync error:', error);
            alert('Sync failed. Please check your connection.');
        }
    };

    const handleSendMessage = async () => {
        if (!messageText.trim()) return;
        setIsSendingMessage(true);
        try {
            await api.post('/api/messages', {
                recipientId: 'default_teacher',
                content: messageText,
                role: 'student'
            });
            setMessageText('');
            setShowContactModal(false);
            alert('Message sent to Teacher!');
        } catch (err) {
            console.error('Failed to send message', err);
            alert('Failed to send message. Please try again.');
        } finally {
            setIsSendingMessage(false);
        }
    };

    const handleImport = async () => {
        const lines = importText.split('\n').filter(l => l.trim());
        const imported = lines.map(line => {
            const parts = line.split('-').map(p => p.trim());
            return {
                title: parts.length > 2 ? parts[1] : (parts.length > 1 ? parts[1] : parts[0]),
                subject: parts.length > 1 ? parts[0] : 'General',
                due_date: parts.length > 2 ? parts[2] : 'TBD',
                priority: 'Med'
            };
        });

        try {
            // Persist each to the backend
            await Promise.all(imported.map(asgn =>
                api.post('/api/student/tasks', { ...asgn, source: 'student_created' })
            ));
            await fetchData();
            setImportText('');
            setShowImportModal(false);
        } catch (error) {
            alert('Failed to import assignments. Please try again.');
        }
    };

    const handleManualAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAsgn.name) return;

        try {
            await api.post('/api/student/tasks', {
                title: newAsgn.name,
                subject: newAsgn.subject,
                due_date: newAsgn.dueDate,
                priority: newAsgn.priority,
                source: 'student_created'
            });
            await fetchData();
            setNewAsgn({ priority: 'Med', status: 'Pending' });
            setShowAddModal(false);
        } catch (error) {
            alert('Failed to add assignment. Please try again.');
        }
    };

    const handleQuickAdd = async () => {
        if (!quickTaskText.trim()) return;
        setIsParsing(true);
        try {
            // 1. Ask AI to parse
            const parseRes = await api.post('/api/ai/parse-task', { text: quickTaskText });
            const parsed = parseRes.data;

            // 2. Save parsed task
            await api.post('/api/student/tasks', {
                title: parsed.title || quickTaskText,
                subject: parsed.subject || 'General',
                due_date: parsed.dueDate || 'TBD',
                priority: parsed.priority || 'Med',
                source: 'student_created'
            });

            await fetchData();
            setQuickTaskText('');
            setShowQuickAdd(false);
        } catch (err) {
            console.error('Quick add failed', err);
            alert('AI parsing failed. Please try again or use manual add.');
        } finally {
            setIsParsing(false);
        }
    };

    const handleGenerateStudyGuide = async (asgn: Assignment) => {
        setIsGeneratingGuide(true);
        setStudyGuide(null);
        try {
            const res = await api.post('/api/ai/generate-study-guide', {
                title: asgn.name,
                subject: asgn.subject,
                description: asgn.description
            });
            setStudyGuide(res.data.studyGuide);
        } catch (err) {
            console.error('Failed to generate study guide', err);
            alert('AI tutor is currently busy. Please try again in a moment.');
        } finally {
            setIsGeneratingGuide(false);
        }
    };

    const calculateRisk = (dueDate: string, priority: string, status: string): 'High' | 'Mid' | 'Low' => {
        if (status === 'Completed') return 'Low';

        try {
            const now = new Date();
            const due = new Date(dueDate);
            if (isNaN(due.getTime())) return 'Low';

            const diffHours = (due.getTime() - now.getTime()) / (1000 * 60 * 60);

            if (diffHours < 24 || (diffHours < 48 && priority === 'High')) return 'High';
            if (diffHours < 72 || (diffHours < 120 && priority === 'High')) return 'Mid';
            return 'Low';
        } catch {
            return 'Low';
        }
    };

    const toggleCompletion = async (id: string, currentStatus: string) => {
        const isCompleted = currentStatus === 'Completed';
        try {
            await api.put(`/api/student/tasks/${id}`, { is_completed: !isCompleted });
            await fetchData();
        } catch (err) {
            console.error('Toggle completion failed', err);
        }
    };

    const contactTeacher = () => {
        setShowContactModal(true);
    };

    const filteredAssignments = assignments.filter(asgn => {
        if (filter === 'pending') return asgn.status !== 'Completed';
        if (filter === 'completed') return asgn.status === 'Completed';
        if (filter === 'teacher_assigned') return asgn.source === 'teacher_assigned';
        return true;
    });

    return (
        <DashboardLayout>
            <div className="p-8 max-w-6xl mx-auto">
                <header className="mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/20">
                                    <Zap className="text-white fill-white" size={24} />
                                </div>
                                <h1 className="text-4xl font-black text-white tracking-tight">Antigravity <span className="text-indigo-400">Dashboard</span></h1>
                            </div>

                            <div className="flex flex-col gap-3 mt-4">
                                <div className="flex items-center gap-4">
                                    <div
                                        className={`flex items-center gap-2 px-4 py-1.5 border rounded-full transition-all ${isConnected ? 'bg-green-500/10 border-green-500/20' : 'bg-indigo-600/10 border-indigo-600/20'}`}
                                    >
                                        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
                                        <span className={`text-xs font-black uppercase tracking-widest leading-none ${isConnected ? 'text-green-400' : 'text-gray-400'}`}>
                                            {isConnected ? 'Classroom Linked' : 'No Class Linked'}
                                        </span>
                                    </div>
                                    <button
                                        onClick={contactTeacher}
                                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium"
                                    >
                                        <Mail size={16} />
                                        Contact Teacher
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 group"
                            >
                                <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                                Add Assignment
                            </button>
                        </div>
                    </div>
                </header>

                <div className="flex items-center gap-4 mb-6 flex-wrap">
                    {['all', 'pending', 'completed', 'teacher_assigned'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${filter === f ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                        >
                            {f.replace('_', ' ')}
                        </button>
                    ))}
                </div>

                <div className="grid lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-3">
                        <div className="glass overflow-hidden rounded-3xl border-white/5 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-white/5 border-b border-white/5">
                                            <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Subject</th>
                                            <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Assignment Name</th>
                                            <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Due Date</th>
                                            <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Priority</th>
                                            <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-center">AI Risk</th>
                                            <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                                            <th className="px-6 py-5"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {loading ? (
                                            <tr>
                                                <td colSpan={7} className="px-6 py-20 text-center">
                                                    <div className="flex flex-col items-center gap-4">
                                                        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                                                        <p className="text-gray-400 font-medium">Syncing your learning data...</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : filteredAssignments.length > 0 ? filteredAssignments.map((asgn) => (
                                            <tr key={asgn.id} className="hover:bg-white/[0.02] transition-colors group">
                                                <td className="px-6 py-5">
                                                    <span className={`px-3 py-1 bg-indigo-600/10 text-indigo-400 rounded-lg text-xs font-bold border border-indigo-600/20 ${asgn.source === 'teacher_assigned' ? 'border-yellow-500/30 text-yellow-500 shadow-sm shadow-yellow-500/10' : ''}`}>
                                                        {asgn.subject}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 font-bold text-white">
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-2">
                                                            <span className={asgn.status === 'Completed' ? 'text-gray-500 line-through decoration-indigo-500/30' : ''}>
                                                                {asgn.name}
                                                            </span>
                                                            {squads[asgn.id]?.length > 0 && (
                                                                <div className="flex -space-x-2">
                                                                    {squads[asgn.id].slice(0, 3).map((name, i) => (
                                                                        <div key={i} className="w-5 h-5 rounded-full bg-indigo-500 border border-slate-900 flex items-center justify-center text-[8px] font-bold text-white shadow-lg" title={`${name} is also working on this!`}>
                                                                            {name[0]}
                                                                        </div>
                                                                    ))}
                                                                    {squads[asgn.id].length > 3 && (
                                                                        <div className="w-5 h-5 rounded-full bg-slate-800 border border-slate-900 flex items-center justify-center text-[8px] font-bold text-gray-400">
                                                                            +{squads[asgn.id].length - 3}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                        {asgn.source === 'teacher_assigned' && (
                                                            <span className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest mt-0.5">Assigned by Teacher</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                                                        <Clock size={14} />
                                                        {asgn.dueDate}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${asgn.priority === 'High' ? 'bg-red-500/10 text-red-500' :
                                                        asgn.priority === 'Med' ? 'bg-yellow-500/10 text-yellow-500' :
                                                            'bg-blue-500/10 text-blue-500'
                                                        }`}>
                                                        {asgn.priority}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 text-center">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <div className={`text-[10px] font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded-full border ${calculateRisk(asgn.dueDate, asgn.priority, asgn.status) === 'High' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                                                            calculateRisk(asgn.dueDate, asgn.priority, asgn.status) === 'Mid' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' :
                                                                'bg-green-500/10 border-green-500/20 text-green-500'
                                                            }`}>
                                                            {calculateRisk(asgn.dueDate, asgn.priority, asgn.status)}
                                                        </div>
                                                        {calculateRisk(asgn.dueDate, asgn.priority, asgn.status) === 'High' && asgn.status !== 'Completed' && (
                                                            <span className="text-[8px] text-red-400 font-bold animate-pulse">Critical Deadline</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <button
                                                        onClick={() => asgn.is_personal && toggleCompletion(asgn.id, asgn.status)}
                                                        disabled={!asgn.is_personal}
                                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${asgn.status === 'Completed' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-white/5 border-white/5 text-gray-400 hover:border-indigo-500/30'}`}
                                                    >
                                                        <div className={`w-2 h-2 rounded-full ${asgn.status === 'Completed' ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
                                                        <span className="text-xs font-bold uppercase tracking-wider">
                                                            {asgn.status}
                                                        </span>
                                                    </button>
                                                </td>
                                                <td className="px-6 py-5 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => setShowDetailModal(asgn)}
                                                        className="p-2 hover:bg-white/10 rounded-lg text-gray-400 transition-colors"
                                                    >
                                                        <MoreHorizontal size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={7} className="px-6 py-20 text-center">
                                                    <div className="flex flex-col items-center gap-4">
                                                        <div className="p-4 bg-white/5 rounded-full text-gray-600">
                                                            <ClipboardList size={40} />
                                                        </div>
                                                        <div className="text-gray-500 italic max-w-xs mx-auto">
                                                            No assignments found for this filter.
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Column */}
                    <div className="space-y-6">
                        {/* Google Classroom Integration Card */}
                        <div className="glass rounded-[40px] p-8 border-white/5 bg-indigo-500/5 transition-all">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                                    <BookOpen className="w-4 h-4 text-indigo-400" />
                                    Google Classroom
                                </h2>

                                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isConnected ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-white/5 text-gray-400 border border-white/10'}`}>
                                    {isConnected ? 'Connected' : 'Not Linked'}
                                </div>
                            </div>

                            {isConnected ? (
                                <div className="space-y-4">
                                    <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Attached Class</p>
                                        <p className="truncate text-sm font-bold text-white">{classroomLink}</p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={handleSync}
                                            disabled={syncStatus === 'syncing'}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-indigo-500 disabled:opacity-50 transition-all shadow-lg shadow-indigo-600/20"
                                        >
                                            {syncStatus === 'syncing' ? (
                                                <>
                                                    <RefreshCw className="w-3 h-3 animate-spin" />
                                                    Syncing...
                                                </>
                                            ) : (
                                                <>
                                                    <RefreshCw className="w-3 h-3" />
                                                    Sync Now
                                                </>
                                            )}
                                        </button>

                                        <button
                                            onClick={async () => {
                                                await api.post('/api/google/disconnect');
                                                setClassroomLink('');
                                                setIsConnected(false);
                                                fetchData();
                                            }}
                                            className="px-4 py-3 bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
                                        >
                                            Unlink
                                        </button>
                                    </div>

                                    {syncStatus === 'success' && (
                                        <p className="text-[10px] text-green-400 font-bold text-center animate-in fade-in slide-in-from-top-2">✓ Missions updated from Classroom</p>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <p className="text-xs text-gray-500 leading-relaxed">Connect your STEM missions to automatically sync assignments.</p>

                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            value={classroomLink}
                                            onChange={(e) => setClassroomLink(e.target.value)}
                                            placeholder="Paste class link or code"
                                            className="w-full p-4 bg-black/40 rounded-2xl border border-white/10 text-white text-sm focus:border-indigo-500/50 focus:outline-none transition-all"
                                        />

                                        <button
                                            onClick={async () => {
                                                if (!classroomLink.trim()) return;
                                                await api.post('/api/google/connect', { link: classroomLink });
                                                setIsConnected(true);
                                                handleSync();
                                            }}
                                            className="w-full py-4 bg-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20"
                                        >
                                            Connect Academy
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Academy Rankings */}
                        <div className="glass rounded-[40px] p-8 border-white/5 bg-indigo-500/5">
                            <div className="flex items-center gap-3 mb-6">
                                <Trophy className="text-yellow-400" />
                                <h3 className="font-bold text-white uppercase tracking-widest text-xs">Academy Rankings</h3>
                            </div>
                            <div className="space-y-4">
                                {leaderboard.length > 0 ? leaderboard.map((player, idx) => (
                                    <div key={idx} className={`p-4 rounded-2xl border transition-all ${idx === 0 ? 'bg-yellow-400/10 border-yellow-400/20' : 'bg-white/5 border-white/5'}`}>
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${idx === 0 ? 'bg-yellow-400 text-black' : 'bg-white/10 text-gray-400'}`}>
                                                    {idx + 1}
                                                </span>
                                                <span className="font-bold text-sm text-white truncate max-w-[100px]">{player.name}</span>
                                            </div>
                                            <span className="text-xs font-black text-indigo-400">{player.score}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-gray-500">
                                            <TrendingUp size={10} className="text-green-500" /> {player.rank}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="py-10 text-center text-gray-500 italic text-xs">Recalculating global rankings...</div>
                                )}
                            </div>
                        </div>

                        {/* Mission Streak */}
                        <div className="p-8 bg-purple-500/5 rounded-[40px] border border-purple-500/20">
                            <h3 className="text-xs font-black text-purple-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Sparkles size={14} /> Mission Streak
                            </h3>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map(day => (
                                    <div key={day} className={`flex-1 h-1 rounded-full ${day <= 3 ? 'bg-purple-500' : 'bg-white/10'}`} />
                                ))}
                            </div>
                            <p className="mt-3 text-[10px] text-gray-500 font-medium">Complete 2 more missions to level up!</p>
                        </div>
                    </div>
                </div>

                {/* Floating Quick Add Button */}
                <button
                    onClick={() => setShowQuickAdd(true)}
                    className="fixed bottom-10 right-10 w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group z-40 border border-white/20"
                >
                    <Plus className="text-white w-8 h-8 group-hover:rotate-90 transition-transform" />
                    <div className="absolute -top-12 right-0 bg-white text-indigo-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        AI Quick Add
                    </div>
                </button>

                {/* Quick Add Modal */}
                {
                    showQuickAdd && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                            <div className="glass w-full max-w-lg p-10 rounded-3xl border-indigo-500/30 shadow-3xl animate-in zoom-in-95 duration-300">
                                <div className="flex justify-between items-center mb-8">
                                    <h2 className="text-3xl font-black text-white flex items-center gap-3 italic">
                                        <Sparkles className="text-indigo-400" />
                                        AI Quick <span className="text-indigo-400">Add</span>
                                    </h2>
                                    <button
                                        disabled={isParsing}
                                        onClick={() => setShowQuickAdd(false)}
                                        className="p-2 hover:bg-white/10 rounded-full text-gray-400 transition-colors"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>
                                <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                                    Tell Gemini about your task in plain English. <br />
                                    <span className="text-indigo-400 italic">"Finish Physics lab by tomorrow High Priority"</span>
                                </p>
                                <textarea
                                    autoFocus
                                    disabled={isParsing}
                                    value={quickTaskText}
                                    onChange={(e) => setQuickTaskText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleQuickAdd()}
                                    rows={4}
                                    placeholder="Type your task here..."
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-indigo-500/50 mb-8 text-lg font-medium resize-none shadow-inner"
                                />
                                <div className="flex gap-4">
                                    <button
                                        disabled={isParsing}
                                        onClick={() => setShowQuickAdd(false)}
                                        className="flex-1 py-4 bg-white/5 rounded-2xl font-bold text-gray-400 hover:text-white transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        disabled={isParsing || !quickTaskText.trim()}
                                        onClick={handleQuickAdd}
                                        className="flex-1 py-4 bg-indigo-600 rounded-2xl font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all flex items-center justify-center gap-2"
                                    >
                                        {isParsing ? <Loader2 className="animate-spin" /> : <Plus size={20} />}
                                        {isParsing ? 'AI Parsing...' : 'Add with AI'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* Import Modal */}
                {
                    showImportModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                            <div className="glass w-full max-w-lg p-8 rounded-3xl border-white/10 shadow-3xl animate-in zoom-in-95 duration-300">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                        <Download className="text-indigo-400" />
                                        Import Assignments
                                    </h2>
                                    <button onClick={() => setShowImportModal(false)} className="p-2 hover:bg-white/10 rounded-full text-gray-400 transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>
                                <p className="text-gray-400 text-sm mb-4">
                                    Paste your assignments from Google Classroom below. Use the format: <br />
                                    <code className="text-indigo-400">Subject - Title - Due Date</code>
                                </p>
                                <textarea
                                    value={importText}
                                    onChange={(e) => setImportText(e.target.value)}
                                    rows={6}
                                    placeholder="Example: Math - Algebra Quiz - 2026-05-10"
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 mb-6 font-mono text-sm"
                                />
                                <div className="flex gap-4">
                                    <button onClick={() => setShowImportModal(false)} className="flex-1 py-4 bg-white/5 rounded-2xl font-bold text-gray-400 hover:text-white transition-colors">Cancel</button>
                                    <button onClick={handleImport} className="flex-1 py-4 bg-indigo-600 rounded-2xl font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all">Start Importing</button>
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* Task Detail Modal */}
                {
                    showDetailModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                            <div className="glass w-full max-w-lg p-10 rounded-3xl border-white/10 shadow-3xl animate-in zoom-in-95 duration-300 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600" />
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <span className="px-3 py-1 bg-indigo-600/10 text-indigo-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-600/20 mb-4 inline-block">
                                            {showDetailModal.subject}
                                        </span>
                                        <h2 className="text-3xl font-black text-white leading-tight">
                                            {showDetailModal.name}
                                        </h2>
                                    </div>
                                    <button onClick={() => { setStudyGuide(null); setShowDetailModal(null); }} className="p-2 hover:bg-white/10 rounded-full text-gray-400 transition-colors">
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="space-y-8">
                                    <div>
                                        <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Description</h3>
                                        <p className="text-gray-300 leading-relaxed bg-white/5 p-6 rounded-2xl border border-white/5">
                                            {showDetailModal.description || 'No detailed instructions provided.'}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Source</h3>
                                            <div className="flex items-center gap-2 text-white font-bold">
                                                {showDetailModal.source === 'teacher_assigned' ? 'Teacher Assigned' : 'Self-Created'}
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Due Date</h3>
                                            <div className="flex items-center gap-2 text-white font-bold">
                                                <Clock size={16} className="text-indigo-400" />
                                                {showDetailModal.dueDate}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-white/5">
                                        {!studyGuide && !isGeneratingGuide ? (
                                            <button
                                                onClick={() => handleGenerateStudyGuide(showDetailModal)}
                                                className="w-full py-4 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl text-indigo-400 font-bold flex items-center justify-center gap-2 hover:bg-indigo-500/20 transition-all group"
                                            >
                                                <Sparkles size={18} className="group-hover:animate-pulse" />
                                                Generate AI Study Guide
                                            </button>
                                        ) : isGeneratingGuide ? (
                                            <div className="w-full py-8 text-center bg-white/5 rounded-2xl border border-white/5">
                                                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-3" />
                                                <p className="text-gray-400 text-sm animate-pulse">Consulting Apollo AI Tutor...</p>
                                            </div>
                                        ) : (
                                            <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-6 animate-in fade-in zoom-in-95 duration-500">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-2 text-indigo-400 font-black text-[10px] uppercase tracking-widest">
                                                        <BrainCircuit size={14} /> AI Study Guide
                                                    </div>
                                                    <button onClick={() => setStudyGuide(null)} className="text-gray-500 hover:text-white transition-colors">
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                                <div className="prose prose-invert prose-sm max-w-none text-gray-300 text-xs leading-relaxed max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
                                                    {studyGuide?.split('\n').map((line, i) => (
                                                        <p key={i} className="mb-2">{line}</p>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-10">
                                    <button
                                        onClick={() => { setStudyGuide(null); setShowDetailModal(null); }}
                                        className="w-full py-4 bg-white/5 rounded-2xl font-bold text-white hover:bg-white/10 transition-all border border-white/10"
                                    >
                                        Close Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* Manual Add Modal */}
                {
                    showAddModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                            <div className="glass w-full max-w-lg p-8 rounded-3xl border-white/10 shadow-3xl animate-in zoom-in-95 duration-300">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                        <Plus className="text-indigo-400" />
                                        Add Assignment
                                    </h2>
                                    <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/10 rounded-full text-gray-400 transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>
                                <form onSubmit={handleManualAdd} className="space-y-4">
                                    <div>
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-1.5 ml-1">Subject</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Mathematics"
                                            value={newAsgn.subject}
                                            onChange={e => setNewAsgn({ ...newAsgn, subject: e.target.value })}
                                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-1.5 ml-1">Assignment Name</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="e.g. Unit 5 Practice Paper"
                                            value={newAsgn.name}
                                            onChange={e => setNewAsgn({ ...newAsgn, name: e.target.value })}
                                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-1.5 ml-1">Due Date</label>
                                            <input
                                                type="date"
                                                value={newAsgn.dueDate}
                                                onChange={e => setNewAsgn({ ...newAsgn, dueDate: e.target.value })}
                                                className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-1.5 ml-1">Priority</label>
                                            <select
                                                value={newAsgn.priority}
                                                onChange={e => setNewAsgn({ ...newAsgn, priority: e.target.value as any })}
                                                className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50"
                                            >
                                                <option value="High">High</option>
                                                <option value="Med">Medium</option>
                                                <option value="Low">Low</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="pt-4">
                                        <button type="submit" className="w-full py-4 bg-indigo-600 rounded-2xl font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all">Create Assignment</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )
                }
                {/* Contact Teacher Modal */}
                {
                    showContactModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowContactModal(false)} />
                            <div className="relative bg-[#0A0A0B] border border-white/10 w-full max-w-lg rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                                <div className="p-8">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-indigo-500/10 rounded-2xl">
                                                <MessageSquare className="text-indigo-400" size={24} />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-black text-white tracking-tight">Contact Teacher</h2>
                                                <p className="text-gray-400 text-sm font-medium">Send a direct message to Ms. Frizzle</p>
                                            </div>
                                        </div>
                                        <button onClick={() => setShowContactModal(false)} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                                            <X className="text-gray-500 hover:text-white" size={20} />
                                        </button>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-indigo-400/60 uppercase tracking-[0.2em] ml-1">Your Message</label>
                                            <textarea
                                                autoFocus
                                                value={messageText}
                                                onChange={(e) => setMessageText(e.target.value)}
                                                placeholder="Ask a question about your assignments or request help..."
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500 transition-all min-h-[160px] resize-none text-sm leading-relaxed"
                                            />
                                        </div>

                                        <button
                                            onClick={handleSendMessage}
                                            disabled={isSendingMessage || !messageText.trim()}
                                            className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl flex items-center justify-center gap-3 transition-all group active:scale-[0.98] shadow-xl shadow-indigo-600/20"
                                        >
                                            {isSendingMessage ? (
                                                <Loader2 className="w-5 h-5 text-white animate-spin" />
                                            ) : (
                                                <>
                                                    <span className="text-sm font-black text-white uppercase tracking-widest">Send Message</span>
                                                    <Send className="w-4 h-4 text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
            </div>
        </DashboardLayout>
    );
};

export default AntigravityDashboard;
