import { Menu, ArrowLeft, LogOut, Settings, Plus, Search, Play, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type DashboardHeaderProps = {
    isGuestMode: boolean;
    userNick: string;
    userName: string;
    userRole: string;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    onOpenSidebar: () => void;
    onSignOut: () => void;
    onOpenAdmin: () => void;
    onOpenAddResource: () => void;
    onOpenYouTube: () => void;
};

export function DashboardHeader({
    isGuestMode,
    userNick,
    userName,
    userRole,
    searchQuery,
    setSearchQuery,
    onOpenSidebar,
    onSignOut,
    onOpenAdmin,
    onOpenAddResource,
    onOpenYouTube
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


            <div className="mt-4 max-w-2xl mx-auto flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Szukaj w tytułach i opisach..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
                <button
                    onClick={onOpenYouTube}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2 whitespace-nowrap transition-colors"
                    title="Szukaj wideo na YouTube"
                >
                    <Play size={20} className="fill-current" />
                    <span className="hidden sm:inline">Szukaj wideo</span>
                </button>
            </div>
        </header >
    );
}
