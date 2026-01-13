import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import axios from 'axios';
import { authService } from '../services/authService';

interface AIToolProps {
    title: string;
    description: string;
    placeholder: string;
    toolKey: string;
    icon: React.ReactNode;
    systemPrompt: string;
}

const AITool: React.FC<AIToolProps> = ({ title, description, placeholder, toolKey, icon, systemPrompt }) => {
    const [input, setInput] = useState('');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleAction = async () => {
        if (!input.trim()) return;

        setIsLoading(true);
        setResult('');

        try {
            const token = authService.getToken();
            const response = await axios.post('/api/ai/generate',
                {
                    prompt: `${systemPrompt}\n\nStudent Query: ${input}`,
                    toolKey: toolKey
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                setResult(response.data.answer);
            } else {
                setResult(`Error: ${response.data.error}`);
            }
        } catch (err: any) {
            setResult(`AI unavailable: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="glass rounded-3xl p-8 border-white/5 h-full flex flex-col">
            <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                    {icon}
                </div>
                <div>
                    <h3 className="text-xl font-bold">{title}</h3>
                    <p className="text-gray-400 text-sm">{description}</p>
                </div>
            </div>

            <div className="flex-1 space-y-4">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={placeholder}
                    className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-apollo-indigo outline-none resize-none"
                />

                <button
                    onClick={handleAction}
                    disabled={isLoading}
                    className="w-full bg-apollo-indigo hover:bg-apollo-indigo/80 disabled:opacity-50 transition-all py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            <Sparkles size={18} />
                            <span>Generate Response</span>
                        </>
                    )}
                </button>

                {result && (
                    <div className="mt-6 p-6 bg-white/5 rounded-2xl border border-white/10 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">AI Response</div>
                        <div className="text-gray-300 text-sm whitespace-pre-line leading-relaxed">
                            {result}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AITool;
