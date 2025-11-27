import { useState, useEffect } from 'react';
import { X, Search, Loader, Plus, BookOpen } from 'lucide-react';
import { supabase } from '../lib/supabase';

type WikipediaArticle = {
    pageId: number;
    title: string;
    description: string;
    thumbnailUrl: string | null;
    url: string;
};

type WikipediaSearchModalProps = {
    isOpen: boolean;
    onClose: () => void;
    initialQuery: string;
    onAddArticle: (article: WikipediaArticle) => void;
    isGuestMode?: boolean;
};

export function WikipediaSearchModal({ isOpen, onClose, initialQuery, onAddArticle, isGuestMode = false }: WikipediaSearchModalProps) {
    const [query, setQuery] = useState(initialQuery);
    const [results, setResults] = useState<WikipediaArticle[]>([]);
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
            const { data, error } = await supabase.functions.invoke('search-wikipedia', {
                body: { query: searchQuery },
            });

            if (error) throw error;
            if (data.error) throw new Error(data.error);

            setResults(data.results || []);
        } catch (err: any) {
            console.error('Wikipedia search error:', err);
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
                        <BookOpen className="text-gray-700 dark:text-gray-300 fill-current" />
                        Szukaj w Wikipedii
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
                                className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
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
                            className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-900 disabled:bg-gray-400 font-medium transition-colors dark:bg-slate-700 dark:hover:bg-slate-600"
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
                            <p>Przeszukiwanie Wikipedii...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800">
                            <p className="font-medium">{error}</p>
                        </div>
                    ) : results.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                            {results.map((article) => (
                                <div key={article.pageId} className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow flex flex-row h-40">
                                    {article.thumbnailUrl ? (
                                        <div className="w-40 h-full bg-gray-100 dark:bg-slate-700 flex-shrink-0">
                                            <img
                                                src={article.thumbnailUrl}
                                                alt={article.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-40 h-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0 text-gray-400 dark:text-gray-500">
                                            <BookOpen size={32} />
                                        </div>
                                    )}
                                    <div className="p-4 flex-1 flex flex-col">
                                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 text-lg">
                                            <a href={article.url} target="_blank" rel="noopener noreferrer" className="hover:underline decoration-gray-400">
                                                {article.title}
                                            </a>
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 mb-3 flex-1">
                                            {article.description}
                                        </p>
                                        <div className="flex justify-end">
                                            <button
                                                onClick={() => !isGuestMode && onAddArticle(article)}
                                                disabled={isGuestMode}
                                                className={`px-4 py-2 rounded-md flex items-center justify-center gap-2 font-medium transition-colors border text-sm
                                                    ${isGuestMode
                                                        ? 'bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-slate-600 cursor-not-allowed'
                                                        : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 border-blue-200 dark:border-blue-800'
                                                    }`}
                                            >
                                                {isGuestMode ? (
                                                    'Zaloguj się, by dodać'
                                                ) : (
                                                    <>
                                                        <Plus size={16} />
                                                        Dodaj do Bazy
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : hasSearched ? (
                        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                            Nie znaleziono artykułów dla frazy "{query}"
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                            Wpisz frazę i kliknij Szukaj, aby znaleźć artykuły
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
