import { useState, useEffect } from 'react';
import { Plus, BookOpen } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { SearchModal, SearchResultEmpty } from './shared/SearchModal';

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
        } catch (err: unknown) {
            console.error('Wikipedia search error:', err);
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
            title="Szukaj w Wikipedii"
            titleIcon={<BookOpen className="text-gray-700 dark:text-gray-300 fill-current" />}
            query={query}
            onQueryChange={setQuery}
            onSubmit={handleSubmit}
            loading={loading}
            error={error}
            hasSearched={hasSearched}
            loadingMessage="Przeszukiwanie Wikipedii..."
            noSearchMessage="Wpisz frazę i kliknij Szukaj, aby znaleźć artykuły"
        >
            {results.length > 0 ? (
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
            ) : (
                <SearchResultEmpty message={`Nie znaleziono artykułów dla frazy "${query}"`} />
            )}
        </SearchModal>
    );
}
