import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Bot, Play, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

type BotTab = 'wikipedia';

export function AutoSeedManager() {
    const [activeBot, setActiveBot] = useState<BotTab>('wikipedia');
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
            const { data, error } = await supabase.functions.invoke('get-users-stats');

            if (error) throw error;

            if (data.stats) {
                const botStat = data.stats.find((s: any) =>
                    s.nick === 'Wikipedia Search AI Bot' || s.name === 'Wikipedia Search AI Bot'
                );
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
            setTotalAiResources(null);
        }
    };

    const handleAutoSeed = async () => {
        console.log('🤖 [AutoSeed] Uruchamianie bota Wikipedia Search...');
        console.log('📋 [AutoSeed] Parametry: limit=3 tematy');
        console.log('⏳ [AutoSeed] Uwaga: Bot przetwarza artykuły z opóźnieniami, aby uniknąć limitów API.');

        setLoading(true);
        setError(null);
        setResults([]);

        let progressInterval: NodeJS.Timeout | null = null;
        let elapsedSeconds = 0;

        try {
            console.log('🔄 [AutoSeed] Wysyłanie żądania do Edge Function...');
            const startTime = Date.now();

            // Progress logging every 10 seconds
            progressInterval = setInterval(() => {
                elapsedSeconds += 10;
                console.log(`⏳ [AutoSeed] Bot nadal pracuje... (${elapsedSeconds}s)`);
                if (elapsedSeconds === 30) {
                    console.log('ℹ️ [AutoSeed] Bot analizuje artykuły z pomocą AI. Proszę czekać...');
                }
            }, 10000);

            const { data, error } = await supabase.functions.invoke('seed-wikipedia', {
                body: { limit: 3 } // 3 topics per run
            });

            if (progressInterval) {
                clearInterval(progressInterval);
            }

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
                fetchStats();
                console.log('✅ [AutoSeed] Zakończono pomyślnie');
            } else if (data.error) {
                console.error('❌ [AutoSeed] Błąd zwrócony przez backend:', data.error);
                throw new Error(data.error);
            } else {
                console.warn('⚠️ [AutoSeed] Brak wyników w odpowiedzi');
            }
        } catch (err: any) {
            if (progressInterval) {
                clearInterval(progressInterval);
            }

            console.error('💥 [AutoSeed] Nieoczekiwany błąd:', err);
            console.error('📋 [AutoSeed] Stack trace:', err.stack);
            setError(err.message || 'Wystąpił błąd podczas automatycznego dodawania zasobów.');
        } finally {
            if (progressInterval) {
                clearInterval(progressInterval);
            }

            setLoading(false);
            console.log('🏁 [AutoSeed] Zakończono działanie bota');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Bot className="text-blue-600 dark:text-blue-400" />
                    Automatyczne dodawanie zasobów
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Zarządzaj botami automatycznie dodającymi zasoby edukacyjne do bazy danych.
                </p>
            </div>

            {/* Bot Tabs */}
            <div className="border-b border-gray-200 dark:border-slate-700">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveBot('wikipedia')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeBot === 'wikipedia'
                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                    >
                        Wikipedia Search
                    </button>
                    {/* Future bots will be added here */}
                </nav>
            </div>

            {/* Wikipedia Bot Card */}
            {activeBot === 'wikipedia' && (
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                Wikipedia Search AI Bot
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                                Przeszukuje Wikipedię, weryfikuje treści z AI i dodaje wartościowe zasoby edukacyjne do bazy.
                            </p>

                            {loading && (
                                <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                                    <p className="text-sm text-amber-800 dark:text-amber-200">
                                        ⏳ Bot pracuje... To może potrwać 20-40 sekund. Sprawdź konsolę (F12) dla szczegółów.
                                    </p>
                                </div>
                            )}

                            {botProfile && (
                                <div className="mb-4 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-100 dark:border-slate-600">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={botProfile.avatar_url || `https://ui-avatars.com/api/?name=${botProfile.nick}&background=random`}
                                            alt={botProfile.nick}
                                            className="w-12 h-12 rounded-full bg-white"
                                        />
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                                {botProfile.nick}
                                                <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                                                    Bot
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {botProfile.email}
                                            </div>
                                        </div>
                                        {totalAiResources !== null && (
                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                                    {totalAiResources}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    zasobów
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleAutoSeed}
                            disabled={loading}
                            className="ml-4 flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm"
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

                    {results.length > 0 && (
                        <div className="space-y-4">
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                Wyniki operacji
                                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                                    ({results.length})
                                </span>
                            </h4>
                            <div className="space-y-2">
                                {results.map((result, index) => (
                                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-100 dark:border-slate-700">
                                        {result.status === 'added' ? (
                                            <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
                                        ) : (
                                            <AlertCircle size={18} className="text-yellow-500 flex-shrink-0" />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <span className="font-medium text-gray-900 dark:text-gray-100">{result.topic}</span>
                                            {result.title && (
                                                <span className="text-gray-600 dark:text-gray-400"> - {result.title}</span>
                                            )}
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${result.status === 'added'
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                            }`}>
                                            {result.status === 'added' && 'Dodano'}
                                            {result.status === 'skipped_duplicate' && 'Duplikat'}
                                            {result.status === 'skipped_low_quality' && 'Niska jakość'}
                                            {result.status === 'skipped_ai_error' && 'Błąd AI'}
                                            {result.status === 'no_wiki_results' && 'Brak wyników'}
                                            {result.status === 'error_insert' && 'Błąd zapisu'}
                                        </span>
                                        {result.details && (
                                            <span className="text-xs text-red-500 dark:text-red-400">
                                                ({result.details})
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {!loading && results.length === 0 && (
                        <div className="text-center text-gray-500 dark:text-gray-400 py-8 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-lg">
                            <Bot size={48} className="mx-auto mb-3 opacity-30" />
                            <p>Kliknij "Uruchom Bota", aby rozpocząć automatyczne dodawanie zasobów.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
