import { useState, useEffect } from 'react';
import { Plus, Play } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { SearchModal, SearchResultEmpty } from './shared/SearchModal';

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
        } catch (err: unknown) {
            console.error('YouTube search error:', err);
            setError((err as Error).message || 'Wystąpił błąd podczas wyszukiwania.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSearch(query);
    };

    return (
        <SearchModal
            isOpen={isOpen}
            onClose={onClose}
            title="Szukaj wideo na YouTube"
            titleIcon={<Play className="text-red-600 fill-current" />}
            query={query}
            onQueryChange={setQuery}
            onSubmit={handleSubmit}
            loading={loading}
            error={error}
            hasSearched={hasSearched}
            loadingMessage="Przeszukiwanie YouTube..."
            noSearchMessage="Wpisz frazę i kliknij Szukaj, aby znaleźć filmy"
            searchButtonColor="bg-red-600 hover:bg-red-700 disabled:bg-red-400"
            inputFocusRingColor="focus:ring-red-500"
        >
            {results.length > 0 ? (
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
            ) : (
                <SearchResultEmpty message={`Nie znaleziono filmów dla frazy "${query}"`} />
            )}
        </SearchModal>
    );
}
