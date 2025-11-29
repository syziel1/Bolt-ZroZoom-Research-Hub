import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Bot, Play, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export function AutoSeedManager() {
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [totalAiResources, setTotalAiResources] = useState<number | null>(null);
    const [botProfile, setBotProfile] = useState<any>(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            console.log('📊 [AutoSeed] Pobieranie statystyk bota...');
            // Use the secure Edge Function to get stats, bypassing RLS issues
            const { data, error } = await supabase.functions.invoke('get-users-stats');

            if (error) throw error;

            if (data.stats) {
                const botStat = data.stats.find((s: any) => s.nick === 'AI Bot' || s.name === 'AI Bot');
                if (botStat) {
                    console.log(`✅ [AutoSeed] Znaleziono profil bota: ${botStat.nick} (${botStat.resource_count} zasobów)`);
                    setTotalAiResources(botStat.resource_count);
                    setBotProfile(botStat);
                } else {
                    console.warn('⚠️ [AutoSeed] Nie znaleziono profilu bota w statystykach');
                    setTotalAiResources(0);
                    setBotProfile(null);
                }
            }
        } catch (error) {
            console.error('❌ [AutoSeed] Błąd podczas pobierania statystyk:', error);
            // Don't block rendering if stats fail to load
            setTotalAiResources(null);
        }
    };

    const handleAutoSeed = async () => {
        console.log('🤖 [AutoSeed] Uruchamianie bota...');
        console.log('📋 [AutoSeed] Parametry: limit=3 tematów');

        setLoading(true);
        setError(null);
        setResults([]);

        try {
            console.log('🔄 [AutoSeed] Wysyłanie żądania do Edge Function...');
            const startTime = Date.now();

            const { data, error } = await supabase.functions.invoke('seed-wikipedia', {
                body: { limit: 3 } // Fetch 3 topics per run
            });

            const duration = ((Date.now() - startTime) / 1000).toFixed(1);
            console.log(`⏱️ [AutoSeed] Odpowiedź otrzymana po ${duration}s`);

            if (error) {
                console.error('❌ [AutoSeed] Błąd Edge Function:', error);
                throw error;
            }

            console.log('📦 [AutoSeed] Otrzymane dane:', data);

            if (data.results) {
                console.log(`✅ [AutoSeed] Przetworzono ${data.results.length} wyników:`);
                data.results.forEach((result: any, index: number) => {
                    const emoji = result.status === 'added' ? '✅' : '⚠️';
                    console.log(`  ${emoji} [${index + 1}] ${result.topic} - ${result.title || 'brak tytułu'} (${result.status})`);
                    if (result.details) {
                        console.log(`      ℹ️ Szczegóły: ${result.details}`);
                    }
                });

                setResults(data.results);

                console.log('🔄 [AutoSeed] Odświeżanie statystyk...');
                fetchStats(); // Refresh stats after run
                console.log('✅ [AutoSeed] Zakończono pomyślnie');
            } else if (data.error) {
                console.error('❌ [AutoSeed] Błąd zwrócony przez backend:', data.error);
                throw new Error(data.error);
            } else {
                console.warn('⚠️ [AutoSeed] Brak wyników w odpowiedzi');
            }
        } catch (err: any) {
            console.error('💥 [AutoSeed] Nieoczekiwany błąd:', err);
            console.error('📋 [AutoSeed] Stack trace:', err.stack);
            setError(err.message || 'Wystąpił błąd podczas automatycznego dodawania zasobów.');
        } finally {
            setLoading(false);
            console.log('🏁 [AutoSeed] Zakończono działanie bota');
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <Bot className="text-blue-600 dark:text-blue-400" />
                            Automatyczne dodawanie zasobów
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Uruchom bota, który przeszuka Wikipedię pod kątem brakujących tematów, zweryfikuje treści z AI i doda je do bazy.
                        </p>
                        {totalAiResources !== null && (
                            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                                <Bot size={14} />
                                Zasoby dodane przez AI: {totalAiResources}
                            </div>
                        )}

                        {botProfile && (
                            <div className="mt-4 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg flex items-center gap-3 border border-gray-100 dark:border-slate-600">
                                <img
                                    src={botProfile.avatar_url || `https://ui-avatars.com/api/?name=${botProfile.nick}&background=random`}
                                    alt={botProfile.nick}
                                    className="w-10 h-10 rounded-full bg-white"
                                />
                                <div>
                                    <div className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                        {botProfile.nick}
                                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                                            {botProfile.role === 'admin' ? 'Administrator' : 'Bot'}
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {botProfile.name} • {botProfile.email}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleAutoSeed}
                        disabled={loading}
                        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Play size={20} />}
                        {loading ? 'Pracuję...' : 'Uruchom Bota'}
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg flex items-center gap-2 mb-4">
                        <AlertCircle size={20} />
                        {error}
                    </div>
                )}

                {results.length > 0 ? (
                    <div className="space-y-4">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">Wyniki operacji:</h3>
                        <div className="space-y-2">
                            {results.map((result, index) => (
                                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-100 dark:border-slate-700">
                                    {result.status === 'added' ? (
                                        <CheckCircle size={18} className="text-green-500" />
                                    ) : (
                                        <AlertCircle size={18} className="text-yellow-500" />
                                    )}
                                    <div className="flex-1">
                                        <span className="font-medium text-gray-900 dark:text-gray-100">{result.topic}</span>
                                        {result.title && (
                                            <span className="text-gray-600 dark:text-gray-400"> - {result.title}</span>
                                        )}
                                    </div>
                                    <span className={`text-sm px-2 py-1 rounded-full ${result.status === 'added'
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                        }`}>
                                        {result.status === 'added' && 'Dodano'}
                                        {result.status === 'skipped_duplicate' && 'Duplikat'}
                                        {result.status === 'skipped_low_quality' && 'Niska jakość (AI)'}
                                        {result.status === 'skipped_ai_error' && 'Błąd AI'}
                                        {result.status === 'no_wiki_results' && 'Brak wyników'}
                                        {result.status === 'error_insert' && 'Błąd zapisu'}
                                    </span>
                                    {result.details && (
                                        <span className="text-xs text-red-500 dark:text-red-400 ml-2">
                                            ({result.details})
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    !loading && results.length === 0 && (
                        <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                            Brak nowych zasobów do dodania.
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
