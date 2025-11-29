import { useState, useRef, useEffect, useMemo } from 'react';

import { blogPosts } from '../content/blog/posts';

type SuggestionItem = {
    title: string;
    type: 'resource' | 'blog';
};

type SearchAutocompleteProps = {
    items: { id?: string; title: string }[];  // id is optional for backwards compatibility with blog posts
    searchQuery: string;
    onSelectSuggestion: (suggestion: string) => void;
};

export function SearchAutocomplete({ items, searchQuery, onSelectSuggestion }: SearchAutocompleteProps) {
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Generate suggestions based on search query with type information
    const suggestions = useMemo((): SuggestionItem[] => {
        if (searchQuery.length < 2) return [];

        const seen = new Set<string>();
        const result: SuggestionItem[] = [];

        // Add resource suggestions
        items.forEach(item => {
            if (item.title.toLowerCase().includes(searchQuery.toLowerCase()) && !seen.has(item.title)) {
                seen.add(item.title);
                result.push({ title: item.title, type: 'resource' });
            }
        });

        // Add blog post suggestions
        blogPosts.forEach(post => {
            if (post.title.toLowerCase().includes(searchQuery.toLowerCase()) && !seen.has(post.title)) {
                seen.add(post.title);
                result.push({ title: post.title, type: 'blog' });
            }
        });

        return result.slice(0, 5); // Limit to 5 suggestions
    }, [searchQuery, items]);

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (suggestions.length === 0) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev < suggestions.length - 1 ? prev + 1 : prev
                );
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
            } else if (e.key === 'Enter') {
                e.preventDefault();
                // If user pressed Enter with a selected suggestion, use it
                // Otherwise, use the first suggestion
                const indexToUse = selectedIndex >= 0 ? selectedIndex : 0;
                onSelectSuggestion(suggestions[indexToUse].title);
                setSelectedIndex(-1);
            } else if (e.key === 'Escape') {
                setSelectedIndex(-1);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [suggestions, selectedIndex, onSelectSuggestion]);

    // Reset selected index when suggestions change
    useEffect(() => {
        setSelectedIndex(-1);
    }, [searchQuery]);

    if (suggestions.length === 0) {
        return null;
    }

    return (
        <div
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
        >
            {suggestions.map((suggestion, index) => (
                <button
                    key={index}
                    type="button"
                    onClick={() => {
                        onSelectSuggestion(suggestion.title);
                        setSelectedIndex(-1);
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 ${index === selectedIndex ? 'bg-blue-50' : ''
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <span className="text-gray-400" title={suggestion.type === 'blog' ? 'Blog Post' : 'Resource'}>
                            {suggestion.type === 'blog' ? '📝' : '📚'}
                        </span>
                        <span className="text-sm text-gray-900 truncate">{suggestion.title}</span>
                        <span className="text-xs text-gray-400 ml-auto shrink-0">
                            {suggestion.type === 'blog' ? 'Blog' : 'Zasób'}
                        </span>
                    </div>
                </button>
            ))}
        </div>
    );
}
