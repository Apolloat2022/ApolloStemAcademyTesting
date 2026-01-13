import { describe, it, expect, vi } from 'vitest';
import { aiIntelligence } from './ai_services';

describe('AI Intelligence Service', () => {
    it('should generate a mock report when no API key is provided', async () => {
        const mockDb = {
            prepare: vi.fn().mockReturnThis(),
            bind: vi.fn().mockReturnThis(),
            all: vi.fn().mockResolvedValue({ results: [] })
        } as any;

        const result = await aiIntelligence.generateNarrativeReport(mockDb, 'student_123');
        expect(result).toHaveProperty('report');
        expect(result.report).toContain('progress in Algebra');
    });
});
