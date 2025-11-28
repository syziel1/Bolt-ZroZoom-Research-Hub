import { useState, useEffect } from 'react';
import { Library, Menu, X, ArrowRight, BookOpen, LayoutDashboard } from 'lucide-react';
import { Session } from '@supabase/supabase-js';

type NavigationProps = {
  onNavigateToAuth: () => void;
  onScrollToSubjects: () => void;
  onBrowseAsGuest: () => void;
  session: Session | null;
};

export function Navigation({ onNavigateToAuth, onScrollToSubjects, onBrowseAsGuest, session }: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navbarClasses = isScrolled
    ? 'bg-white shadow-lg'
    : 'bg-white/10 backdrop-blur-md';

  const logoTextClasses = isScrolled
    ? 'text-violet-600'
    : 'text-white';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navbarClasses}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className={`${isScrolled ? 'bg-violet-100' : 'bg-white/20'} p-2 rounded-lg transition-colors`}>
              <Library size={28} className={isScrolled ? 'text-violet-600' : 'text-white'} />
            </div>
            <span className={`text-xl font-bold ${logoTextClasses} transition-colors hidden sm:block`}>
              Szkoła Przyszłości z AI
            </span>
            <span className={`text-xl font-bold ${logoTextClasses} transition-colors sm:hidden`}>
              AI Hub
            </span>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={onScrollToSubjects}
              className={`px-6 py-2 rounded-lg font-semibold transition-all hover:scale-105 flex items-center gap-2 ${isScrolled
                ? 'text-violet-600 hover:bg-violet-50'
                : 'text-white hover:bg-white/10'
                }`}
            >
              Wybierz przedmiot
              <BookOpen size={18} />
            </button>

            {session ? (
              <button
                onClick={onBrowseAsGuest} // Redirects to /zasoby which is the dashboard
                className={`px-6 py-2 rounded-lg font-semibold transition-all hover:scale-105 shadow-md flex items-center gap-2 ${isScrolled
                  ? 'bg-violet-600 text-white hover:bg-violet-700'
                  : 'bg-white text-violet-600 hover:bg-violet-50'
                  }`}
              >
                Panel zasobów
                <LayoutDashboard size={18} />
              </button>
            ) : (
              <>
                <button
                  onClick={onBrowseAsGuest}
                  className={`px-6 py-2 rounded-lg font-semibold transition-all hover:scale-105 shadow-md flex items-center gap-2 ${isScrolled
                    ? 'bg-gray-800 text-white hover:bg-gray-900'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                >
                  Przeglądaj jako gość
                  <ArrowRight size={18} />
                </button>
                <button
                  onClick={onNavigateToAuth}
                  className={`px-6 py-2 rounded-lg font-semibold transition-all hover:scale-105 shadow-md flex items-center gap-2 ${isScrolled
                    ? 'bg-violet-600 text-white hover:bg-violet-700'
                    : 'bg-white text-violet-600 hover:bg-violet-50'
                    }`}
                >
                  Zaloguj się
                  <ArrowRight size={18} />
                </button>
              </>
            )}
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors ${isScrolled
              ? 'text-gray-900 hover:bg-gray-100'
              : 'text-white hover:bg-white/10'
              }`}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className={`md:hidden border-t ${isScrolled ? 'border-gray-200 bg-white' : 'border-white/20 bg-white/10 backdrop-blur-md'}`}>
          <div className="px-4 py-4 space-y-3">
            <button
              onClick={() => {
                onScrollToSubjects();
                setIsMobileMenuOpen(false);
              }}
              className={`w-full px-6 py-3 rounded-lg font-semibold transition-all text-center flex items-center justify-center gap-2 ${isScrolled
                ? 'text-violet-600 hover:bg-violet-50 bg-violet-50'
                : 'text-white hover:bg-white/10 bg-white/5'
                }`}
            >
              Wybierz przedmiot
              <BookOpen size={18} />
            </button>

            {session ? (
              <button
                onClick={() => {
                  onBrowseAsGuest();
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full px-6 py-3 rounded-lg font-semibold transition-all shadow-md flex items-center justify-center gap-2 ${isScrolled
                  ? 'bg-violet-600 text-white hover:bg-violet-700'
                  : 'bg-white text-violet-600 hover:bg-violet-50'
                  }`}
              >
                Panel zasobów
                <LayoutDashboard size={18} />
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    onBrowseAsGuest();
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full px-6 py-3 rounded-lg font-semibold transition-all shadow-md flex items-center justify-center gap-2 ${isScrolled
                    ? 'bg-gray-800 text-white hover:bg-gray-900'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                >
                  Przeglądaj jako gość
                  <ArrowRight size={18} />
                </button>
                <button
                  onClick={() => {
                    onNavigateToAuth();
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full px-6 py-3 rounded-lg font-semibold transition-all shadow-md flex items-center justify-center gap-2 ${isScrolled
                    ? 'bg-violet-600 text-white hover:bg-violet-700'
                    : 'bg-white text-violet-600 hover:bg-violet-50'
                    }`}
                >
                  Zaloguj się
                  <ArrowRight size={18} />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
