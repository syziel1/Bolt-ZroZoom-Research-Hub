import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, AlertTriangle, MessageSquare, UserCheck, Scale } from 'lucide-react';
import { Footer } from '../components/Footer';

export function TermsOfService() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col">
            <main className="flex-1 max-w-4xl mx-auto px-4 py-8 md:py-12 w-full">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-8 transition-colors"
                >
                    <ArrowLeft size={20} />
                    Wróć
                </button>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
                    <div className="p-8 md:p-12">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                                <Scale size={32} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                    Zasady korzystania z serwisu
                                </h1>
                                <p className="text-gray-500 dark:text-gray-400 mt-1">
                                    Obowiązują od dnia 29.11.2025
                                </p>
                            </div>
                        </div>

                        <div className="prose dark:prose-invert max-w-none">
                            <p className="lead text-lg text-gray-600 dark:text-gray-300 mb-8">
                                Szkoła Przyszłości z AI to społeczność edukacyjna oparta na wzajemnym szacunku i dzieleniu się wiedzą.
                                Aby zapewnić bezpieczne i wartościowe środowisko dla wszystkich użytkowników, wprowadziliśmy poniższe zasady.
                            </p>

                            <div className="grid gap-8 md:grid-cols-2 mb-12">
                                <div className="bg-gray-50 dark:bg-slate-900/50 p-6 rounded-xl border border-gray-100 dark:border-slate-700">
                                    <div className="flex items-center gap-3 mb-4 text-green-600 dark:text-green-400">
                                        <UserCheck size={24} />
                                        <h3 className="text-xl font-semibold m-0">Kultura i Szacunek</h3>
                                    </div>
                                    <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                                        <li>• Odnosimy się do siebie z szacunkiem.</li>
                                        <li>• Nie używamy wulgaryzmów ani mowy nienawiści.</li>
                                        <li>• Konstruktywna krytyka jest mile widziana, hejt jest zabroniony.</li>
                                        <li>• Szanujemy różnorodność poglądów i poziomów wiedzy.</li>
                                    </ul>
                                </div>

                                <div className="bg-gray-50 dark:bg-slate-900/50 p-6 rounded-xl border border-gray-100 dark:border-slate-700">
                                    <div className="flex items-center gap-3 mb-4 text-purple-600 dark:text-purple-400">
                                        <MessageSquare size={24} />
                                        <h3 className="text-xl font-semibold m-0">Jakość Treści</h3>
                                    </div>
                                    <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                                        <li>• Udostępniamy tylko wartościowe materiały edukacyjne.</li>
                                        <li>• Dbamy o poprawne opisy i kategoryzację zasobów.</li>
                                        <li>• Nie spamujemy i nie reklamujemy usług komercyjnych.</li>
                                        <li>• Przestrzegamy praw autorskich.</li>
                                    </ul>
                                </div>
                            </div>

                            <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-gray-100 mt-12 mb-6">
                                <Shield size={28} className="text-blue-600 dark:text-blue-400" />
                                Moderacja i Bezpieczeństwo
                            </h2>
                            <p>
                                Nasz system automatycznie monitoruje treści pod kątem wulgaryzmów i niebezpiecznych linków.
                                Administratorzy serwisu mają prawo do usuwania treści naruszających regulamin bez wcześniejszego ostrzeżenia.
                            </p>

                            <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-gray-100 mt-12 mb-6">
                                <AlertTriangle size={28} className="text-red-600 dark:text-red-400" />
                                Konsekwencje naruszeń
                            </h2>
                            <div className="bg-red-50 dark:bg-red-900/10 border-l-4 border-red-500 p-6 rounded-r-lg">
                                <p className="font-medium text-gray-900 dark:text-gray-100 mb-4">
                                    Łamanie zasad serwisu może skutkować:
                                </p>
                                <ol className="list-decimal list-inside space-y-3 text-gray-700 dark:text-gray-300 ml-2">
                                    <li>
                                        <strong>Ostrzeżenie:</strong> W przypadku drobnych naruszeń (np. przypadkowe użycie niestosownego słowa).
                                    </li>
                                    <li>
                                        <strong>Usunięcie treści:</strong> Komentarze lub zasoby naruszające zasady zostaną trwale usunięte.
                                    </li>
                                    <li>
                                        <strong>Czasowa blokada konta:</strong> W przypadku powtarzających się naruszeń lub spamu (od 24h do 30 dni).
                                    </li>
                                    <li>
                                        <strong>Trwała blokada konta (Ban):</strong> W przypadku rażącego łamania zasad, mowy nienawiści, publikowania treści nielegalnych lub uporczywego trollingu.
                                    </li>
                                </ol>
                            </div>

                            <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900/10 rounded-xl text-center">
                                <p className="text-gray-700 dark:text-gray-300">
                                    Pamiętaj, że tworzymy to miejsce wspólnie. Twoja postawa ma wpływ na jakość nauki innych użytkowników.
                                    <br />
                                    <strong>Dziękujemy, że jesteś z nami! 🚀</strong>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
