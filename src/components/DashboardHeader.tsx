import { Menu, LogOut, Settings, Plus, Heart, BookOpen, Sparkles, HelpCircle } from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSwitcher } from './LanguageSwitcher';

type DashboardHeaderProps = {
    isGuestMode: boolean;
    userRole: string;
    onOpenSidebar: () => void;
    onSignOut: () => void;
    onOpenAdmin: () => void;
    onOpenAddResource: () => void;
    showOnlyFavorites?: boolean;
    onFavoritesToggle?: () => void;
    favoritesCount?: number;
};

export function DashboardHeader({
    isGuestMode,
    userRole,
    onOpenSidebar,
    onSignOut,
    onOpenAdmin,
    onOpenAddResource,
    showOnlyFavorites = false,
    onFavoritesToggle,
    favoritesCount = 0
}: DashboardHeaderProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const isAdmin = userRole === 'admin';

    // Determine help link based on current path
    const helpLink = location.pathname === '/zasoby' ? '/pomoc/dashboard' : '/pomoc/guide';

    return (
        <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-4 md:px-8 py-4">
            <div className="flex items-center justify-between h-16">
                <div className="flex items-center shrink-0">
                    <button
                        onClick={onOpenSidebar}
                        aria-label="Otwórz menu"
                        className="md:hidden mr-4 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        <Menu size={24} />
                    </button>
                    <div>
                        <Link to="/" className="group inline-flex items-center">
                            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                Szkoła Przyszłości z AI
                                <Sparkles className="w-4 h-4 text-blue-500 ml-0.5 -mt-4 animate-pulse" />
                            </h1>
                        </Link>
                        {!isGuestMode && (
                            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1 hidden sm:block">
                                Odkrywaj i dziel się zasobami edukacyjnymi
                            </p>
                        )}
                    </div>
                </div>

                {isGuestMode && (
                    <div className="hidden lg:flex flex-col items-center text-center mx-4 flex-1">
                        <span className="font-semibold text-blue-900 dark:text-blue-100 text-sm">Przeglądasz jako gość</span>
                        <span className="text-xs text-blue-700 dark:text-blue-300 max-w-xl truncate">
                            Zaloguj się, aby dodawać własne materiały, oceniać zasoby i mieć dostęp do dodatkowych funkcji.
                        </span>
                    </div>
                )}

                <div className="flex items-center gap-2 md:gap-4 shrink-0">
                    {isGuestMode ? (
                        <>
                            <LanguageSwitcher />
                            <button
                                onClick={() => navigate('/auth')}
                                className="bg-blue-600 text-white px-3 py-2 md:px-4 md:py-2 rounded-md hover:bg-blue-700 flex items-center gap-2 shadow-sm"
                            >
                                <span>Zaloguj się</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <LanguageSwitcher />
                            <ThemeToggle />
                            {isAdmin && (
                                <button
                                    onClick={onOpenAdmin}
                                    className="bg-purple-600 text-white px-3 py-2 md:px-4 md:py-2 rounded-md hover:bg-purple-700 flex items-center gap-2"
                                    title="Panel Administracyjny"
                                >
                                    <Settings size={20} />
                                    <span className="hidden xl:inline">Panel Admina</span>
                                </button>
                            )}
                            {!isGuestMode && onFavoritesToggle && (
                                <button
                                    onClick={onFavoritesToggle}
                                    className={`px-3 py-2 md:px-4 md:py-2 rounded-md flex items-center gap-2 font-medium transition-all ${showOnlyFavorites
                                        ? 'bg-red-500 text-white hover:bg-red-600'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-200 dark:hover:bg-slate-600'
                                        }`}
                                    title={showOnlyFavorites ? 'Pokaż wszystkie zasoby' : 'Pokaż tylko ulubione'}
                                >
                                    <Heart
                                        size={20}
                                        className={showOnlyFavorites ? 'fill-current' : ''}
                                    />
                                    <span className="hidden xl:inline">
                                        {showOnlyFavorites ? 'Ulubione' : 'Pokaż'}
                                    </span>
                                    {favoritesCount > 0 && (
                                        <span>
                                            {favoritesCount}
                                        </span>
                                    )}
                                </button>
                            )}
                            <button
                                onClick={() => navigate('/blog')}
                                className="bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-gray-200 px-3 py-2 md:px-4 md:py-2 rounded-md hover:bg-gray-200 dark:hover:bg-slate-600 flex items-center gap-2"
                                title="Blog Edukacyjny"
                            >
                                <BookOpen size={20} />
                                <span className="hidden xl:inline">Blog</span>
                            </button>
                            <button
                                onClick={() => navigate(helpLink)}
                                className="bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-gray-200 px-3 py-2 md:px-4 md:py-2 rounded-md hover:bg-gray-200 dark:hover:bg-slate-600 flex items-center gap-2"
                                title="Pomoc"
                            >
                                <HelpCircle size={20} />
                                <span className="hidden xl:inline">Pomoc</span>
                            </button>
                            <button
                                onClick={onOpenAddResource}
                                className="bg-blue-600 text-white px-3 py-2 md:px-4 md:py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
                                title="Dodaj zasób"
                            >
                                <Plus size={20} />
                                <span className="hidden xl:inline">Dodaj zasób</span>
                            </button>
                            <button
                                onClick={onSignOut}
                                className="bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-gray-200 px-3 py-2 md:px-4 md:py-2 rounded-md hover:bg-gray-200 dark:hover:bg-slate-600 flex items-center gap-2"
                                title="Wyloguj się"
                            >
                                <LogOut size={20} />
                                <span className="hidden xl:inline">Wyloguj się</span>
                            </button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
