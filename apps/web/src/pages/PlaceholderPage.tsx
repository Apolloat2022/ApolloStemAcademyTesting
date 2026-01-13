import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Construction } from 'lucide-react';

const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => {
    return (
        <DashboardLayout>
            <div className="flex flex-col items-center justify-center h-[80vh] text-center p-8">
                <div className="w-24 h-24 bg-apollo-yellow/10 rounded-full flex items-center justify-center mb-8 animate-pulse">
                    <Construction className="text-apollo-yellow" size={48} />
                </div>
                <h1 className="text-4xl font-bold mb-4 glass-text">{title}</h1>
                <p className="text-gray-400 max-w-md text-lg">
                    We're currently building this feature with AI-powered insights.
                    Check back soon for the full experience!
                </p>
                <button
                    onClick={() => window.history.back()}
                    className="mt-10 px-8 py-3 bg-white/5 border border-white/10 rounded-xl font-bold hover:bg-white/10 transition-all"
                >
                    Go Back
                </button>
            </div>
        </DashboardLayout>
    );
};

export default PlaceholderPage;
