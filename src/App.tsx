import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { LandingPage } from './components/LandingPage';
import { AuthForm } from './components/AuthForm';
import { Dashboard } from './components/Dashboard';
import { Loader } from 'lucide-react';

type View = 'landing' | 'auth' | 'dashboard';

function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>('landing');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (session) {
        setView('dashboard');
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        setView('dashboard');
      } else {
        setView('landing');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleNavigateToAuth = () => {
    setView('auth');
  };

  const handleBackToLanding = () => {
    setView('landing');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (session) {
    return <Dashboard />;
  }

  if (view === 'auth') {
    return <AuthForm onSuccess={() => {}} onBack={handleBackToLanding} />;
  }

  return <LandingPage onNavigateToAuth={handleNavigateToAuth} />;
}

export default App;
