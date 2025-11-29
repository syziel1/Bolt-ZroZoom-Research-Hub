import { useState, useEffect } from 'react';
import { Library, Menu, X, ArrowRight, BookOpen, LayoutDashboard, LogOut } from 'lucide-react';
import { Session } from '@supabase/supabase-js';

type NavigationProps = {
  onNavigateToAuth: () => void;
  onScrollToSubjects: () => void;
  onBrowseAsGuest: () => void;
  onLogout?: () => void;
  session: Session | null;
  forceScrolled?: boolean;
};

export function Navigation({ onNavigateToAuth, onScrollToSubjects, onBrowseAsGuest, onLogout, session, forceScrolled = false }: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const showScrolledStyle = isScrolled || forceScrolled;

  const navbarClasses = showScrolledStyle
    ? 'bg-white dark:bg-slate-800 shadow-lg border-b border-gray-200 dark:border-slate-700'
    : 'bg-white/10 backdrop-blur-md';

  const logoTextClasses = showScrolledStyle
    ? 'text-violet-600 dark:text-violet-400'
    : 'text-white';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navbarClasses}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className={`${showScrolledStyle ? 'bg-violet-100 dark:bg-violet-900/30' : 'bg-white/20'} p-2 rounded-lg transition-colors`}>
              <Library size={28} className={showScrolledStyle ? 'text-violet-600 dark:text-violet-400' : 'text-white'} />
            </div>
            <span className={`text-xl font-bold ${logoTextClasses} transition-colors hidden sm:block`}>
              Szkoła Przyszłości z AI
            </span>
            <span className={`text-xl font-bold ${logoTextClasses} transition-colors sm:hidden`}>
              AI Hub
            </span>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {session ? (
              <>
                <button
                  onClick={onBrowseAsGuest} // Redirects to /zasoby which is the dashboard
                  className={`px-6 py-2 rounded-lg font-semibold transition-all hover:scale-105 shadow-md flex items-center gap-2 ${showScrolledStyle
                    ? 'bg-violet-600 text-white hover:bg-violet-700 dark:bg-violet-600 dark:hover:bg-violet-700'
                    : 'bg-white text-violet-600 hover:bg-violet-50'
                    }`}
                >
                  Panel zasobów
                  <LayoutDashboard size={18} />
                </button>
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105 flex items-center gap-2 ${showScrolledStyle
                      ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20'
                      : 'text-white hover:bg-white/10'
                      }`}
                    title="Wyloguj się"
                  >
                    <LogOut size={18} />
                    <span className="sr-only">Wyloguj</span>
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={onBrowseAsGuest}
                  className={`px-6 py-2 rounded-lg font-semibold transition-all hover:scale-105 shadow-md flex items-center gap-2 ${showScrolledStyle
                    ? 'bg-gray-800 text-white hover:bg-gray-900 dark:bg-slate-700 dark:hover:bg-slate-600'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                >
                  Przeglądaj jako gość
                  <ArrowRight size={18} />
                </button>
                <button
                  onClick={onNavigateToAuth}
                  className={`px-6 py-2 rounded-lg font-semibold transition-all hover:scale-105 shadow-md flex items-center gap-2 ${showScrolledStyle
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
            aria-label={isMobileMenuOpen ? "Zamknij menu" : "Otwórz menu"}
            className={`md:hidden p-2 rounded-lg transition-colors ${showScrolledStyle
              ? 'text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-700'
              : 'text-white hover:bg-white/10'
              }`}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className={`md:hidden border-t ${showScrolledStyle ? 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800' : 'border-white/20 bg-white/10 backdrop-blur-md'}`}>
          <div className="px-4 py-4 space-y-3">
            <button
              onClick={() => {
                onScrollToSubjects();
                setIsMobileMenuOpen(false);
              }}
              className={`w-full px-6 py-3 rounded-lg font-semibold transition-all text-center flex items-center justify-center gap-2 ${showScrolledStyle
                ? 'text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 bg-violet-50 dark:bg-violet-900/10'
                : 'text-white hover:bg-white/10 bg-white/5'
                }`}
            >
              Wybierz przedmiot
              <BookOpen size={18} />
            </button>

            {session ? (
              <>
                <button
                  onClick={() => {
                    onBrowseAsGuest();
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full px-6 py-3 rounded-lg font-semibold transition-all shadow-md flex items-center justify-center gap-2 ${showScrolledStyle
                    ? 'bg-violet-600 text-white hover:bg-violet-700'
                    : 'bg-white text-violet-600 hover:bg-violet-50'
                    }`}
                >
                  Panel zasobów
                  <LayoutDashboard size={18} />
                </button>
                {onLogout && (
                  <button
                    onClick={() => {
                      onLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full px-6 py-3 rounded-lg font-semibold transition-all shadow-md flex items-center justify-center gap-2 ${showScrolledStyle
                      ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30'
                      : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                  >
                    Wyloguj się
                    <LogOut size={18} />
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    onBrowseAsGuest();
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full px-6 py-3 rounded-lg font-semibold transition-all shadow-md flex items-center justify-center gap-2 ${showScrolledStyle
                    ? 'bg-gray-800 text-white hover:bg-gray-900 dark:bg-slate-700 dark:hover:bg-slate-600'
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
                  className={`w-full px-6 py-3 rounded-lg font-semibold transition-all shadow-md flex items-center justify-center gap-2 ${showScrolledStyle
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
