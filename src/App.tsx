import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import { LandingPage } from './components/LandingPage';
import { AuthForm } from './components/AuthForm';
import { Dashboard } from './components/Dashboard';
import { MarkdownPage } from './components/MarkdownPage';
import { Loader } from 'lucide-react';


type View = 'landing' | 'auth' | 'dashboard' | 'browse' | 'about' | 'privacy';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>('landing');
  const [initialSubject, setInitialSubject] = useState<string | null>(null);
  const [initialSearchQuery, setInitialSearchQuery] = useState('');

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

  const handleBrowseAsGuest = (subjectId?: string, searchQuery?: string) => {
    setInitialSubject(subjectId || null);
    setInitialSearchQuery(searchQuery || '');
    setView('browse');
  };

  const handleBackToLanding = () => {
    setView('landing');
    setInitialSubject(null);
    setInitialSearchQuery('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (session) {
    return <Dashboard
      onNavigateToAbout={() => setView('about')}
      onNavigateToPrivacy={() => setView('privacy')}
      initialSearchQuery={initialSearchQuery}
    />;
  }

  if (view === 'auth') {
    return <AuthForm onSuccess={() => setView('dashboard')} onBack={handleBackToLanding} />;
  }

  if (view === 'browse') {
    return <Dashboard
      isGuestMode={true}
      onNavigateToAuth={handleNavigateToAuth}
      onBackToLanding={handleBackToLanding}
      initialSubject={initialSubject}
      onNavigateToAbout={() => setView('about')}
      onNavigateToPrivacy={() => setView('privacy')}
      initialSearchQuery={initialSearchQuery}
    />;
  }

  if (view === 'about') {
    return <MarkdownPage fileName="about.md" onBack={handleBackToLanding} />;
  }

  if (view === 'privacy') {
    return <MarkdownPage fileName="privacy.md" onBack={handleBackToLanding} />;
  }

  return <LandingPage
    onNavigateToAuth={handleNavigateToAuth}
    onBrowseAsGuest={handleBrowseAsGuest}
    onSearch={(query) => handleBrowseAsGuest(undefined, query)}
    onNavigateToAbout={() => setView('about')}
    onNavigateToPrivacy={() => setView('privacy')}
  />;
}

export default App;
