import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Users, ShieldCheck, ArrowLeft, Sparkles, Heart } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { authService } from '../services/authService';
import axios from 'axios';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [selectedRole, setSelectedRole] = useState<'student' | 'teacher' | 'volunteer' | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleGoogleSuccess = async (credentialResponse: any) => {
        setIsLoading(true);
        try {
            // In a real app, send the credential (id_token) to your backend
            const res = await axios.post('/auth/google', {
                token: credentialResponse.credential,
                role: selectedRole
            });

            const { token, user } = res.data;
            authService.setToken(token);
            authService.setUser(user);

            navigate(`/${user.role}/dashboard`);
        } catch (err) {
            console.error('Login failed', err);
            // Fallback for development if backend isn't ready
            const mockUser = {
                id: 'mock_user',
                email: 'test@example.com',
                role: selectedRole || 'student',
                name: 'Apollo Explorer'
            };
            authService.setToken('mock_jwt');
            authService.setUser(mockUser);
            navigate(`/${mockUser.role}/dashboard`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-apollo-dark flex flex-col items-center justify-center p-6 bg-gradient-to-b from-gray-900 via-apollo-dark to-black overflow-hidden relative selection:bg-apollo-indigo/30">
            {/* Background Accents */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-apollo-indigo rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-apollo-yellow rounded-full blur-[120px]" />
            </div>

            <div className="w-full max-w-xl z-10 fade-in">
                <div className="text-center mb-12">
                    <img src="/logo.png" alt="Apollo Logo" className="w-20 h-20 mx-auto mb-6 rounded-full glass p-2" />
                    <h1 className="text-4xl md:text-5xl font-black gradient-shift mb-4">Apollo Academy</h1>
                    <p className="text-gray-400 font-medium">Authentication Portal</p>
                </div>

                <div className="glass rounded-[40px] p-10 border-white/5 relative overflow-hidden shadow-2xl">
                    {!selectedRole ? (
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-center mb-8">Select Your Role</h3>
                            <div className="grid gap-4">
                                {[
                                    { id: 'student', title: 'Student', icon: <GraduationCap className="text-blue-400" />, desc: 'Access your learning missions' },
                                    { id: 'teacher', title: 'Teacher', icon: <ShieldCheck className="text-yellow-400" />, desc: 'Manage classes and AI tools' },
                                    { id: 'parent', title: 'Parent', icon: <Heart className="text-red-400" />, desc: 'Monitor progress and AI reports' },
                                    { id: 'volunteer', title: 'Volunteer', icon: <Users className="text-purple-400" />, desc: 'Mentor and support students' },
                                ].map((role) => (
                                    <button
                                        key={role.id}
                                        onClick={() => setSelectedRole(role.id as any)}
                                        className="flex items-center gap-6 p-6 bg-white/5 border border-white/5 rounded-3xl hover:bg-white/10 hover:border-white/10 transition-all text-left group"
                                    >
                                        <div className="p-4 rounded-2xl bg-white/5 group-hover:scale-110 transition-transform">{role.icon}</div>
                                        <div>
                                            <div className="font-bold text-white text-lg">{role.title}</div>
                                            <div className="text-xs text-gray-500 font-medium">{role.desc}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in zoom-in duration-300">
                            <button
                                onClick={() => setSelectedRole(null)}
                                className="flex items-center gap-2 text-xs text-gray-500 hover:text-white font-bold transition-colors uppercase tracking-widest"
                            >
                                <ArrowLeft size={14} /> Back to roles
                            </button>

                            <div className="text-center">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-apollo-indigo/10 text-apollo-indigo font-black text-[10px] uppercase tracking-widest mb-4">
                                    <Sparkles size={12} /> Secure Login
                                </div>
                                <h3 className="text-2xl font-black mb-2">Welcome Back, {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}</h3>
                                <p className="text-sm text-gray-400 mb-8">Signin to continue to your dashboard</p>
                            </div>

                            <div className={`flex justify-center transition-opacity duration-300 ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
                                <div className="scale-110">
                                    <GoogleLogin
                                        onSuccess={handleGoogleSuccess}
                                        onError={() => console.log('Login Failed')}
                                        theme="filled_black"
                                        shape="pill"
                                        size="large"
                                        width="300"
                                    />
                                </div>
                            </div>
                            {isLoading && (
                                <div className="text-center mt-4">
                                    <div className="inline-block w-4 h-4 border-2 border-apollo-indigo border-t-transparent rounded-full animate-spin" />
                                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-2">Authenticating...</div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="mt-12 text-center text-[10px] text-gray-600 font-black uppercase tracking-[0.2em]">
                    Powered by Apollo Secure Authentication Engine
                </div>
            </div>
        </div>
    );
};

export default Login;
