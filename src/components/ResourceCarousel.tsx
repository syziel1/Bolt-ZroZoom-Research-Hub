import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase, Resource, ResourceTopic, ResourceLevel } from '../lib/supabase';
import { ResourceCard, ResourceCardVariant } from './ResourceCard';

type ResourceCarouselProps = {
    resources: Resource[];
    resourceTopics: Map<string, ResourceTopic[]>;
    resourceLevels: Map<string, ResourceLevel[]>;
    title: string;
    icon: React.ReactNode;
    actionButton?: {
        label: string;
        onClick: () => void;
    } | null;
    loading?: boolean;
    emptyState?: {
        icon: React.ReactNode;
        title: string;
        description: string;
        actionLabel: string;
        onAction: () => void;
    };
    cardVariant?: ResourceCardVariant;
};

export function ResourceCarousel({
    resources,
    resourceTopics,
    resourceLevels,
    title,
    icon,
    actionButton = null,
    loading = false,
    emptyState,
    cardVariant = 'default'
}: ResourceCarouselProps) {
    const navigate = useNavigate();
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [isPaused, setIsPaused] = useState(false);
    const scrollState = useRef({ direction: 1 });
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setIsLoggedIn(!!session);
        });
    }, []);

    // Auto-scroll animation
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container || resources.length === 0) return;

        // Check if scrolling is needed
        if (container.scrollWidth <= container.clientWidth) return;

        let animationId: number;

        const animate = () => {
            if (!isPaused) {
                // Check boundaries with small tolerance for float/rounding
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
    }, [resources, isPaused]);

    // Manual scroll with smooth animation
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
                    setIsPaused(false);
                }
            };

            requestAnimationFrame(animateScroll);
        }
    };

    if (loading) {
        return (
            <section className="mb-16">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                        {icon}
                        {title}
                    </h2>
                </div>
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-500 dark:text-gray-400">Ładowanie...</p>
                </div>
            </section>
        );
    }

    if (resources.length === 0 && emptyState) {
        return (
            <section className="mb-16">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                        {icon}
                        {title}
                    </h2>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center border border-gray-100 dark:border-slate-700">
                    {emptyState.icon}
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        {emptyState.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        {emptyState.description}
                    </p>
                    <button
                        onClick={emptyState.onAction}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                        {emptyState.actionLabel}
                    </button>
                </div>
            </section>
        );
    }

    return (
        <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                    {icon}
                    {title}
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
                    {actionButton && (
                        <button
                            onClick={actionButton.onClick}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium flex items-center gap-1"
                        >
                            {actionButton.label}
                            <ChevronRight size={20} />
                        </button>
                    )}
                </div>
            </div>

            <div
                ref={scrollContainerRef}
                className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                {resources.map((resource) => (
                    <div key={resource.id} className="min-w-[300px] md:min-w-[350px]">
                        <ResourceCard
                            resource={resource}
                            topics={resourceTopics.get(resource.id) || []}
                            levels={resourceLevels.get(resource.id) || []}
                            variant={cardVariant}
                            isLoggedIn={isLoggedIn}
                            onCardClick={() => {
                                const subjectSlug = resource.subject_slug || 'matematyka';
                                navigate(`/zasoby/${subjectSlug}`);
                            }}
                        />
                    </div>
                ))}
            </div>
        </section>
    );
}
