import React, { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Plus, BookOpen, Clock, Users, Sparkles, Filter, ChevronRight, Calculator, Beaker, FileText, BookCopy, BrainCircuit, X, CheckCircle2 } from 'lucide-react';

const AssignmentSuite: React.FC = () => {
    const [isCreating, setIsCreating] = useState(false);
    const [isGeneratingIntervention, setIsGeneratingIntervention] = useState(false);
    const [interventionTask, setInterventionTask] = useState<any>(null);

    const activeAssignments = [
        { id: '1', title: 'Algebra Foundations', tool: 'Math Solver', toolIcon: <Calculator size={14} />, students: 24, submitted: 18, dueDate: 'Jan 15, 2026', status: 'Active' },
        { id: '2', title: 'Photosynthesis Lab', tool: 'Science Lab', toolIcon: <Beaker size={14} />, students: 24, submitted: 5, dueDate: 'Jan 18, 2026', status: 'Active' },
        { id: '3', title: 'Creative Writing Prep', tool: 'Study Guide', toolIcon: <BookCopy size={14} />, students: 24, submitted: 24, dueDate: 'Jan 10, 2026', status: 'Completed' },
    ];

    const aiTools = [
        { name: 'Math Solver', icon: <Calculator className="text-blue-400" /> },
        { name: 'Worksheet Gen', icon: <FileText className="text-yellow-400" /> },
        { name: 'Science Lab', icon: <Beaker className="text-green-400" /> },
        { name: 'Study Guide', icon: <BookCopy className="text-purple-400" /> },
    ];

    const generateIntervention = () => {
        setIsGeneratingIntervention(true);
        // Simulate Gemini calling /api/ai/generate
        setTimeout(() => {
            setInterventionTask({
                title: 'Quadratic Intervention',
                description: 'Specialized 5-problem worksheet focusing on factoring quadratics with negative coefficients.',
                students: '8 Students',
                tool: 'Worksheet Generator'
            });
            setIsGeneratingIntervention(false);
        }, 2000);
    };

    return (
        <DashboardLayout>
            <div className="p-8">
                <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-bold mb-2 text-white">Assignment Suite</h1>
                        <p className="text-gray-400">Create and curate AI-enhanced learning experiences for your class.</p>
                    </div>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="bg-apollo-indigo hover:bg-apollo-indigo/80 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all hover:scale-105 shadow-lg shadow-apollo-indigo/20"
                    >
                        <Plus size={20} /> Create Assignment
                    </button>
                </header>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Active Assignments List */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <BookOpen size={20} className="text-apollo-indigo" /> Active Tasks
                            </h2>
                            <button className="text-xs text-gray-500 hover:text-white flex items-center gap-1 font-bold">
                                <Filter size={14} /> FILTER
                            </button>
                        </div>

                        {activeAssignments.map((asgn) => (
                            <div key={asgn.id} className="glass rounded-3xl p-6 border-white/5 hover:border-apollo-indigo/30 transition-all group relative overflow-hidden">
                                {asgn.status === 'Completed' && (
                                    <div className="absolute top-0 right-0 px-4 py-1 bg-green-500/10 text-green-400 text-[10px] font-black uppercase tracking-tighter rounded-bl-xl border-l border-b border-green-500/20">
                                        All Submitted
                                    </div>
                                )}
                                <div className="flex items-start justify-between gap-6">
                                    <div className="flex items-start gap-4">
                                        <div className={`p-4 rounded-2xl ${asgn.status === 'Completed' ? 'bg-green-500/10' : 'bg-apollo-indigo/10'}`}>
                                            <BookOpen className={asgn.status === 'Completed' ? 'text-green-400' : 'text-apollo-indigo'} size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white mb-2">{asgn.title}</h3>
                                            <div className="flex flex-wrap items-center gap-4">
                                                <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                                                    {asgn.toolIcon} {asgn.tool}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                                    <Users size={14} /> {asgn.submitted}/{asgn.students} Completed
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                                    <Clock size={14} /> Due {asgn.dueDate}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <button className="p-3 text-gray-500 hover:text-white transition-all group-hover:bg-white/5 rounded-2xl">
                                        <ChevronRight size={20} />
                                    </button>
                                </div>

                                <div className="mt-6 flex gap-2">
                                    <div className="h-1.5 flex-1 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ${asgn.status === 'Completed' ? 'bg-green-400' : 'bg-apollo-indigo'}`}
                                            style={{ width: `${(asgn.submitted / asgn.students) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* AI Insights Sidebar */}
                    <div className="space-y-8">
                        <div className="glass rounded-3xl p-8 border-yellow-500/10 bg-yellow-500/5 relative overflow-hidden">
                            {interventionTask ? (
                                <div className="animate-in fade-in zoom-in duration-300">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="text-green-400 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                                            <CheckCircle2 size={14} /> Task Generated
                                        </div>
                                        <button onClick={() => setInterventionTask(null)}><X size={14} className="text-gray-500" /></button>
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2">{interventionTask.title}</h3>
                                    <p className="text-xs text-gray-400 mb-4 leading-relaxed">{interventionTask.description}</p>
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="text-[10px] text-gray-500 bg-white/5 px-2 py-1 rounded-md border border-white/5">{interventionTask.students} targeted</div>
                                        <div className="text-[10px] text-gray-500 bg-white/5 px-2 py-1 rounded-md border border-white/5">{interventionTask.tool}</div>
                                    </div>
                                    <button className="w-full py-4 bg-apollo-indigo text-white rounded-2xl font-bold hover:scale-105 transition-all shadow-lg shadow-apollo-indigo/20">
                                        Publish Intervention
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-3 mb-6">
                                        <Sparkles size={24} className="text-yellow-400" />
                                        <h2 className="text-xl font-bold text-white">AI Suggestion</h2>
                                    </div>
                                    <p className="text-gray-400 text-sm leading-relaxed mb-6">
                                        Based on recent activity in "Math Solver", 8 students are finding quadratic equations particularly challenging.
                                    </p>
                                    <button
                                        onClick={generateIntervention}
                                        disabled={isGeneratingIntervention}
                                        className={`w-full py-3 bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 rounded-xl font-bold text-xs hover:bg-yellow-400/20 transition-all flex items-center justify-center gap-2 ${isGeneratingIntervention ? 'animate-pulse' : ''}`}
                                    >
                                        {isGeneratingIntervention ? (
                                            <>
                                                <BrainCircuit size={16} className="animate-spin" />
                                                Analyzing Needs...
                                            </>
                                        ) : (
                                            'Generate Intervention Task'
                                        )}
                                    </button>
                                </>
                            )}
                        </div>

                        <div className="glass rounded-3xl p-8 border-white/5">
                            <h2 className="text-xl font-bold text-white mb-6">Quick Tools</h2>
                            <div className="grid grid-cols-2 gap-4">
                                {aiTools.map((tool, idx) => (
                                    <div key={idx} className="bg-white/5 border border-white/10 p-4 rounded-2xl hover:bg-white/10 transition-all cursor-pointer group text-center">
                                        <div className="flex justify-center mb-3 group-hover:scale-110 transition-transform">{tool.icon}</div>
                                        <div className="text-[10px] font-bold text-white uppercase tracking-wider">{tool.name}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Create Modal (Mock) */}
                {isCreating && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                        <div className="glass w-full max-w-lg rounded-[40px] border-white/10 p-10 animate-in zoom-in-95 duration-200">
                            <h2 className="text-3xl font-bold mb-2">New Assignment</h2>
                            <p className="text-gray-400 text-sm mb-8">Set the parameters for your next learning mission.</p>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Assignment Title</label>
                                    <input type="text" placeholder="e.g. Chemistry Basics" className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-apollo-indigo" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Select AI Tool</label>
                                    <select className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-apollo-indigo appearance-none">
                                        <option>Math Solver</option>
                                        <option>Science Lab</option>
                                        <option>Worksheet Generator</option>
                                        <option>Study Guide</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <button onClick={() => setIsCreating(false)} className="py-4 rounded-2xl border border-white/10 font-bold text-gray-400 hover:bg-white/5 transition-all">Cancel</button>
                                    <button onClick={() => setIsCreating(false)} className="py-4 bg-apollo-indigo rounded-2xl font-bold text-white hover:bg-apollo-indigo/80 transition-all">Publish Mission</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default AssignmentSuite;
