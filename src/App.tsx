import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import { LandingPage } from './components/LandingPage';
import { AuthForm } from './components/AuthForm';
import { Dashboard } from './components/Dashboard';
import { Loader } from 'lucide-react';


type View = 'landing' | 'auth' | 'dashboard' | 'browse';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>('landing');
  const [initialSubject, setInitialSubject] = useState<string | null>(null);

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

  const handleBrowseAsGuest = (subjectId?: string) => {
    setInitialSubject(subjectId || null);
    setView('browse');
  };

  const handleBackToLanding = () => {
    setView('landing');
    setInitialSubject(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (session) {
    return <Dashboard />;
  }

  if (view === 'auth') {
    return <AuthForm onSuccess={() => setView('dashboard')} onBack={handleBackToLanding} />;
  }

  if (view === 'browse') {
    return <Dashboard isGuestMode={true} onNavigateToAuth={handleNavigateToAuth} onBackToLanding={handleBackToLanding} initialSubject={initialSubject} />;
  }

  return <LandingPage onNavigateToAuth={handleNavigateToAuth} onBrowseAsGuest={handleBrowseAsGuest} />;
}

export default App;
