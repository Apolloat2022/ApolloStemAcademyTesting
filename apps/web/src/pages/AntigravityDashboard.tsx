import React, { useState } from 'react';
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
    ExternalLink
} from 'lucide-react';

interface Assignment {
    id: string;
    subject: string;
    name: string;
    dueDate: string;
    priority: 'High' | 'Med' | 'Low';
    status: 'Pending' | 'In Progress' | 'Completed';
}

const AntigravityDashboard: React.FC = () => {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [classroomLink, setClassroomLink] = useState('');
    const [isEditingLink, setIsEditingLink] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [importText, setImportText] = useState('');

    // Manual Add Form State
    const [newAsgn, setNewAsgn] = useState<Partial<Assignment>>({
        priority: 'Med',
        status: 'Pending'
    });

    const handleImport = () => {
        const lines = importText.split('\n').filter(l => l.trim());
        const imported: Assignment[] = lines.map(line => {
            const parts = line.split('-').map(p => p.trim());
            return {
                id: Math.random().toString(36).substr(2, 9),
                subject: parts.length > 1 ? parts[0] : 'General',
                name: parts.length > 2 ? parts[1] : (parts.length > 1 ? parts[1] : parts[0]),
                dueDate: parts.length > 2 ? parts[2] : 'TBD',
                priority: 'Med',
                status: 'Pending'
            };
        });
        setAssignments([...assignments, ...imported]);
        setImportText('');
        setShowImportModal(false);
    };

    const handleManualAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAsgn.name) return;
        const asgn: Assignment = {
            id: Math.random().toString(36).substr(2, 9),
            subject: newAsgn.subject || 'General',
            name: newAsgn.name,
            dueDate: newAsgn.dueDate || 'TBD',
            priority: (newAsgn.priority as any) || 'Med',
            status: (newAsgn.status as any) || 'Pending',
        };
        setAssignments([...assignments, asgn]);
        setNewAsgn({ priority: 'Med', status: 'Pending' });
        setShowAddModal(false);
    };

    const contactTeacher = () => {
        const mailSubject = encodeURIComponent('Question regarding assignments');
        const mailBody = encodeURIComponent('Hi Teacher,\n\nI have a question about my current assignments on the Antigravity Dashboard.\n\nBest regards,\nStudent');
        window.open(`mailto:?subject=${mailSubject}&body=${mailBody}`);
    };

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
                                {isEditingLink ? (
                                    <div className="flex gap-2 animate-in slide-in-from-left-2">
                                        <input
                                            autoFocus
                                            type="text"
                                            placeholder="Paste Google Classroom Link..."
                                            value={classroomLink}
                                            onChange={(e) => setClassroomLink(e.target.value)}
                                            onBlur={() => setIsEditingLink(false)}
                                            className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 w-64"
                                        />
                                        <button onClick={() => setIsEditingLink(false)} className="text-xs text-indigo-400 font-bold">Save</button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full cursor-pointer hover:bg-green-500/20 transition-all" onClick={() => setIsEditingLink(true)}>
                                            <div className={`w-2 h-2 rounded-full ${classroomLink ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                                            <span className="text-xs font-bold text-green-400 uppercase tracking-widest leading-none">
                                                {classroomLink ? 'Classroom Connected' : 'Set Classroom Link'}
                                            </span>
                                            {classroomLink && <ExternalLink size={12} className="text-green-400/50" />}
                                        </div>
                                        <button
                                            onClick={contactTeacher}
                                            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium"
                                        >
                                            <Mail size={16} />
                                            Contact Teacher
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowImportModal(true)}
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-white hover:bg-white/10 transition-all group"
                            >
                                <Download size={20} className="text-indigo-400 group-hover:scale-110 transition-transform" />
                                Import from Classroom
                            </button>
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

                <div className="glass overflow-hidden rounded-3xl border-white/5 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 border-b border-white/5">
                                    <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Subject</th>
                                    <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Assignment Name</th>
                                    <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Due Date</th>
                                    <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Priority</th>
                                    <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-5"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {assignments.length > 0 ? assignments.map((asgn) => (
                                    <tr key={asgn.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-6 py-5">
                                            <span className="px-3 py-1 bg-indigo-600/10 text-indigo-400 rounded-lg text-xs font-bold border border-indigo-600/20">
                                                {asgn.subject}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 font-bold text-white">{asgn.name}</td>
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
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${asgn.status === 'Completed' ? 'bg-green-500' : 'bg-gray-500'}`} />
                                                <span className={`text-sm font-medium ${asgn.status === 'Completed' ? 'text-green-400' : 'text-gray-400'}`}>
                                                    {asgn.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 transition-colors">
                                                <MoreHorizontal size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="p-4 bg-white/5 rounded-full text-gray-600">
                                                    <ClipboardList size={40} />
                                                </div>
                                                <div className="text-gray-500 italic max-w-xs mx-auto">
                                                    No assignments found. Use the buttons above to import from Classroom or add manually.
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Import Modal */}
                {showImportModal && (
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
                )}

                {/* Manual Add Modal */}
                {showAddModal && (
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
                )}
            </div>
        </DashboardLayout>
    );
};

export default AntigravityDashboard;
