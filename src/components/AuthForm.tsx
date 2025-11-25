import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { LogIn, UserPlus, ArrowLeft } from 'lucide-react';

type AuthFormProps = {
  onSuccess: () => void;
  onBack?: () => void;
};

export function AuthForm({ onSuccess, onBack }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nick, setNick] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              nick: nick || email.split('@')[0],
            },
          },
        });
        if (error) throw error;
      }
      onSuccess();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            Powrót do strony głównej
          </button>
        )}

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ZroZoom Research Hub</h1>
          <p className="text-gray-600 mt-2">Platforma zasobów edukacyjnych</p>
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
            <div>
              <label htmlFor="nick" className="block text-sm font-medium text-gray-700 mb-1">
                Pseudonim (opcjonalnie)
              </label>
              <input
                id="nick"
                type="text"
                value={nick}
                onChange={(e) => setNick(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
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
           * 
           * To configure custom test credentials, add these to your .env file:
           * ```
           * VITE_TEST_EMAIL=your-test-email@example.com
           * VITE_TEST_PASSWORD=your-test-password
           * ```
           * 
           * Note: This feature is automatically removed in production builds.
           */}
          {import.meta.env.DEV && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="text-xs font-bold text-yellow-800 uppercase mb-2">
                🚧 Developer Mode Only
              </div>
              <button
                type="button"
                onClick={() => {
                  setEmail(import.meta.env.VITE_TEST_EMAIL || '');
                  setPassword(import.meta.env.VITE_TEST_PASSWORD || '');
                }}
                className="w-full bg-yellow-100 text-yellow-800 py-2 px-4 rounded border border-yellow-300 hover:bg-yellow-200 text-sm font-medium transition-colors"
              >
                Auto-fill Test User
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
