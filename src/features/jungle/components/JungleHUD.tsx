import type { JungleSession } from '../types';

interface JungleHUDProps {
  session: JungleSession;
  questionNumber: number;
}

export function JungleHUD({ session, questionNumber }: JungleHUDProps) {
  const progressPercentage = (questionNumber / session.totalQuestions) * 100;

  return (
    <div className="bg-gradient-to-r from-green-600 to-green-700 dark:from-green-700 dark:to-green-800 rounded-xl p-4 mb-6 shadow-lg">
      <div className="flex items-center justify-between text-white mb-3">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <span className="block text-2xl font-bold">{questionNumber}</span>
            <span className="text-xs text-green-100">Pytanie</span>
          </div>
          <div className="text-3xl">🌴</div>
          <div className="text-center">
            <span className="block text-2xl font-bold">{session.totalQuestions}</span>
            <span className="text-xs text-green-100">Razem</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-center">
            <span className="block text-2xl font-bold">{session.correctAnswers}</span>
            <span className="text-xs text-green-100">Poprawne</span>
          </div>
          <div className="text-3xl">
            {session.level === 1 && '🐒'}
            {session.level === 2 && '🦁'}
            {session.level === 3 && '🐅'}
          </div>
        </div>
      </div>

      <div className="w-full bg-green-900/30 rounded-full h-3">
        <div
          className="bg-yellow-400 h-3 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
}
