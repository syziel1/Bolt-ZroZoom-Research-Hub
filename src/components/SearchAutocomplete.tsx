import { useState, useRef, useEffect } from 'react';
import { Resource } from '../lib/supabase';
import { blogPosts } from '../content/blog/posts';

type SearchAutocompleteProps = {
    resources: Resource[];
    searchQuery: string;
    onSelectSuggestion: (suggestion: string) => void;
};

export function SearchAutocomplete({ resources, searchQuery, onSelectSuggestion }: SearchAutocompleteProps) {
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Generate suggestions based on search query
    const suggestions = searchQuery.length >= 2
        ? [
            ...resources
                .filter(resource =>
                    resource.title.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map(resource => resource.title),
            ...blogPosts
                .filter(post =>
                    post.title.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map(post => post.title)
        ].slice(0, 5) // Limit to 5 suggestions
        : [];

    // Remove duplicates
    const uniqueSuggestions = Array.from(new Set(suggestions));

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (uniqueSuggestions.length === 0) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev < uniqueSuggestions.length - 1 ? prev + 1 : prev
                );
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
            } else if (e.key === 'Enter' && selectedIndex >= 0) {
                e.preventDefault();
                onSelectSuggestion(uniqueSuggestions[selectedIndex]);
                setSelectedIndex(-1);
            } else if (e.key === 'Escape') {
                setSelectedIndex(-1);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [uniqueSuggestions, selectedIndex, onSelectSuggestion]);

    // Reset selected index when suggestions change
    useEffect(() => {
        setSelectedIndex(-1);
    }, [searchQuery]);

    if (uniqueSuggestions.length === 0) {
        return null;
    }

    return (
        <div
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
        >
            {uniqueSuggestions.map((suggestion, index) => (
                <button
                    key={index}
                    type="button"
                    onClick={() => {
                        onSelectSuggestion(suggestion);
                        setSelectedIndex(-1);
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 ${index === selectedIndex ? 'bg-blue-50' : ''
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <span className="text-gray-400">🔍</span>
                        <span className="text-sm text-gray-900 truncate">{suggestion}</span>
                    </div>
                </button>
            ))}
        </div>
    );
}
