import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { PieChart, Loader2 } from 'lucide-react';

type ResourceStat = {
    type: string;
    count: number;
};

export function ResourceStatsManager() {
    const [stats, setStats] = useState<ResourceStat[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase.rpc('get_resource_stats');

            if (error) throw error;

            if (data) {
                setStats(data);
            }
        } catch (err) {
            console.error('Error fetching resource stats:', err);
            setError('Nie udało się pobrać statystyk.');
        } finally {
            setLoading(false);
        }
    };

    const getTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            youtube: 'YouTube',
            wikipedia: 'Wikipedia',
            article: 'Artykuł',
            website: 'Strona WWW',
            book: 'Książka',
            course: 'Kurs',
            podcast: 'Podcast',
            other: 'Inne'
        };
        return labels[type] || type;
    };

    const getTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            youtube: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
            wikipedia: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
            article: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
            website: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
            book: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
            course: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
            podcast: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
            other: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
        };
        return colors[type] || colors['other'];
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
                {error}
            </div>
        );
    }

    const totalResources = stats.reduce((sum, item) => sum + item.count, 0);

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <PieChart className="text-blue-600 dark:text-blue-400" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                            Statystyki Zasobów
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Łącznie w bazie: <span className="font-semibold text-gray-900 dark:text-gray-100">{totalResources}</span>
                        </p>
                    </div>
                </div>

                <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-slate-700">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                        <thead className="bg-gray-50 dark:bg-slate-900/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Typ Zasobu
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Liczba
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Procent
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                            {stats.map((stat) => (
                                <tr key={stat.type} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(stat.type)}`}>
                                            {getTypeLabel(stat.type)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 font-medium">
                                        {stat.count}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {totalResources > 0 ? Math.round((stat.count / totalResources) * 100) : 0}%
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
