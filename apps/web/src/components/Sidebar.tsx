import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    BookOpen,
    ClipboardList,
    LineChart,
    LogOut,
    Home,
    Settings,
    BrainCircuit,
    Users,
    GraduationCap
} from 'lucide-react';
import { authService } from '../services/authService';

const Sidebar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const user = authService.getUser();

    const handleLogout = () => {
        authService.logout();
        navigate('/');
    };

    const studentLinks = [
        { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
        { name: 'Learning Hub', path: '/student/hub', icon: BrainCircuit },
        { name: 'My Assignments', path: '/student/assignments', icon: ClipboardList },
        { name: 'My Progress', path: '/student/progress', icon: LineChart },
    ];

    const teacherLinks = [
        { name: 'Overview', path: '/teacher/dashboard', icon: LayoutDashboard },
        { name: 'AP Dashboard', path: '/ap-teacher', icon: GraduationCap },
        { name: 'Class Management', path: '/teacher/classes', icon: Users },
        { name: 'Assignment Suite', path: '/teacher/assignments', icon: BookOpen },
        { name: 'Analytics', path: '/teacher/progress', icon: LineChart },
    ];

    const volunteerLinks = [
        { name: 'Portal Overview', path: '/volunteer/dashboard', icon: LayoutDashboard },
        { name: 'Messaging Hub', path: '/volunteer/messages', icon: BrainCircuit },
    ];

    const links = user?.role === 'student' ? studentLinks :
        user?.role === 'teacher' ? teacherLinks :
            volunteerLinks;

    return (
        <div className="w-56 min-h-screen bg-apollo-dark border-r border-white/10 flex flex-col p-6 z-20">
            <div className="flex items-center gap-3 mb-10 px-2 cursor-pointer" onClick={() => navigate('/')}>
                <img src="/logo.png" alt="Apollo" className="w-10 h-10 rounded-full" />
                <span className="font-bold text-xl tracking-tight">Apollo</span>
            </div>

            <nav className="flex-1 space-y-2">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = location.pathname === link.path;
                    return (
                        <button
                            key={link.path}
                            onClick={() => navigate(link.path)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                ? 'bg-apollo-indigo text-white shadow-lg shadow-apollo-indigo/20'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <Icon size={20} />
                            <span className="font-medium">{link.name}</span>
                        </button>
                    );
                })}
            </nav>

            <div className="pt-6 mt-6 border-t border-white/10 space-y-2">
                <button
                    onClick={() => navigate('/')}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all"
                >
                    <Home size={20} />
                    <span className="font-medium">Home Page</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all">
                    <Settings size={20} />
                    <span className="font-medium">Settings</span>
                </button>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all font-medium"
                >
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
