import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LogIn, UserPlus, ArrowLeft } from 'lucide-react';
import { SEO } from './SEO';

type AuthFormProps = {
  onSuccess?: () => void;
  onBack?: () => void;
};

export function AuthForm({ onSuccess, onBack }: AuthFormProps) {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nick, setNick] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const generateNick = () => {
    const base = fullName || email.split('@')[0];
    if (!base) return;

    const generated = base
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-')         // Replace spaces with hyphens
      .replace(/-+/g, '-');         // Remove duplicate hyphens

    setNick(generated);
  };

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const user = session.user;

        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!existingProfile && user.user_metadata) {
          const generateNickFromString = (base: string) => {
            return base
              .toLowerCase()
              .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
              .trim()
              .replace(/[^a-z0-9\s-]/g, '')
              .replace(/\s+/g, '-')
              .replace(/-+/g, '-');
          };

          const baseNick = user.user_metadata.full_name || user.email?.split('@')[0] || 'user';
          const generatedNick = generateNickFromString(baseNick);

          await supabase.from('profiles').insert({
            user_id: user.id,
            nick: generatedNick,
            name: user.user_metadata.full_name || null,
          });
        }

        if (onSuccess) {
          onSuccess();
        } else {
          navigate('/zasoby');
        }
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate, onSuccess]);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/zasoby`,
        },
      });
      if (error) throw error;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Wystąpił błąd podczas logowania przez Google');
      }
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        if (!nick) {
          throw new Error('Pseudonim jest wymagany');
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              nick: nick,
              full_name: fullName,
            },
          },
        });
        if (error) throw error;
      }
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/zasoby');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Wystąpił nieznany błąd');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
      <SEO
        title={isLogin ? "Logowanie" : "Rejestracja"}
        description="Zaloguj się lub zarejestruj, aby uzyskać dostęp do pełnej bazy wiedzy i funkcji społecznościowych."
      />
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8">
        {(onBack || true) && (
          <button
            onClick={() => onBack ? onBack() : navigate('/')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            Powrót do strony głównej
          </button>
        )}

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Szkoła Przyszłości z AI</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Edukacja z wykorzystaniem sztucznej inteligencji</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100"
            />
          </div>

          {!isLogin && (
            <>
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Imię i Nazwisko / Nazwa (opcjonalnie)
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100"
                  placeholder="np. Jan Kowalski"
                />
              </div>

              <div>
                <label htmlFor="nick" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Pseudonim (wymagany)
                </label>
                <div className="flex gap-2">
                  <input
                    id="nick"
                    type="text"
                    value={nick}
                    onChange={(e) => setNick(e.target.value)}
                    required
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100"
                    placeholder="Unikalny identyfikator"
                  />
                  <button
                    type="button"
                    onClick={generateNick}
                    className="px-3 py-2 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-slate-600 border border-gray-300 dark:border-slate-600 text-sm whitespace-nowrap"
                    title="Wygeneruj z nazwy lub emaila"
                  >
                    Generuj
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Będzie widoczny dla innych użytkowników
                </p>
              </div>
            </>
          )}

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Hasło
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100"
            />
          </div>

          {error && (
            <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/30 p-3 rounded-md border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-slate-600 flex items-center justify-center gap-2"
          >
            {loading ? (
              'Ładowanie...'
            ) : isLogin ? (
              <>
                <LogIn size={20} />
                Zaloguj się
              </>
            ) : (
              <>
                <UserPlus size={20} />
                Zarejestruj się
              </>
            )}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-slate-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400">lub</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
            className="w-full bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 py-2 px-4 rounded-md border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600 disabled:bg-gray-100 dark:disabled:bg-slate-800 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {googleLoading ? 'Łączenie z Google...' : 'Kontynuuj z Google'}
          </button>

          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="w-full text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm mt-4"
          >
            {isLogin ? "Nie masz konta? Zarejestruj się" : 'Masz już konto? Zaloguj się'}
          </button>

          {/**
           * Developer Shortcut Panel
           * 
           * This section is only visible in development mode (import.meta.env.DEV).
           * It provides a quick way to auto-fill login credentials for testing purposes.
           * 
           * Environment Variables (optional):
           * - VITE_TEST_EMAIL: Email address for test user
           * - VITE_TEST_PASSWORD: Password for test user
           * - VITE_TEST_ADMIN_EMAIL: Email address for test admin
           * - VITE_TEST_ADMIN_PASSWORD: Password for test admin
           * 
           * To configure custom test credentials, add these to your .env file:
           * ```
           * VITE_TEST_EMAIL=your-test-email@example.com
           * VITE_TEST_PASSWORD=your-test-password
           * VITE_TEST_ADMIN_EMAIL=your-admin-email@example.com
           * VITE_TEST_ADMIN_PASSWORD=your-admin-password
           * ```
           * 
           * Note: This feature is automatically removed in production builds.
           */}
          {import.meta.env.DEV && (
            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
              <div className="text-xs font-bold text-yellow-800 dark:text-yellow-200 uppercase mb-3">
                🚧 Developer Mode Only
              </div>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    const email = import.meta.env.VITE_TEST_EMAIL;
                    const password = import.meta.env.VITE_TEST_PASSWORD;
                    if (email && password) {
                      setEmail(email);
                      setPassword(password);
                    } else {
                      alert('Skonfiguruj VITE_TEST_EMAIL i VITE_TEST_PASSWORD w pliku .env');
                    }
                  }}
                  className="w-full bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200 py-2 px-4 rounded border border-yellow-300 dark:border-yellow-700 hover:bg-yellow-200 dark:hover:bg-yellow-900/60 text-sm font-medium transition-colors"
                >
                  🎓 Auto-fill Test Student
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const email = import.meta.env.VITE_TEST_ADMIN_EMAIL;
                    const password = import.meta.env.VITE_TEST_ADMIN_PASSWORD;
                    if (email && password) {
                      setEmail(email);
                      setPassword(password);
                    } else {
                      alert('Skonfiguruj VITE_TEST_ADMIN_EMAIL i VITE_TEST_ADMIN_PASSWORD w pliku .env');
                    }
                  }}
                  className="w-full bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200 py-2 px-4 rounded border border-purple-300 dark:border-purple-700 hover:bg-purple-200 dark:hover:bg-purple-900/60 text-sm font-medium transition-colors"
                >
                  👑 Auto-fill Test Admin
                </button>
              </div>
            </div>
          )}
        </form >
      </div >
    </div >
  );
}
