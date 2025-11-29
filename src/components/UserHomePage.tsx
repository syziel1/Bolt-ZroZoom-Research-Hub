import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Plus, Clock, BookOpen, Heart } from 'lucide-react';
import { useUserStats } from '../hooks/useUserStats';
import { useRecentResources } from '../hooks/useRecentResources';
import { Session } from '@supabase/supabase-js';
import { supabase, Resource, ResourceTopic, ResourceLevel } from '../lib/supabase';
import { ResourceCarousel } from './ResourceCarousel';
import { Navigation } from './Navigation';
import { Footer } from './Footer';
import { SEO } from './SEO';
import { UnifiedSearchInput } from './UnifiedSearchInput';

export function UserHomePage() {
    const navigate = useNavigate();
    const { stats, loading: statsLoading, userName } = useUserStats();
    const { recentIds } = useRecentResources();
    const [recentResources, setRecentResources] = useState<Resource[]>([]);
    const [resourceTopics, setResourceTopics] = useState<Map<string, ResourceTopic[]>>(new Map());
    const [resourceLevels, setResourceLevels] = useState<Map<string, ResourceLevel[]>>(new Map());
    const [loadingRecent, setLoadingRecent] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [session, setSession] = useState<Session | null>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });
    }, []);

    useEffect(() => {
        const loadRecentResources = async () => {
            if (recentIds.length === 0) {
                setRecentResources([]);
                setLoadingRecent(false);
                return;
            }

            try {
                const { data: resources } = await supabase
                    .from('v_resources_full')
                    .select('*')
                    .in('id', recentIds);

                if (resources) {
                    // Sort by order in recentIds to maintain history order
                    const sortedResources = resources.sort((a, b) => {
                        return recentIds.indexOf(a.id) - recentIds.indexOf(b.id);
                    });
                    setRecentResources(sortedResources);

                    // Load topics and levels for these resources
                    const resourceIds = resources.map(r => r.id);
                    const [topicsData, levelsData] = await Promise.all([
                        supabase
                            .from('v_resource_topics')
                            .select('resource_id, topic_id, topic_name, topic_slug, parent_topic_id, subject_slug')
                            .in('resource_id', resourceIds),
                        supabase
                            .from('v_resource_levels')
                            .select('resource_id, levels')
                            .in('resource_id', resourceIds),
                    ]);

                    if (topicsData.data) {
                        const topicsMap = new Map<string, ResourceTopic[]>();
                        topicsData.data.forEach((item: ResourceTopic & { resource_id: string }) => {
                            const { resource_id, ...topicData } = item;
                            if (!topicsMap.has(resource_id)) {
                                topicsMap.set(resource_id, []);
                            }
                            topicsMap.get(resource_id)!.push(topicData);
                        });
                        setResourceTopics(topicsMap);
                    }

                    if (levelsData.data) {
                        const levelsMap = new Map<string, ResourceLevel[]>();
                        levelsData.data.forEach((item: { resource_id: string; levels: ResourceLevel[] }) => {
                            if (item.levels && Array.isArray(item.levels)) {
                                levelsMap.set(item.resource_id, item.levels);
                            }
                        });
                        setResourceLevels(levelsMap);
                    }
                }
            } catch (error) {
                console.error('Error loading recent resources:', error);
            } finally {
                setLoadingRecent(false);
            }
        };

        loadRecentResources();
    }, [recentIds]);

    const [allResources, setAllResources] = useState<{ id: string; title: string }[]>([]);

    useEffect(() => {
        const loadResourceTitles = async () => {
            const { data } = await supabase
                .from('v_resources_full')
                .select('id, title');
            if (data) {
                setAllResources(data);
            }
        };
        loadResourceTitles();
    }, []);

    const handleSearch = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/zasoby?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const handleResourceSelect = (resource: { id: string; title: string }) => {
        navigate(`/zasoby?r=${resource.id}`);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col">
            <SEO
                title="Pulpit użytkownika - Szkoła Przyszłości z AI"
                description="Twój spersonalizowany pulpit edukacyjny. Przeglądaj ulubione zasoby, śledź postępy i odkrywaj nowe materiały."
            />
            <Navigation
                onNavigateToAuth={() => navigate('/auth')}
                onScrollToSubjects={() => navigate('/zasoby')}
                onBrowseAsGuest={() => navigate('/zasoby')}
                onLogout={handleLogout}
                session={session}
                forceScrolled={true}
            />

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 pt-20 md:pt-20">
                {/* Greeting Section */}
                <section className="mb-2 py-10 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                        Cześć, <span className="text-blue-600 dark:text-blue-400">{userName}</span>!
                        <br />
                        <span className="text-3xl md:text-4xl text-gray-600 dark:text-gray-400 font-normal mt-2 block">
                            Głodny wiedzy?
                        </span>
                    </h1>
                </section>

                <section className="mb-10 py-10 text-center">
                    <div className="max-w-2xl mx-auto relative">
                        <UnifiedSearchInput
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            onSearch={handleSearch}
                            items={allResources}
                            onItemSelect={handleResourceSelect}
                            placeholder="Czego chcesz się dzisiaj nauczyć?"
                            inputClassName="w-full px-6 py-4 rounded-full text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-800 text-lg shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-400/50 pl-14 placeholder-gray-500 dark:placeholder-gray-400 border border-gray-100 dark:border-slate-700"
                            searchIconClassName="!left-5 text-gray-400"
                            showSearchButton={true}
                            searchButtonClassName="bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700 transition-colors"
                        />
                    </div>
                </section>

                {/* Recently Opened Section */}
                <ResourceCarousel
                    resources={recentResources}
                    resourceTopics={resourceTopics}
                    resourceLevels={resourceLevels}
                    title="Ostatnio otwierane"
                    icon={<Clock size={28} className="text-blue-600 dark:text-blue-400" />}
                    actionButton={{
                        label: 'Przeglądaj wszystkie',
                        onClick: () => navigate('/zasoby')
                    }}
                    loading={loadingRecent}
                    emptyState={{
                        icon: <BookOpen size={48} className="text-gray-300 dark:text-gray-600 mx-auto mb-4" />,
                        title: 'Nic tu jeszcze nie ma',
                        description: 'Rozpocznij naukę przeglądając dostępne materiały. Twoja historia pojawi się tutaj.',
                        actionLabel: 'Przeglądaj zasoby',
                        onAction: () => navigate('/zasoby')
                    }}
                    cardVariant="hero"
                />

                {/* Stats Section */}
                <section className="mb-16">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/zasoby?favorites=true')}>
                            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-full">
                                <Heart size={24} className="text-red-500 fill-red-500" />
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                    {statsLoading ? '...' : stats.favorites_count}
                                </div>
                                <div className="text-gray-600 dark:text-gray-400 font-medium">Twoich ulubionych</div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/zasoby?rated=true')}>
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-full">
                                <Star size={24} className="text-yellow-500 fill-yellow-500" />
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                    {statsLoading ? '...' : stats.ratings_count}
                                </div>
                                <div className="text-gray-600 dark:text-gray-400 font-medium">Twoich ocen</div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/zasoby?mine=true')}>
                            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-full">
                                <Plus size={24} className="text-green-500" />
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                    {statsLoading ? '...' : stats.resources_count}
                                </div>
                                <div className="text-gray-600 dark:text-gray-400 font-medium">Dodanych przez Ciebie</div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
