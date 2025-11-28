import { useState, useEffect, useCallback } from 'react';

const RECENT_RESOURCES_KEY = 'recent_resources';
const MAX_RECENT_ITEMS = 12;

export function useRecentResources() {
    const [recentIds, setRecentIds] = useState<string[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem(RECENT_RESOURCES_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    setRecentIds(parsed);
                }
            } catch (e) {
                console.error('Error parsing recent resources:', e);
            }
        }
    }, []);

    const addRecent = useCallback((resourceId: string) => {
        setRecentIds((prev) => {
            const filtered = prev.filter((id) => id !== resourceId);
            const newRecent = [resourceId, ...filtered].slice(0, MAX_RECENT_ITEMS);

            localStorage.setItem(RECENT_RESOURCES_KEY, JSON.stringify(newRecent));
            return newRecent;
        });
    }, []);

    return { recentIds, addRecent };
}
