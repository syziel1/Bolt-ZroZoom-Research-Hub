import type { JungleResult } from '../types';

interface JungleSummaryProps {
  result: JungleResult;
  onPlayAgain: () => void;
  onGoHome: () => void;
}

export function JungleSummary({ result, onPlayAgain, onGoHome }: JungleSummaryProps) {
  const percentage = Math.round((result.correctAnswers / result.totalQuestions) * 100);
  const minutes = Math.floor(result.durationSeconds / 60);
  const seconds = result.durationSeconds % 60;

  const getResultEmoji = () => {
    if (percentage >= 90) return '🏆';
    if (percentage >= 70) return '🌟';
    if (percentage >= 50) return '👍';
    return '💪';
  };

  const getResultMessage = () => {
    if (percentage >= 90) return 'Wspaniale! Jesteś mistrzem dżungli!';
    if (percentage >= 70) return 'Bardzo dobrze! Prawie u celu!';
    if (percentage >= 50) return 'Nieźle! Ćwicz dalej!';
    return 'Nie poddawaj się! Każda próba to krok naprzód!';
  };

  const getLevelName = () => {
    switch (result.level) {
      case 1:
        return 'Łatwy 🐒';
      case 2:
        return 'Średni 🦁';
      case 3:
        return 'Trudny 🐅';
      default:
        return 'Nieznany';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 max-w-md mx-auto text-center">
      <div className="text-6xl mb-4">{getResultEmoji()}</div>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        Koniec gry!
      </h2>

      <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
        {getResultMessage()}
      </p>

      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <span className="block text-3xl font-bold text-green-600 dark:text-green-400">
              {result.correctAnswers}/{result.totalQuestions}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">Poprawnych odpowiedzi</span>
          </div>

          <div className="text-center">
            <span className="block text-3xl font-bold text-green-600 dark:text-green-400">
              {percentage}%
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">Skuteczność</span>
          </div>

          <div className="text-center">
            <span className="block text-3xl font-bold text-green-600 dark:text-green-400">
              {result.score}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">Punkty</span>
          </div>

          <div className="text-center">
            <span className="block text-3xl font-bold text-green-600 dark:text-green-400">
              {minutes}:{seconds.toString().padStart(2, '0')}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">Czas</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-800">
          <span className="text-sm text-gray-600 dark:text-gray-400">Poziom: </span>
          <span className="font-semibold text-gray-800 dark:text-gray-200">{getLevelName()}</span>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={onPlayAgain}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-md"
        >
          🔄 Zagraj ponownie
        </button>

        <button
          onClick={onGoHome}
          className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-800 dark:text-gray-200 font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          🏠 Strona główna
        </button>
      </div>
    </div>
  );
}
