import { useState, useEffect } from 'react';
import { X, Search, Loader, Plus, Play } from 'lucide-react';
import { supabase } from '../lib/supabase';

type YouTubeVideo = {
    youtubeId: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    channelTitle: string;
    duration: string;
    url: string;
};

type YouTubeSearchModalProps = {
    isOpen: boolean;
    onClose: () => void;
    initialQuery: string;
    onAddVideo: (video: YouTubeVideo) => void;
    isGuestMode?: boolean;
};

export function YouTubeSearchModal({ isOpen, onClose, initialQuery, onAddVideo, isGuestMode = false }: YouTubeSearchModalProps) {
    const [query, setQuery] = useState(initialQuery);
    const [results, setResults] = useState<YouTubeVideo[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [hasSearched, setHasSearched] = useState(false);

    useEffect(() => {
        if (isOpen && initialQuery) {
            setQuery(initialQuery);
            handleSearch(initialQuery);
        } else if (isOpen) {
            // Focus input if no query
        } else {
            // Reset state on close
            setResults([]);
            setHasSearched(false);
            setError('');
        }
    }, [isOpen, initialQuery]);

    const handleSearch = async (searchQuery: string) => {
        if (!searchQuery.trim()) return;

        setLoading(true);
        setError('');
        setHasSearched(true);

        try {
            const { data, error } = await supabase.functions.invoke('search-youtube', {
                body: { query: searchQuery },
            });

            if (error) throw error;
            if (data.error) throw new Error(data.error);

            setResults(data.results || []);
        } catch (err: any) {
            console.error('YouTube search error:', err);
            setError(err.message || 'Wystąpił błąd podczas wyszukiwania.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSearch(query);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col shadow-xl border border-gray-200 dark:border-slate-700">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <Play className="text-red-600 fill-current" />
                        Szukaj wideo na YouTube
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <X size={24} />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="p-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900">
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Wpisz frazę wyszukiwania..."
                                className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                                autoFocus
                            />
                            {query && (
                                <button
                                    type="button"
                                    onClick={() => setQuery('')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 disabled:bg-red-400 font-medium transition-colors"
                        >
                            {loading ? 'Szukam...' : 'Szukaj'}
                        </button>
                    </form>
                </div>

                {/* Results */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-slate-900">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                            <Loader className="animate-spin mb-2" size={32} />
                            <p>Przeszukiwanie YouTube...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800">
                            <p className="font-medium">{error}</p>
                        </div>
                    ) : results.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {results.map((video) => (
                                <div key={video.youtubeId} className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                                    <div className="relative aspect-video bg-gray-100 dark:bg-slate-700">
                                        <img
                                            src={video.thumbnailUrl}
                                            alt={video.title}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-1.5 py-0.5 rounded">
                                            {video.duration}
                                        </div>
                                    </div>
                                    <div className="p-3 flex-1 flex flex-col">
                                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 mb-1" title={video.title}>
                                            {video.title}
                                        </h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{video.channelTitle}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3 flex-1">
                                            {video.description}
                                        </p>
                                        <button
                                            onClick={() => !isGuestMode && onAddVideo(video)}
                                            disabled={isGuestMode}
                                            className={`w-full mt-auto py-2 rounded-md flex items-center justify-center gap-2 font-medium transition-colors border
                                                ${isGuestMode
                                                    ? 'bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-slate-600 cursor-not-allowed'
                                                    : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 border-blue-200 dark:border-blue-800'
                                                }`}
                                        >
                                            {isGuestMode ? (
                                                'Zaloguj się, by dodać do Bazy'
                                            ) : (
                                                <>
                                                    <Plus size={18} />
                                                    Dodaj do Bazy
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : hasSearched ? (
                        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                            Nie znaleziono filmów dla frazy "{query}"
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                            Wpisz frazę i kliknij Szukaj, aby znaleźć filmy
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
