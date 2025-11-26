import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LogIn, UserPlus, ArrowLeft } from 'lucide-react';

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
        navigate('/dashboard');
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        {(onBack || true) && (
          <button
            onClick={() => onBack ? onBack() : navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            Powrót do strony głównej
          </button>
        )}

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Szkoła Przyszłości z AI</h1>
          <p className="text-gray-600 mt-2">Edukacja z wykorzystaniem sztucznej inteligencji</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {!isLogin && (
            <>
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                  Imię i Nazwisko / Nazwa (opcjonalnie)
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="np. Jan Kowalski"
                />
              </div>

              <div>
                <label htmlFor="nick" className="block text-sm font-medium text-gray-700 mb-1">
                  Pseudonim (wymagany)
                </label>
                <div className="flex gap-2">
                  <input
                    id="nick"
                    type="text"
                    value={nick}
                    onChange={(e) => setNick(e.target.value)}
                    required
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Unikalny identyfikator"
                  />
                  <button
                    type="button"
                    onClick={generateNick}
                    className="px-3 py-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 border border-gray-300 text-sm whitespace-nowrap"
                    title="Wygeneruj z nazwy lub emaila"
                  >
                    Generuj
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Będzie widoczny dla innych użytkowników
                </p>
              </div>
            </>
          )}

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Hasło
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
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

          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="w-full text-blue-600 hover:text-blue-800 text-sm"
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
           * - VITE_TEST_EMAIL: Email address for test user (default: 'test@zrozoomai.pl')
           * - VITE_TEST_PASSWORD: Password for test user (default: '123TesT456')
           * - VITE_TEST_ADMIN_EMAIL: Email address for test admin (default: 'test2@zrozoomai.pl')
           * - VITE_TEST_ADMIN_PASSWORD: Password for test admin (default: 'qnZgZaG_Y6k#A.b')
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
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="text-xs font-bold text-yellow-800 uppercase mb-3">
                🚧 Developer Mode Only
              </div>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setEmail(import.meta.env.VITE_TEST_EMAIL || 'test@zrozoomai.pl');
                    setPassword(import.meta.env.VITE_TEST_PASSWORD || '123TesT456');
                  }}
                  className="w-full bg-yellow-100 text-yellow-800 py-2 px-4 rounded border border-yellow-300 hover:bg-yellow-200 text-sm font-medium transition-colors"
                >
                  🎓 Auto-fill Test Student
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail(import.meta.env.VITE_TEST_ADMIN_EMAIL || 'test2@zrozoomai.pl');
                    setPassword(import.meta.env.VITE_TEST_ADMIN_PASSWORD || 'qnZgZaG_Y6k#A.b');
                  }}
                  className="w-full bg-purple-100 text-purple-800 py-2 px-4 rounded border border-purple-300 hover:bg-purple-200 text-sm font-medium transition-colors"
                >
                  👑 Auto-fill Test Admin
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
