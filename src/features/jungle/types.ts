/**
 * Types for the Jungle Math Game module
 */

export type JungleSessionStatus = 'active' | 'finished' | 'aborted';

export type JungleDifficulty = 1 | 2 | 3;

export interface JungleSession {
  id: string;
  status: JungleSessionStatus;
  level: JungleDifficulty;
  currentQuestionIndex: number;
  totalQuestions: number;
  correctAnswers: number;
  startedAt: string;
  finishedAt?: string;
}

export interface JungleQuestion {
  id: string;
  content: string;
  options: string[];
  questionNumber: number;
}

export interface JungleAnswerRequest {
  sessionId: string;
  questionId: string;
  answer: string;
}

export interface JungleAnswerResponse {
  correct: boolean;
  correctAnswer: string;
  session: JungleSession;
  nextQuestion?: JungleQuestion;
}

export interface JungleResult {
  sessionId: string;
  correctAnswers: number;
  totalQuestions: number;
  score: number;
  durationSeconds: number;
  level: JungleDifficulty;
  finishedAt: string;
}

export interface JungleProgress {
  totalGamesPlayed: number;
  totalCorrectAnswers: number;
  totalQuestions: number;
  averageScore: number;
  bestScore: number;
  lastPlayedAt?: string;
}
