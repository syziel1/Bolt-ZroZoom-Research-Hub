import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import { LandingPage } from './components/LandingPage';
import { UserHomePage } from './components/UserHomePage';
import { AuthForm } from './components/AuthForm';
import { Dashboard } from './components/Dashboard';
import { MarkdownPage } from './components/MarkdownPage';
import { HelpPage } from './pages/HelpPage';
import { WhatsNew } from './pages/WhatsNew';
import { Loader } from 'lucide-react';

function AppRoutes({ session }: { session: Session | null }) {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={session ? <UserHomePage /> : <LandingPage />} />
      <Route path="/auth" element={
        session ? <Navigate to="/zasoby" replace /> : <AuthForm />
      } />
      <Route path="/zasoby" element={<Dashboard />} />
      <Route path="/zasoby/:subjectSlug" element={<Dashboard />} />
      <Route path="/zasoby/:subjectSlug/:topicSlug" element={<Dashboard />} />
      <Route path="/zasoby/:subjectSlug/:topicSlug/:subtopicSlug" element={<Dashboard />} />

      {/* Help routes */}
      <Route path="/pomoc" element={<HelpPage />} />
      <Route path="/pomoc/:slug" element={<HelpPage />} />

      {/* Static pages */}
      <Route path="/o-nas" element={<MarkdownPage fileName="about.md" />} />
      <Route path="/polityka-prywatnosci" element={<MarkdownPage fileName="privacy.md" />} />
      <Route path="/co-nowego" element={<WhatsNew />} />

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AppRoutes session={session} />
    </BrowserRouter>
  );
}

export default App;
