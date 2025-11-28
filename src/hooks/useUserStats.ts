import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export type UserStats = {
    favorites_count: number;
    ratings_count: number;
    resources_count: number;
};

export function useUserStats() {
    const [stats, setStats] = useState<UserStats>({
        favorites_count: 0,
        ratings_count: 0,
        resources_count: 0,
    });
    const [loading, setLoading] = useState(true);
    const [userNick, setUserNick] = useState('');

    const loadStats = useCallback(async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setLoading(false);
                return;
            }

            // Load user profile for nick
            const { data: profile } = await supabase
                .from('profiles')
                .select('nick')
                .eq('id', user.id)
                .single();

            if (profile) {
                setUserNick(profile.nick);
            } else {
                setUserNick(user.email?.split('@')[0] || 'Użytkownik');
            }

            // Load stats using RPC
            const { data, error } = await supabase
                .rpc('get_user_stats', { user_uuid: user.id });

            if (error) {
                console.error('Error fetching user stats:', error);
            } else if (data) {
                setStats(data as UserStats);
            }
        } catch (error) {
            console.error('Error in loadStats:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadStats();
    }, [loadStats]);

    return { stats, loading, userNick, refreshStats: loadStats };
}
