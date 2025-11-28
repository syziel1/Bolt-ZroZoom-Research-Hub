import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, Plus, Clock, BookOpen, ChevronRight, ChevronLeft } from 'lucide-react';
import { useUserStats } from '../hooks/useUserStats';
import { useRecentResources } from '../hooks/useRecentResources';
import { Session } from '@supabase/supabase-js';
import { supabase, Resource, ResourceTopic, ResourceLevel } from '../lib/supabase';
import { ResourceCard } from './ResourceCard';
import { Navigation } from './Navigation';
import { Footer } from './Footer';
import { SEO } from './SEO';

export function UserHomePage() {
    const navigate = useNavigate();
    const { stats, loading: statsLoading, userNick } = useUserStats();
    const { recentIds } = useRecentResources();
    const [recentResources, setRecentResources] = useState<Resource[]>([]);
    const [resourceTopics, setResourceTopics] = useState<Map<string, ResourceTopic[]>>(new Map());
    const [resourceLevels, setResourceLevels] = useState<Map<string, ResourceLevel[]>>(new Map());
    const [loadingRecent, setLoadingRecent] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [session, setSession] = useState<Session | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [isPaused, setIsPaused] = useState(false);
    const scrollState = useRef({ direction: 1 });

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

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container || recentResources.length === 0) return;

        // Check if scrolling is needed
        if (container.scrollWidth <= container.clientWidth) return;

        let animationId: number;

        const animate = () => {
            if (!isPaused) {
                // Check boundaries
                // Use a small tolerance for float/rounding
                if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 1) {
                    scrollState.current.direction = -1;
                } else if (container.scrollLeft <= 1) {
                    scrollState.current.direction = 1;
                }

                container.scrollLeft += 0.5 * scrollState.current.direction;
            }
            animationId = requestAnimationFrame(animate);
        };

        animationId = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationId);
    }, [recentResources, isPaused]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/zasoby?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const scrollAmount = 350; // Approx card width + gap
            const targetScroll = direction === 'left'
                ? Math.max(0, container.scrollLeft - scrollAmount)
                : Math.min(container.scrollWidth - container.clientWidth, container.scrollLeft + scrollAmount);

            const startScroll = container.scrollLeft;
            const distance = targetScroll - startScroll;
            const duration = 800; // ms - slower scroll
            const startTime = performance.now();

            // Temporarily pause auto-scroll while manual scrolling
            setIsPaused(true);

            const animateScroll = (currentTime: number) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);

                // EaseInOutQuad
                const ease = progress < 0.5
                    ? 2 * progress * progress
                    : -1 + (4 - 2 * progress) * progress;

                container.scrollLeft = startScroll + (distance * ease);

                if (progress < 1) {
                    requestAnimationFrame(animateScroll);
                } else {
                    // Resume auto-scroll after manual scroll finishes (optional, or let user hover out to resume)
                    // Let's keep it paused if mouse is over, but if clicked via button, mouse might not be over container.
                    // For simplicity, we rely on hover state. If button is outside container, we might need to handle it.
                    // The buttons are outside the container.
                    setIsPaused(false);
                }
            };

            requestAnimationFrame(animateScroll);
        }
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
                session={session}
            />

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 pt-20 md:pt-20">
                {/* Greeting Section */}
                <section className="mb-2 py-10 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                        Cześć, <span className="text-blue-600 dark:text-blue-400">{userNick}</span>!
                        <br />
                        <span className="text-3xl md:text-4xl text-gray-600 dark:text-gray-400 font-normal mt-2 block">
                            Głodny wiedzy?
                        </span>
                    </h1>
                </section>

                <section className="mb-10 py-10 text-center">
                    <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative">
                        <input
                            type="text"
                            placeholder="Czego chcesz się dzisiaj nauczyć?"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-6 py-4 rounded-full text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-800 text-lg shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-400/50 pl-14 placeholder-gray-500 dark:placeholder-gray-400 border border-gray-100 dark:border-slate-700"
                        />
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
                        <button
                            type="submit"
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700 transition-colors"
                        >
                            Szukaj
                        </button>
                    </form>
                </section>

                {/* Recently Opened Section */}
                <section className="mb-16">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                            <Clock size={28} className="text-blue-600 dark:text-blue-400" />
                            Ostatnio otwierane
                        </h2>
                        <div className="flex items-center gap-4">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => scroll('left')}
                                    className="p-2 rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-400 transition-colors"
                                    aria-label="Przewiń w lewo"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <button
                                    onClick={() => scroll('right')}
                                    className="p-2 rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-400 transition-colors"
                                    aria-label="Przewiń w prawo"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                            <button
                                onClick={() => navigate('/zasoby')}
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium flex items-center gap-1"
                            >
                                Przeglądaj wszystkie
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>

                    {loadingRecent ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-500 dark:text-gray-400">Ładowanie historii...</p>
                        </div>
                    ) : recentResources.length > 0 ? (
                        <div
                            ref={scrollContainerRef}
                            className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                            onMouseEnter={() => setIsPaused(true)}
                            onMouseLeave={() => setIsPaused(false)}
                        >
                            {recentResources.map((resource) => (
                                <div key={resource.id} className="min-w-[300px] md:min-w-[350px]">
                                    <ResourceCard
                                        resource={resource}
                                        topics={resourceTopics.get(resource.id) || []}
                                        levels={resourceLevels.get(resource.id) || []}
                                        onCardClick={() => {
                                            const subjectSlug = resource.subject_slug || 'matematyka';
                                            navigate(`/zasoby/${subjectSlug}`);
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center border border-gray-100 dark:border-slate-700">
                            <BookOpen size={48} className="text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                Nic tu jeszcze nie ma
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Rozpocznij naukę przeglądając dostępne materiały. Twoja historia pojawi się tutaj.
                            </p>
                            <button
                                onClick={() => navigate('/zasoby')}
                                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                            >
                                Przeglądaj zasoby
                            </button>
                        </div>
                    )}
                </section>

                {/* Stats Section */}
                <section className="mb-16">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/zasoby?favorites=true')}>
                            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-full">
                                <Star size={24} className="text-red-500 fill-red-500" />
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
