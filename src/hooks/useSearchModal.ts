import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

type UseSearchModalOptions = {
    isOpen: boolean;
    initialQuery: string;
    searchFunctionName: string;
    errorLogPrefix: string;
};

type UseSearchModalResult<T> = {
    query: string;
    setQuery: React.Dispatch<React.SetStateAction<string>>;
    results: T[];
    loading: boolean;
    error: string;
    hasSearched: boolean;
    handleSubmit: (e: React.FormEvent) => void;
};

/**
 * Custom hook for managing search modal state and behavior
 * Features:
 * - State management for query, results, loading, error, and search status
 * - Automatic search execution on modal open with initial query
 * - State reset on modal close
 * - Supabase function invocation for search
 */
export function useSearchModal<T>({
    isOpen,
    initialQuery,
    searchFunctionName,
    errorLogPrefix,
}: UseSearchModalOptions): UseSearchModalResult<T> {
    const [query, setQuery] = useState(initialQuery);
    const [results, setResults] = useState<T[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = useCallback(async (searchQuery: string) => {
        if (!searchQuery.trim()) return;

        setLoading(true);
        setError('');
        setHasSearched(true);

        try {
            const { data, error } = await supabase.functions.invoke(searchFunctionName, {
                body: { query: searchQuery },
            });

            if (error) throw error;
            if (data.error) throw new Error(data.error);

            setResults(data.results || []);
        } catch (err: unknown) {
            console.error(`${errorLogPrefix} search error:`, err);
            setError((err as Error).message || 'Wystąpił błąd podczas wyszukiwania.');
        } finally {
            setLoading(false);
        }
    }, [searchFunctionName, errorLogPrefix]);

    useEffect(() => {
        if (isOpen && initialQuery) {
            setQuery(initialQuery);
            handleSearch(initialQuery);
        } else if (!isOpen) {
            // Reset state on close
            setResults([]);
            setHasSearched(false);
            setError('');
        }
    }, [isOpen, initialQuery, handleSearch]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSearch(query);
    };

    return {
        query,
        setQuery,
        results,
        loading,
        error,
        hasSearched,
        handleSubmit,
    };
}
