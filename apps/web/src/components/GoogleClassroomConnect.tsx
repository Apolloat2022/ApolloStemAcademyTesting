import React, { useState, useEffect } from 'react';
import { CheckCircle2, Loader2, XCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

interface GoogleClassroomConnectProps {
    userRole: 'student' | 'teacher' | 'volunteer';
    onSyncComplete?: () => void;
}

const GoogleClassroomConnect: React.FC<GoogleClassroomConnectProps> = ({ userRole, onSyncComplete }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSync, setLastSync] = useState<string | null>(null);
    const [syncCount, setSyncCount] = useState(0);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        checkConnectionStatus();
    }, []);

    const checkConnectionStatus = async () => {
        try {
            const res = await api.get('/api/auth/google/status');
            setIsConnected(res.data.isConnected);
            if (res.data.lastSync) {
                setLastSync(new Date(res.data.lastSync).toLocaleDateString());
            }
        } catch (err) {
            console.error('Failed to check Google connection status', err);
        }
    };

    const handleConnect = async () => {
        setIsConnecting(true);
        setError(null);
        try {
            const redirectUri = window.location.origin + '/google-callback';
            const res = await api.get('/api/auth/google/url', {
                params: { redirectUri }
            });
            
            if (res.data.url) {
                window.location.href = res.data.url;
            }
        } catch (err: any) {
            console.error('Failed to initiate Google OAuth', err);
            setError('Failed to connect to Google Classroom. Please try again.');
            setIsConnecting(false);
        }
    };

    const handleSync = async () => {
        setIsSyncing(true);
        setError(null);
        try {
            const res = await api.post('/api/google/sync');
            if (res.data.success) {
                setSyncCount(res.data.imported || 0);
                setLastSync(new Date().toLocaleDateString());
                if (onSyncComplete) onSyncComplete();
                
                // Show success message based on role
                const message = userRole === 'student' 
                    ? `Successfully imported ${res.data.imported} assignments!`
                    : userRole === 'teacher'
                    ? `Successfully synced ${res.data.imported} classes and assignments!`
                    : `Successfully updated student data!`;
                    
                alert(message);
            }
        } catch (err: any) {
            console.error('Sync failed', err);
            setError('Sync failed. Please try reconnecting.');
        } finally {
            setIsSyncing(false);
        }
    };

    const handleDisconnect = async () => {
        if (!confirm('Are you sure you want to disconnect Google Classroom?')) return;
        
        try {
            await api.post('/api/google/disconnect');
            setIsConnected(false);
            setLastSync(null);
            setSyncCount(0);
        } catch (err) {
            console.error('Failed to disconnect', err);
            setError('Failed to disconnect. Please try again.');
        }
    };

    const getConnectionText = () => {
        switch (userRole) {
            case 'student':
                return {
                    title: 'Google Classroom Integration',
                    description: 'Connect your Google Classroom to automatically import assignments and due dates.',
                    syncButton: 'Sync Assignments'
                };
            case 'teacher':
                return {
                    title: 'Classroom Sync',
                    description: 'Import your classes, students, and assignments from Google Classroom.',
                    syncButton: 'Sync Classes'
                };
            case 'volunteer':
                return {
                    title: 'Student Classroom Access',
                    description: 'Connect to view your mentees\' Google Classroom data.',
                    syncButton: 'Sync Student Data'
                };
        }
    };

    const text = getConnectionText();

    return (
        <div className="glass p-6 rounded-3xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        isConnected ? 'bg-green-500/20' : 'bg-gray-500/20'
                    }`}>
                        {isConnected ? (
                            <CheckCircle2 className="w-6 h-6 text-green-400" />
                        ) : (
                            <XCircle className="w-6 h-6 text-gray-400" />
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-white">{text.title}</h3>
                        <p className="text-sm text-gray-400">{text.description}</p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                    <p className="text-sm text-red-400">{error}</p>
                </div>
            )}

            {isConnected ? (
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                        <div>
                            <p className="text-sm text-gray-400">Status</p>
                            <p className="font-bold text-green-400">Connected</p>
                        </div>
                        {lastSync && (
                            <div className="text-right">
                                <p className="text-sm text-gray-400">Last Synced</p>
                                <p className="font-bold text-white">{lastSync}</p>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={handleSync}
                            disabled={isSyncing}
                            className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl font-bold text-white hover:from-indigo-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSyncing ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Syncing...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="w-5 h-5" />
                                    {text.syncButton}
                                </>
                            )}
                        </button>
                        <button
                            onClick={handleDisconnect}
                            className="px-6 py-3 bg-white/5 rounded-2xl font-bold text-white hover:bg-white/10 transition-all"
                        >
                            Disconnect
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    onClick={handleConnect}
                    disabled={isConnecting}
                    className="w-full py-4 bg-white text-gray-900 rounded-2xl font-bold hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isConnecting ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Connecting...
                        </>
                    ) : (
                        <>
                            <ExternalLink className="w-5 h-5" />
                            Connect Google Classroom
                        </>
                    )}
                </button>
            )}
        </div>
    );
};

export default GoogleClassroomConnect;
