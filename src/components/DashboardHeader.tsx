import { Menu, ArrowLeft, LogOut, Settings, Plus, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type DashboardHeaderProps = {
    isGuestMode: boolean;
    userNick: string;
    userName: string;
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
    userNick,
    userName,
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
    const isAdmin = userRole === 'admin';

    return (
        <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <button
                        onClick={onOpenSidebar}
                        className="md:hidden mr-4 text-gray-600 hover:text-gray-900"
                    >
                        <Menu size={24} />
                    </button>
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Szkoła Przyszłości z AI</h1>
                        <p className="text-xs md:text-sm text-gray-600 mt-1 hidden sm:block">
                            Odkrywaj i dziel się zasobami edukacyjnymi
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 md:gap-4">
                    {isGuestMode ? (
                        <>
                            <button
                                onClick={() => navigate('/')}
                                className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
                                title="Powrót do strony głównej"
                            >
                                <ArrowLeft size={20} />
                                <span className="hidden lg:inline">Powrót</span>
                            </button>
                            <button
                                onClick={() => navigate('/auth')}
                                className="bg-blue-600 text-white px-3 py-2 md:px-4 md:py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
                            >
                                <span>Zaloguj się</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="flex flex-col items-end mr-4 hidden md:flex">
                                <span className="text-lg font-bold text-gray-800">
                                    Witaj, {userName ? userName.split(' ')[0] : userNick}
                                </span>
                                <span className="text-xs font-medium text-blue-600">
                                    {(() => {
                                        const date = new Date();
                                        const day = date.getDay();
                                        const hour = date.getHours();

                                        if (day === 0 || day === 6) return "Nie zapominaj o nauce! 🏖️";
                                        if (hour >= 5 && hour < 12) return "Czas się uczyć! 🌅";
                                        if (hour >= 12 && hour < 18) return "Już bez pauzy! ☀️";
                                        return "Ostatnia szansa na dzisiaj 🌙";
                                    })()}
                                </span>
                            </div>
                            {isAdmin && (
                                <button
                                    onClick={onOpenAdmin}
                                    className="bg-purple-600 text-white px-3 py-2 md:px-4 md:py-2 rounded-md hover:bg-purple-700 flex items-center gap-2"
                                    title="Panel Administracyjny"
                                >
                                    <Settings size={20} />
                                    <span className="hidden lg:inline">Panel Admina</span>
                                </button>
                            )}
                            {!isGuestMode && onFavoritesToggle && (
                                <button
                                    onClick={onFavoritesToggle}
                                    className={`px-3 py-2 md:px-4 md:py-2 rounded-md flex items-center gap-2 font-medium transition-all ${showOnlyFavorites
                                        ? 'bg-red-500 text-white hover:bg-red-600'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    title={showOnlyFavorites ? 'Pokaż wszystkie zasoby' : 'Pokaż tylko ulubione'}
                                >
                                    <Heart
                                        size={20}
                                        className={showOnlyFavorites ? 'fill-current' : ''}
                                    />
                                    <span className="hidden lg:inline">
                                        {showOnlyFavorites ? 'Ulubione' : 'Pokaż ulubione'}
                                    </span>
                                    {favoritesCount > 0 && (
                                        <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-bold">
                                            {favoritesCount}
                                        </span>
                                    )}
                                </button>
                            )}
                            <button
                                onClick={onOpenAddResource}
                                className="bg-blue-600 text-white px-3 py-2 md:px-4 md:py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
                                title="Dodaj zasób"
                            >
                                <Plus size={20} />
                                <span className="hidden sm:inline">Dodaj zasób</span>
                            </button>
                            <button
                                onClick={onSignOut}
                                className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
                                title="Wyloguj się"
                            >
                                <LogOut size={20} />
                                <span className="hidden lg:inline">Wyloguj się</span>
                            </button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
