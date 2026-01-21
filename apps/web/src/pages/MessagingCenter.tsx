import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Send, Search, Settings, MoreHorizontal, CheckCheck, Smile, Sparkles, BrainCircuit, X } from 'lucide-react';
import { api } from '../services/api';
import { authService } from '../services/authService';

const MessagingCenter: React.FC = () => {
    const [selectedChat, setSelectedChat] = useState('student_123'); // Using student_id as chat_id
    const [message, setMessage] = useState('');
    const [aiDraft, setAiDraft] = useState<string | null>(null);
    const [isDrafting, setIsDrafting] = useState(false);
    const [messages, setMessages] = useState<any[]>([]);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const res = await api.get(`/api/messages/${selectedChat}`);
                setMessages(res.data);
            } catch (err) {
                console.error('Failed to fetch messages', err);
            }
        };
        fetchMessages();
        const interval = setInterval(fetchMessages, 5000); // Polling for demo
        return () => clearInterval(interval);
    }, [selectedChat]);

    const handleSendMessage = async () => {
        if (!message.trim()) return;
        const tempMsg = message;
        setMessage('');
        try {
            await api.post('/api/messages', {
                recipientId: selectedChat,
                content: tempMsg,
                role: authService.getUser()?.role
            });
            // Refresh local state will happen via interval or manual append
            setMessages(prev => [...prev, {
                id: 'temp',
                content: tempMsg,
                sender_id: authService.getUser()?.id,
                created_at: new Date().toISOString()
            }]);
        } catch (err) {
            console.error('Failed to send message', err);
        }
    };

    const chats = [
        { id: 'student_123', name: 'Leo Messi', lastMsg: 'I struggle with decimals...', time: '10:45 AM', unread: 2, role: 'Student' },
        { id: 'teacher_456', name: 'Mrs. Sarah', lastMsg: 'Leo is struggling today.', time: '9:30 AM', unread: 0, role: 'Teacher' },
        { id: 'student_789', name: 'Kevin Lee', lastMsg: 'Thanks for the encouragement!', time: 'Yesterday', unread: 0, role: 'Student' },
    ];

    const currentChat = chats.find(c => c.id === selectedChat);

    const generateAIDraft = async () => {
        if (!currentChat) return;
        setIsDrafting(true);
        try {
            const res = await api.post('/api/ai/generate', {
                prompt: `You are a helpful teacher at Apollo Academy. Draft a short, supportive, and encouraging message for a student named ${currentChat.name}. The student's last message was: "${currentChat.lastMsg}". keep the tone positive and helpful.`
            });
            const data = res.data;
            if (data.success) {
                setAiDraft(data.answer);
            } else {
                setAiDraft("I'm having trouble thinking of a draft right now. You've got this!");
            }
        } catch (err) {
            setAiDraft("AI support is currently offline. Please try again later.");
        } finally {
            setIsDrafting(false);
        }
    };

    const useDraft = () => {
        setMessage(aiDraft || '');
        setAiDraft(null);
    };

    return (
        <DashboardLayout>
            <div className="h-[calc(100vh-64px)] p-8 flex gap-8">
                {/* Conversations Sidebar */}
                <div className="w-80 glass rounded-3xl border-white/5 flex flex-col h-full overflow-hidden">
                    <div className="p-6 border-b border-white/5">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-white">Messages</h2>
                            <Settings className="text-gray-500 cursor-pointer hover:text-white transition-all" size={20} />
                        </div>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                            <input
                                type="text"
                                placeholder="Search chats..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs focus:ring-2 focus:ring-apollo-indigo outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {chats.map((chat) => (
                            <div
                                key={chat.id}
                                onClick={() => setSelectedChat(chat.id)}
                                className={`p-6 flex items-start gap-4 cursor-pointer transition-all hover:bg-white/5 border-l-2 ${selectedChat === chat.id ? 'bg-white/5 border-apollo-indigo' : 'border-transparent'}`}
                            >
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white ${chat.role === 'Teacher' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-apollo-indigo/20 text-apollo-indigo'}`}>
                                    {chat.name[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <div className="font-bold text-white truncate text-sm">{chat.name}</div>
                                        <div className="text-[10px] text-gray-500 whitespace-nowrap">{chat.time}</div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-xs text-gray-500 truncate">{chat.lastMsg}</p>
                                        {chat.unread > 0 && (
                                            <div className="w-4 h-4 bg-apollo-indigo rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                                                {chat.unread}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chat Interface */}
                <div className="flex-1 glass rounded-3xl border-white/5 flex flex-col h-full overflow-hidden relative">
                    {/* Header */}
                    <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white ${currentChat?.role === 'Teacher' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-apollo-indigo/20 text-apollo-indigo'}`}>
                                {currentChat?.name[0]}
                            </div>
                            <div>
                                <div className="font-bold text-white text-lg">{currentChat?.name}</div>
                                <div className="text-xs text-green-400 flex items-center gap-1 font-bold">
                                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" /> Online
                                </div>
                            </div>
                        </div>
                        <MoreHorizontal className="text-gray-500 cursor-pointer hover:text-white" />
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-6 flex flex-col">
                        <div className="flex justify-center mb-4">
                            <span className="text-[10px] text-gray-500 font-bold bg-white/5 px-4 py-1 rounded-full uppercase tracking-widest">Conversation History</span>
                        </div>

                        {messages.length > 0 ? messages.map((msg, idx) => {
                            const isMe = msg.sender_id === authService.getUser()?.id;
                            return (
                                <div key={msg.id || idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                    <div className={`flex items-end gap-3 max-w-[80%] ${isMe ? 'flex-row-reverse' : ''}`}>
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${isMe ? 'bg-apollo-yellow/20 text-apollo-yellow' : 'bg-apollo-indigo/20 text-apollo-indigo'}`}>
                                            {isMe ? 'ME' : currentChat?.name[0]}
                                        </div>
                                        <div className={`p-4 rounded-3xl ${isMe ? 'bg-apollo-indigo/10 border border-apollo-indigo/20 rounded-br-none' : 'bg-white/5 border border-white/5 rounded-bl-none'}`}>
                                            <p className={`text-sm ${isMe ? 'text-white' : 'text-gray-300'}`}>{msg.content}</p>
                                            <div className={`text-[10px] mt-2 font-bold flex items-center gap-1 ${isMe ? 'text-apollo-indigo/60 justify-end' : 'text-gray-600'}`}>
                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                {isMe && <CheckCheck size={12} />}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="text-center py-20 text-gray-600 italic text-sm">No messages yet. Start the conversation with mentorship! 🚀</div>
                        )}
                    </div>

                    {/* AI Draft Suggestion Popover */}
                    {aiDraft && (
                        <div className="mx-8 mb-4 glass border-apollo-indigo/30 rounded-2xl p-4 animate-in slide-in-from-bottom-2 duration-200">
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2 text-apollo-indigo font-bold text-xs uppercase tracking-widest">
                                    <BrainCircuit size={14} /> AI Support Draft
                                </div>
                                <button onClick={() => setAiDraft(null)}><X size={14} className="text-gray-500" /></button>
                            </div>
                            <p className="text-xs text-gray-300 italic mb-3 leading-relaxed">"{aiDraft}"</p>
                            <button
                                onClick={useDraft}
                                className="w-full bg-apollo-indigo text-white text-xs font-bold py-2 rounded-xl hover:bg-apollo-indigo/80 transition-all"
                            >
                                Use this draft
                            </button>
                        </div>
                    )}

                    {/* Input Area */}
                    <div className="p-8 border-t border-white/5">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-2 flex items-center gap-2">
                            <div className="flex items-center gap-1">
                                <button className="p-3 text-gray-500 hover:text-white transition-all">
                                    <Smile size={20} />
                                </button>
                                <button
                                    onClick={generateAIDraft}
                                    disabled={isDrafting}
                                    className={`p-3 transition-all ${isDrafting ? 'animate-pulse text-apollo-indigo' : 'text-gray-500 hover:text-apollo-indigo'}`}
                                    title="Draft with AI"
                                >
                                    <Sparkles size={20} />
                                </button>
                            </div>
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Write a message of support..."
                                className="flex-1 bg-transparent border-none outline-none text-sm py-2 px-2 text-white placeholder:text-gray-600"
                            />
                            <button
                                onClick={handleSendMessage}
                                className="bg-apollo-indigo text-white p-3 rounded-xl hover:scale-105 transition-all"
                            >
                                <Send size={20} fill="currentColor" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default MessagingCenter;
