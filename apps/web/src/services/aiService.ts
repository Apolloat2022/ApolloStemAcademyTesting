import { api } from './api';

export const aiService = {
    generate: async (prompt: string, context?: string) => {
        const fullPrompt = context ? `${context}\n\n${prompt}` : prompt;

        // console.log('[AI Service] Requesting:', { prompt: fullPrompt });

        try {
            const response = await api.post('/api/ai/generate', {
                prompt: fullPrompt
            });

            const data = response.data;
            // console.log('[AI Service] Data:', data);

            if (data.success && data.answer) {
                return data.answer;
            } else if (data.error) {
                throw new Error(data.error);
            } else {
                throw new Error('AI service returned an unexpected response');
            }
        } catch (error: any) {
            console.error('[AI Service] Exception:', error);
            throw error;
        }
    }
};
