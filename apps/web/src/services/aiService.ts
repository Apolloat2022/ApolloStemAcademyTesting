// Use deployed Cloudflare Worker (same as working HTML file)
const CLOUDFLARE_WORKER_URL = 'https://apolloacademyaiteacher.revanaglobal.workers.dev/';

export const aiService = {
    generate: async (prompt: string, context?: string) => {
        const fullPrompt = context ? `${context}\n\n${prompt}` : prompt;

        console.log('[AI Service] Requesting:', { url: CLOUDFLARE_WORKER_URL, prompt: fullPrompt });

        try {
            const response = await fetch(CLOUDFLARE_WORKER_URL, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: fullPrompt
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

            // Handle response from deployed Cloudflare Worker
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
