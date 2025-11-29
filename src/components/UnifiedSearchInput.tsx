import { useRef, useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { SearchAutocomplete } from './SearchAutocomplete';

type UnifiedSearchInputProps = {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    onSearch?: () => void;
    items: { id: string; title: string }[];
    onItemSelect?: (item: { id: string; title: string }) => void;
    placeholder?: string;
    className?: string;
    inputClassName?: string;
    searchIconClassName?: string;
    clearButtonClassName?: string;
    showSearchButton?: boolean;
    searchButtonClassName?: string;
    searchButtonContent?: React.ReactNode;
};

export function UnifiedSearchInput({
    searchQuery,
    setSearchQuery,
    onSearch,
    items,
    onItemSelect,
    placeholder = "Szukaj...",
    className = "",
    inputClassName = "",
    searchIconClassName = "text-gray-400",
    clearButtonClassName = "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200",
    showSearchButton = false,
    searchButtonClassName = "",
    searchButtonContent = "Szukaj"
}: UnifiedSearchInputProps) {
    const [showAutocomplete, setShowAutocomplete] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    // Close autocomplete when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowAutocomplete(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (onSearch) {
            onSearch();
        }
        setShowAutocomplete(false);
    };

    return (
        <div ref={searchRef} className={`relative ${className}`}>
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${searchIconClassName}`} size={18} />
            <input
                type="text"
                placeholder={placeholder}
                aria-label={placeholder}
                value={searchQuery}
                onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowAutocomplete(true);
                }}
                onFocus={() => setShowAutocomplete(true)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        handleSubmit();
                    }
                }}
                className={`w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 ${inputClassName}`}
            />
            {searchQuery && (
                <button
                    type="button"
                    onClick={() => {
                        setSearchQuery('');
                        setShowAutocomplete(false);
                    }}
                    aria-label="Wyczyść wyszukiwanie"
                    className={`absolute top-1/2 transform -translate-y-1/2 ${clearButtonClassName} ${showSearchButton ? 'right-24' : 'right-3'}`}
                >
                    <X size={16} />
                </button>
            )}

            {showSearchButton && (
                <button
                    type="button"
                    onClick={() => handleSubmit()}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 ${searchButtonClassName}`}
                >
                    {searchButtonContent}
                </button>
            )}

            {showAutocomplete && (
                <SearchAutocomplete
                    items={items}
                    searchQuery={searchQuery}
                    onSelectSuggestion={(suggestion) => {
                        // Find the full item by title
                        const selectedItem = items.find(item => item.title === suggestion);
                        if (selectedItem && onItemSelect) {
                            onItemSelect(selectedItem);
                        } else {
                            // Fallback: just set the search query if no onItemSelect handler
                            setSearchQuery(suggestion);
                        }
                        setShowAutocomplete(false);
                    }}
                />
            )}
        </div>
    );
}
