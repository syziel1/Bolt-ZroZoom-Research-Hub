import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Users, Loader2, Shield, User, Calendar } from 'lucide-react';

type UserStat = {
    id: string;
    nick: string;
    name: string;
    email: string;
    role: string;
    avatar_url?: string;
    resource_count: number;
    last_sign_in_at?: string;
    created_at: string;
};

export function UserStatsManager() {
    const [stats, setStats] = useState<UserStat[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const { data, error } = await supabase.functions.invoke('get-users-stats');

            if (error) throw error;

            if (data.stats) {
                setStats(data.stats);
            }
        } catch (err: any) {
            console.error('Error fetching user stats:', err);
            setError('Nie udało się pobrać statystyk użytkowników.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center p-12">
                <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <Users className="text-blue-600 dark:text-blue-400" />
                            Użytkownicy i Aktywność
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Przegląd użytkowników, ich ról oraz liczby dodanych zasobów.
                        </p>
                    </div>
                    <div className="text-sm text-gray-500">
                        Łącznie użytkowników: {stats.length}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-slate-700/50 text-gray-600 dark:text-gray-400 font-medium border-b border-gray-100 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-4">Użytkownik</th>
                                <th className="px-6 py-4">Rola</th>
                                <th className="px-6 py-4 text-center">Zasoby</th>
                                <th className="px-6 py-4">Dołączył</th>
                                <th className="px-6 py-4">Ostatnia aktywność</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                            {stats.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {user.avatar_url ? (
                                                <img
                                                    src={user.avatar_url}
                                                    alt={user.nick}
                                                    className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-slate-600"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                                    <User size={20} />
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-gray-100">
                                                    {user.nick}
                                                    {user.name !== user.nick && user.name !== 'N/A' && (
                                                        <span className="text-gray-500 dark:text-gray-400 font-normal ml-1">
                                                            ({user.name})
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {user.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'admin'
                                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                                : 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-gray-400'
                                            }`}>
                                            {user.role === 'admin' && <Shield size={12} />}
                                            {user.role === 'admin' ? 'Administrator' : 'Użytkownik'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${user.resource_count > 0
                                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                                                : 'text-gray-400 bg-gray-50 dark:bg-slate-800'
                                            }`}>
                                            {user.resource_count}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} />
                                            {new Date(user.created_at).toLocaleDateString('pl-PL')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-xs">
                                        {user.last_sign_in_at ? (
                                            new Date(user.last_sign_in_at).toLocaleString('pl-PL')
                                        ) : (
                                            'Brak danych'
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
