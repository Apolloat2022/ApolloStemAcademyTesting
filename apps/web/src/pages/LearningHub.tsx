import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import AITool from '../components/AITool';
import { Calculator, FileText, Beaker, BookCopy, Sparkles } from 'lucide-react';

const LearningHub: React.FC = () => {
    const tools = [
        {
            title: 'Math Solver',
            description: 'Step-by-step problem solver for all grade levels.',
            placeholder: 'e.g. Solve 2x + 5 = 15',
            toolKey: 'math',
            icon: <Calculator className="text-blue-400" />,
            systemPrompt: 'Solve this math problem step by step for a student. Explain each step clearly.'
        },
        {
            title: 'Worksheet Generator',
            description: 'Create customized practice sheets on any topic.',
            placeholder: 'Topic (e.g. Fractions for Grade 4)',
            toolKey: 'worksheet',
            icon: <FileText className="text-yellow-400" />,
            systemPrompt: 'Create a math worksheet about the following topic with 5 problems. Include answers at the end.'
        },
        {
            title: 'Science Lab Assistant',
            description: 'Explore concepts and experiment procedures.',
            placeholder: 'e.g. Explain photosynthesis or how batteries work',
            toolKey: 'science',
            icon: <Beaker className="text-green-400" />,
            systemPrompt: 'Explain this science concept in detail with step-by-step guides or experiment procedures.'
        },
        {
            title: 'Study Guide Generator',
            description: 'Consolidate topics into easy-to-learn guides.',
            placeholder: 'e.g. World War II or Cell Biology',
            toolKey: 'study_guide',
            icon: <BookCopy className="text-purple-400" />,
            systemPrompt: 'Create a comprehensive study guide for this topic with key concepts and 3 practice questions.'
        },
        {
            title: 'AI Learning Coach',
            description: 'Personalized guidance based on your activity.',
            placeholder: 'Ask your coach for help with a specific subject...',
            toolKey: 'coach',
            icon: <Sparkles className="text-pink-400" />,
            systemPrompt: 'You are an AI Learning Coach. Help the student identify knowledge gaps and suggest specific practice or lessons.'
        }
    ];

    return (
        <DashboardLayout>
            <div className="p-8">
                <header className="mb-10">
                    <h1 className="text-4xl font-bold mb-2">Learning Hub</h1>
                    <p className="text-gray-400">Unlock your potential with our suite of AI-powered STEM tools.</p>
                </header>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {tools.map((tool) => (
                        <div key={tool.toolKey} className="h-full">
                            <AITool {...tool} />
                        </div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default LearningHub;
