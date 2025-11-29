import { ReactNode } from 'react';
import { X, Search, Loader } from 'lucide-react';

export type SearchModalProps = {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    titleIcon: ReactNode;
    query: string;
    onQueryChange: (query: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    loading: boolean;
    error: string;
    hasSearched: boolean;
    loadingMessage: string;
    noSearchMessage: string;
    searchButtonColor?: string;
    inputFocusRingColor?: string;
    placeholderText?: string;
    searchButtonText?: string;
    searchingButtonText?: string;
    children: ReactNode;
};

export function SearchModal({
    isOpen,
    onClose,
    title,
    titleIcon,
    query,
    onQueryChange,
    onSubmit,
    loading,
    error,
    hasSearched,
    loadingMessage,
    noSearchMessage,
    searchButtonColor = 'bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 dark:bg-slate-700 dark:hover:bg-slate-600',
    inputFocusRingColor = 'focus:ring-gray-500',
    placeholderText = 'Wpisz frazę wyszukiwania...',
    searchButtonText = 'Szukaj',
    searchingButtonText = 'Szukam...',
    children,
}: SearchModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col shadow-xl border border-gray-200 dark:border-slate-700">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        {titleIcon}
                        {title}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <X size={24} />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="p-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900">
                    <form onSubmit={onSubmit} className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => onQueryChange(e.target.value)}
                                placeholder={placeholderText}
                                className={`w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 ${inputFocusRingColor} focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400`}
                                autoFocus
                            />
                            {query && (
                                <button
                                    type="button"
                                    onClick={() => onQueryChange('')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`${searchButtonColor} text-white px-6 py-2 rounded-lg font-medium transition-colors`}
                        >
                            {loading ? searchingButtonText : searchButtonText}
                        </button>
                    </form>
                </div>

                {/* Results */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-slate-900">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                            <Loader className="animate-spin mb-2" size={32} />
                            <p>{loadingMessage}</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800">
                            <p className="font-medium">{error}</p>
                        </div>
                    ) : hasSearched ? (
                        children
                    ) : (
                        <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                            {noSearchMessage}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export type SearchResultEmptyProps = {
    message: string;
};

export function SearchResultEmpty({ message }: SearchResultEmptyProps) {
    return (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            {message}
        </div>
    );
}
