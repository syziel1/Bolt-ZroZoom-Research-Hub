import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const FAVORITES_STORAGE_KEY = 'user_favorites_cache';

/**
 * Custom hook for managing user favorites
 * Features:
 * - Database-backed storage (persistent across devices)
 * - localStorage cache for instant UI feedback
 * - Optimistic updates
 * - Automatic synchronization
 */
export function useFavorites() {
    const [favorites, setFavorites] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);

    // Load favorites from database and cache
    useEffect(() => {
        const loadFavorites = async () => {
            try {
                // Check if user is logged in
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    setUserId(null);
                    setFavorites(new Set());
                    setIsLoading(false);
                    return;
                }

                setUserId(user.id);

                // Load from localStorage first (instant feedback)
                const cached = localStorage.getItem(FAVORITES_STORAGE_KEY);
                if (cached) {
                    try {
                        const cachedFavorites = JSON.parse(cached);
                        if (Array.isArray(cachedFavorites)) {
                            setFavorites(new Set(cachedFavorites));
                        }
                    } catch (error) {
                        console.error('Error parsing cached favorites:', error);
                    }
                }

                // Then sync with database (source of truth)
                const { data, error } = await supabase
                    .from('user_favorites')
                    .select('resource_id')
                    .eq('user_id', user.id);

                if (error) {
                    console.error('Error loading favorites:', error);
                } else if (data) {
                    const favoriteIds = new Set(data.map(f => f.resource_id));
                    setFavorites(favoriteIds);

                    // Update cache
                    localStorage.setItem(
                        FAVORITES_STORAGE_KEY,
                        JSON.stringify(Array.from(favoriteIds))
                    );
                }
            } catch (error) {
                console.error('Error in loadFavorites:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadFavorites();
    }, []);

    // Toggle favorite status
    const toggleFavorite = useCallback(async (resourceId: string) => {
        if (!userId) {
            console.warn('User not logged in - cannot toggle favorite');
            return;
        }

        const isFavorite = favorites.has(resourceId);

        // Optimistic update (instant UI feedback)
        const newFavorites = new Set(favorites);
        if (isFavorite) {
            newFavorites.delete(resourceId);
        } else {
            newFavorites.add(resourceId);
        }
        setFavorites(newFavorites);

        // Update cache
        localStorage.setItem(
            FAVORITES_STORAGE_KEY,
            JSON.stringify(Array.from(newFavorites))
        );

        try {
            if (isFavorite) {
                // Remove from database
                const { error } = await supabase
                    .from('user_favorites')
                    .delete()
                    .eq('user_id', userId)
                    .eq('resource_id', resourceId);

                if (error) throw error;
            } else {
                // Add to database
                const { error } = await supabase
                    .from('user_favorites')
                    .insert({
                        user_id: userId,
                        resource_id: resourceId,
                    });

                if (error) throw error;
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);

            // Rollback on error
            setFavorites(favorites);
            localStorage.setItem(
                FAVORITES_STORAGE_KEY,
                JSON.stringify(Array.from(favorites))
            );
        }
    }, [userId, favorites]);

    // Check if resource is favorite
    const isFavorite = useCallback((resourceId: string): boolean => {
        return favorites.has(resourceId);
    }, [favorites]);

    // Clear cache (useful for logout)
    const clearCache = useCallback(() => {
        localStorage.removeItem(FAVORITES_STORAGE_KEY);
        setFavorites(new Set());
    }, []);

    return {
        favorites,
        isLoading,
        isLoggedIn: !!userId,
        toggleFavorite,
        isFavorite,
        clearCache,
        favoritesCount: favorites.size,
    };
}
