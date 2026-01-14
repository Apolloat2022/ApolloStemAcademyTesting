export const AI_WORKER_URL = 'https://apolloacademyaiteacher.revanaglobal.workers.dev/';

export const aiService = {
    generate: async (prompt: string, context?: string) => {
        const fullPrompt = context ? `${context}\n\n${prompt}` : prompt;

        console.log('[AI Service] Requesting:', { url: AI_WORKER_URL, prompt: fullPrompt });

        try {
            const response = await fetch(AI_WORKER_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: fullPrompt })
            });

            console.log('[AI Service] Response Status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('[AI Service] Error Body:', errorText);
                throw new Error(`HTTP Error: ${response.status}`);
            }

            const data = await response.json();
            console.log('[AI Service] Data:', data);

            if (data.success) {
                return data.answer;
            } else {
                throw new Error(data.error || 'Unknown AI Error');
            }
        } catch (error: any) {
            console.error('[AI Service] Exception:', error);
            throw error;
        }
    }
};
