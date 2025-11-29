import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';
import { ArrowLeft, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { JungleGame } from './components/JungleGame';
import { Footer } from '../../components/Footer';
import { SEO } from '../../components/SEO';

export function JungleGamePage() {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <Loader className="animate-spin text-green-600" size={48} />
      </div>
    );
  }

  // If not logged in, show login prompt
  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-100 dark:from-slate-900 dark:to-slate-800 flex flex-col">
        <SEO
          title="Matematyczna Dżungla - Logowanie wymagane"
          description="Zaloguj się, aby zagrać w Matematyczną Dżunglę - grę edukacyjną rozwijającą umiejętności matematyczne."
        />

        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 max-w-md text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              Zaloguj się, aby grać
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Matematyczna Dżungla jest dostępna tylko dla zalogowanych użytkowników.
              Zaloguj się, aby śledzić swoje postępy i rywalizować z innymi!
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate('/auth')}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-md"
              >
                Zaloguj się
              </button>
              <button
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 font-medium py-2"
              >
                ← Wróć na stronę główną
              </button>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-100 dark:from-slate-900 dark:to-slate-800 flex flex-col">
      <SEO
        title="Matematyczna Dżungla - Gra edukacyjna"
        description="Rozwijaj swoje umiejętności matematyczne w przygodowej grze Matematyczna Dżungla. Rozwiązuj zadania i zdobywaj punkty!"
      />

      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-green-200 dark:border-slate-700 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="hidden sm:inline">Powrót</span>
          </button>

          <h1 className="text-xl font-bold text-green-700 dark:text-green-400 flex items-center gap-2">
            🌴 Matematyczna Dżungla
          </h1>

          <div className="w-20" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <JungleGame />
        </div>
      </main>

      <Footer />
    </div>
  );
}
