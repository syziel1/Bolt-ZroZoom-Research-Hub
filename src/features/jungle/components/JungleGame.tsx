import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { useJungleGame } from '../hooks';
import { JungleHUD } from './JungleHUD';
import { JungleSummary } from './JungleSummary';
import type { JungleDifficulty } from '../types';

export function JungleGame() {
  const navigate = useNavigate();
  const {
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
    resetGame,
  } = useJungleGame();

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const handleStartGame = async (level: JungleDifficulty) => {
    setSelectedAnswer(null);
    await startGame(level);
  };

  const handleAnswerClick = async (answer: string) => {
    if (isLoading || phase === 'answered') return;
    setSelectedAnswer(answer);
    await submitAnswer(answer);
  };

  const handleContinue = () => {
    setSelectedAnswer(null);
    continueToNextQuestion();
  };

  const handlePlayAgain = () => {
    setSelectedAnswer(null);
    resetGame();
  };

  const handleGoHome = () => {
    navigate('/');
  };

  // Idle phase - level selection
  if (phase === 'idle') {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="text-7xl mb-6">🌴🦁🌴</div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Matematyczna Dżungla
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          Wybierz poziom trudności i sprawdź swoje umiejętności matematyczne!
        </p>

        <div className="grid gap-4 md:grid-cols-3">
          <button
            onClick={() => handleStartGame(1)}
            disabled={isLoading}
            className="bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 p-6 rounded-xl transition-colors group disabled:opacity-50"
          >
            <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">🐒</div>
            <h3 className="text-xl font-bold text-green-800 dark:text-green-200 mb-1">Łatwy</h3>
            <p className="text-sm text-green-600 dark:text-green-400">Podstawowe działania</p>
          </button>

          <button
            onClick={() => handleStartGame(2)}
            disabled={isLoading}
            className="bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:hover:bg-yellow-900/50 p-6 rounded-xl transition-colors group disabled:opacity-50"
          >
            <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">🦁</div>
            <h3 className="text-xl font-bold text-yellow-800 dark:text-yellow-200 mb-1">Średni</h3>
            <p className="text-sm text-yellow-600 dark:text-yellow-400">Większe liczby i dzielenie</p>
          </button>

          <button
            onClick={() => handleStartGame(3)}
            disabled={isLoading}
            className="bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 p-6 rounded-xl transition-colors group disabled:opacity-50"
          >
            <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">🐅</div>
            <h3 className="text-xl font-bold text-red-800 dark:text-red-200 mb-1">Trudny</h3>
            <p className="text-sm text-red-600 dark:text-red-400">Zaawansowane zadania</p>
          </button>
        </div>

        {isLoading && (
          <div className="mt-8 flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
            <Loader className="animate-spin" size={20} />
            <span>Ładowanie gry...</span>
          </div>
        )}
      </div>
    );
  }

  // Error phase
  if (phase === 'error') {
    return (
      <div className="max-w-md mx-auto text-center">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Ups! Coś poszło nie tak
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {error || 'Wystąpił nieoczekiwany błąd'}
        </p>
        <button
          onClick={resetGame}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          Spróbuj ponownie
        </button>
      </div>
    );
  }

  // Finished phase
  if (phase === 'finished' && result) {
    return (
      <JungleSummary
        result={result}
        onPlayAgain={handlePlayAgain}
        onGoHome={handleGoHome}
      />
    );
  }

  // Playing/Answered phase
  if ((phase === 'playing' || phase === 'answered') && session && currentQuestion) {
    return (
      <div className="max-w-2xl mx-auto">
        <JungleHUD session={session} questionNumber={currentQuestion.questionNumber} />

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-8">
            {currentQuestion.content}
          </h2>

          <div className="grid gap-3 md:grid-cols-2">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === option;
              const isCorrect = lastCorrectAnswer === option;
              const showResult = phase === 'answered';

              let buttonClasses = 'w-full p-4 text-lg font-semibold rounded-lg transition-all border-2 ';

              if (showResult) {
                if (isCorrect) {
                  buttonClasses += 'bg-green-100 border-green-500 text-green-800 dark:bg-green-900/30 dark:text-green-200';
                } else if (isSelected && !lastAnswerCorrect) {
                  buttonClasses += 'bg-red-100 border-red-500 text-red-800 dark:bg-red-900/30 dark:text-red-200';
                } else {
                  buttonClasses += 'bg-gray-100 border-gray-200 text-gray-500 dark:bg-slate-700 dark:border-slate-600 dark:text-gray-400';
                }
              } else {
                buttonClasses += 'bg-gray-50 border-gray-200 text-gray-800 hover:bg-green-50 hover:border-green-300 dark:bg-slate-700 dark:border-slate-600 dark:text-gray-200 dark:hover:bg-green-900/20 dark:hover:border-green-600';
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerClick(option)}
                  disabled={isLoading || phase === 'answered'}
                  className={buttonClasses}
                >
                  {option}
                  {showResult && isCorrect && ' ✓'}
                  {showResult && isSelected && !lastAnswerCorrect && ' ✗'}
                </button>
              );
            })}
          </div>
        </div>

        {phase === 'answered' && (
          <div className="text-center">
            <div className={`mb-4 text-xl font-semibold ${lastAnswerCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {lastAnswerCorrect ? '🎉 Świetnie! Poprawna odpowiedź!' : '❌ Niestety, to nie jest poprawna odpowiedź.'}
            </div>

            <button
              onClick={handleContinue}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors shadow-md"
            >
              Dalej →
            </button>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 mt-4">
            <Loader className="animate-spin" size={20} />
            <span>Przetwarzanie...</span>
          </div>
        )}
      </div>
    );
  }

  // Fallback loading state
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader className="animate-spin text-green-600" size={48} />
    </div>
  );
}
