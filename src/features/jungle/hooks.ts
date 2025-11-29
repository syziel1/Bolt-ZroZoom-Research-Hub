import { useState, useCallback } from 'react';
import type {
  JungleSession,
  JungleQuestion,
  JungleResult,
  JungleDifficulty,
} from './types';
import {
  startJungleSession,
  sendJungleAnswer,
  finishJungleSession,
} from './api';

export type GamePhase = 'idle' | 'playing' | 'answered' | 'finished' | 'error';

interface UseJungleGameReturn {
  phase: GamePhase;
  session: JungleSession | null;
  currentQuestion: JungleQuestion | null;
  result: JungleResult | null;
  error: string | null;
  isLoading: boolean;
  lastAnswerCorrect: boolean | null;
  lastCorrectAnswer: string | null;
  startGame: (level: JungleDifficulty) => Promise<void>;
  submitAnswer: (answer: string) => Promise<void>;
  continueToNextQuestion: () => void;
  endGame: () => Promise<void>;
  resetGame: () => void;
}

export function useJungleGame(): UseJungleGameReturn {
  const [phase, setPhase] = useState<GamePhase>('idle');
  const [session, setSession] = useState<JungleSession | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<JungleQuestion | null>(null);
  const [result, setResult] = useState<JungleResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(null);
  const [lastCorrectAnswer, setLastCorrectAnswer] = useState<string | null>(null);

  const startGame = useCallback(async (level: JungleDifficulty) => {
    setIsLoading(true);
    setError(null);
    setLastAnswerCorrect(null);
    setLastCorrectAnswer(null);
    try {
      const data = await startJungleSession(level);
      setSession(data.session);
      setCurrentQuestion(data.question);
      setPhase('playing');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystąpił błąd podczas rozpoczynania gry');
      setPhase('error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const submitAnswer = useCallback(async (answer: string) => {
    if (!session || !currentQuestion) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await sendJungleAnswer({
        sessionId: session.id,
        questionId: currentQuestion.id,
        answer,
      });

      setLastAnswerCorrect(response.correct);
      setLastCorrectAnswer(response.correctAnswer);
      setSession(response.session);

      if (response.session.status === 'finished') {
        // Game is complete
        setPhase('finished');
        // Fetch final result
        const finalResult = await finishJungleSession(session.id);
        setResult(finalResult);
      } else if (response.nextQuestion) {
        setCurrentQuestion(response.nextQuestion);
        setPhase('answered');
      } else {
        setPhase('answered');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystąpił błąd podczas wysyłania odpowiedzi');
      setPhase('error');
    } finally {
      setIsLoading(false);
    }
  }, [session, currentQuestion]);

  const continueToNextQuestion = useCallback(() => {
    setLastAnswerCorrect(null);
    setLastCorrectAnswer(null);
    setPhase('playing');
  }, []);

  const endGame = useCallback(async () => {
    if (!session) return;

    setIsLoading(true);
    setError(null);
    try {
      const finalResult = await finishJungleSession(session.id);
      setResult(finalResult);
      setPhase('finished');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystąpił błąd podczas kończenia gry');
      setPhase('error');
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  const resetGame = useCallback(() => {
    setPhase('idle');
    setSession(null);
    setCurrentQuestion(null);
    setResult(null);
    setError(null);
    setLastAnswerCorrect(null);
    setLastCorrectAnswer(null);
  }, []);

  return {
    phase,
    session,
    currentQuestion,
    result,
    error,
    isLoading,
    lastAnswerCorrect,
    lastCorrectAnswer,
    startGame,
    submitAnswer,
    continueToNextQuestion,
    endGame,
    resetGame,
  };
}
