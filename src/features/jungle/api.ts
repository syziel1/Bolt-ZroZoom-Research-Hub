import { supabase } from '../../lib/supabase';
import type {
  JungleSession,
  JungleAnswerRequest,
  JungleAnswerResponse,
  JungleResult,
  JungleProgress,
  JungleDifficulty,
} from './types';

const JUNGLE_FUNCTION_URL = 'jungle-game';

/**
 * Start a new jungle game session
 */
export async function startJungleSession(level: JungleDifficulty): Promise<{ session: JungleSession; question: { id: string; content: string; options: string[]; questionNumber: number } }> {
  const { data, error } = await supabase.functions.invoke(JUNGLE_FUNCTION_URL, {
    body: { action: 'start', level },
  });

  if (error) {
    throw new Error(error.message || 'Nie udało się rozpocząć gry');
  }

  return data;
}

/**
 * Send an answer for the current question
 */
export async function sendJungleAnswer(payload: JungleAnswerRequest): Promise<JungleAnswerResponse> {
  const { data, error } = await supabase.functions.invoke(JUNGLE_FUNCTION_URL, {
    body: { action: 'answer', ...payload },
  });

  if (error) {
    throw new Error(error.message || 'Nie udało się wysłać odpowiedzi');
  }

  return data;
}

/**
 * Finish a game session
 */
export async function finishJungleSession(sessionId: string): Promise<JungleResult> {
  const { data, error } = await supabase.functions.invoke(JUNGLE_FUNCTION_URL, {
    body: { action: 'finish', sessionId },
  });

  if (error) {
    throw new Error(error.message || 'Nie udało się zakończyć gry');
  }

  return data;
}

/**
 * Get user's game progress/statistics (optional)
 */
export async function getJungleProgress(): Promise<JungleProgress> {
  const { data, error } = await supabase.functions.invoke(JUNGLE_FUNCTION_URL, {
    body: { action: 'progress' },
  });

  if (error) {
    throw new Error(error.message || 'Nie udało się pobrać postępów');
  }

  return data;
}
