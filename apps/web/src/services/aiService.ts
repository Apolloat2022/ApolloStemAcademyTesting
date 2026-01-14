const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';
const AI_ENDPOINT = `${API_BASE_URL}/api/ai/generate`;

export const aiService = {
    generate: async (prompt: string, context?: string) => {
        const fullPrompt = context ? `${context}\n\n${prompt}` : prompt;

        console.log('[AI Service] Requesting:', { url: AI_ENDPOINT, prompt: fullPrompt });

        try {
            const response = await fetch(AI_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: fullPrompt,
                    toolKey: 'general'
                })
            });

            console.log('[AI Service] Response Status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('[AI Service] Error Body:', errorText);
                if (response.status === 404) throw new Error("API endpoint not found. Backend might be down.");
                if (response.status === 401) throw new Error("Authentication issue. Please retry.");
                throw new Error(`HTTP Error: ${response.status}`);
            }

            const data = await response.json();
            console.log('[AI Service] Data:', data);

            if (data.success) {
                return data.answer;
            } else {
                throw new Error(data.error || 'AI service returned an error');
            }
        } catch (error: any) {
            console.error('[AI Service] Exception:', error);
            throw error;
        }
    }
};
