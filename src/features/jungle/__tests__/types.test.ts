import { describe, it, expect } from 'vitest';
import type {
    JungleSession,
    JungleQuestion,
    JungleAnswerRequest,
    JungleResult,
    JungleDifficulty,
} from '../types';

describe('Jungle Types', () => {
    it('should have valid JungleSession structure', () => {
        const session: JungleSession = {
            id: '123',
            status: 'active',
            level: 1,
            currentQuestionIndex: 1,
            totalQuestions: 10,
            correctAnswers: 0,
            startedAt: new Date().toISOString(),
        };

        expect(session.id).toBe('123');
        expect(session.status).toBe('active');
        expect(session.level).toBe(1);
        expect(session.currentQuestionIndex).toBe(1);
        expect(session.totalQuestions).toBe(10);
        expect(session.correctAnswers).toBe(0);
    });

    it('should have valid JungleQuestion structure', () => {
        const question: JungleQuestion = {
            id: 'q1',
            content: '5 + 3 = ?',
            options: ['6', '7', '8', '9'],
            questionNumber: 1,
        };

        expect(question.id).toBe('q1');
        expect(question.content).toBe('5 + 3 = ?');
        expect(question.options).toHaveLength(4);
        expect(question.questionNumber).toBe(1);
    });

    it('should have valid JungleAnswerRequest structure', () => {
        const request: JungleAnswerRequest = {
            sessionId: 'session1',
            questionId: 'q1',
            answer: '8',
        };

        expect(request.sessionId).toBe('session1');
        expect(request.questionId).toBe('q1');
        expect(request.answer).toBe('8');
    });

    it('should have valid JungleResult structure', () => {
        const result: JungleResult = {
            sessionId: 'session1',
            correctAnswers: 8,
            totalQuestions: 10,
            score: 80,
            durationSeconds: 120,
            level: 2,
            finishedAt: new Date().toISOString(),
        };

        expect(result.sessionId).toBe('session1');
        expect(result.correctAnswers).toBe(8);
        expect(result.totalQuestions).toBe(10);
        expect(result.score).toBe(80);
        expect(result.durationSeconds).toBe(120);
        expect(result.level).toBe(2);
    });

    it('should accept valid difficulty levels', () => {
        const levels: JungleDifficulty[] = [1, 2, 3];

        expect(levels).toContain(1);
        expect(levels).toContain(2);
        expect(levels).toContain(3);
        expect(levels).toHaveLength(3);
    });
});
