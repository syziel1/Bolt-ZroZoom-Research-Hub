import { Resource, ResourceTopic, ResourceLevel, Subject, TopicNode, Level } from '../lib/supabase';
import { ResourceCard } from './ResourceCard';
import { ChevronLeft, ChevronRight, Loader, Sparkles, X, BookOpen, ArrowRight } from 'lucide-react';
import { SortOption } from '../hooks/useDashboardFilters';
import { BlogPost } from '../content/blog/posts';
import { useNavigate } from 'react-router-dom';

type DashboardGridProps = {
    loading: boolean;
    filteredResources: Resource[];
    sortedResources: Resource[];
    currentResources: Resource[];
    resourceTopics: Map<string, ResourceTopic[]>;
    resourceLevels: Map<string, ResourceLevel[]>;
    hasActiveFilters: boolean;
    sortBy: SortOption;
    setSortBy: (sortBy: SortOption) => void;
    currentPage: number;
    totalPages: number;
    indexOfFirstResource: number;
    indexOfLastResource: number;
    onPageChange: (page: number) => void;
    onTopicClick: (topicName: string) => void;
    onCardClick: (resource: Resource) => void;
    searchQuery: string;
    onAskAi: (query: string) => void;
    isFavorite?: (resourceId: string) => boolean;
    onFavoriteToggle?: (resourceId: string) => void;
    isLoggedIn?: boolean;
    filteredBlogPosts?: BlogPost[];
    subjects?: Subject[];
    topics?: TopicNode[];
    levels?: Level[];
    selectedSubject?: string | null;
    selectedTopics?: string[];
    selectedLevels?: string[];
    selectedLanguages?: string[];
    onSubjectChange?: (subjectId: string | null) => void;
    onTopicToggle?: (topicId: string) => void;
    onLevelToggle?: (levelId: string) => void;
    onLanguageToggle?: (language: string) => void;
    setSearchQuery?: (query: string) => void;
};

export function DashboardGrid({
    loading,
    filteredResources,
    currentResources,
    resourceTopics,
    resourceLevels,
    hasActiveFilters,
    sortBy,
    setSortBy,
    currentPage,
    totalPages,
    onPageChange,
    onTopicClick,
    onCardClick,
    searchQuery,
    onAskAi,
    isFavorite,
    onFavoriteToggle,
    isLoggedIn = true,
    filteredBlogPosts = [],
    subjects = [],
    topics = [],
    levels = [],
    selectedSubject,
    selectedTopics = [],
    selectedLevels = [],
    selectedLanguages = [],
    onSubjectChange,
    onTopicToggle,
    onLevelToggle,
    onLanguageToggle,
    setSearchQuery
}: DashboardGridProps) {

    const navigate = useNavigate();

    // Helper to find topic name recursively
    const getTopicName = (nodes: TopicNode[], id: string): string | null => {
        for (const node of nodes) {
            if (node.id === id) return node.name;
            if (node.children) {
                const found = getTopicName(node.children, id);
                if (found) return found;
            }
        }
        return null;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader className="animate-spin text-blue-600" size={48} />
            </div>
        );
    }

    return (
        <>
            <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
                <div className="flex flex-wrap items-center gap-2">
                    {hasActiveFilters ? (
                        <>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mr-2">
                                Wyniki filtrowania:
                            </h2>

                            {/* Search Query */}
                            {searchQuery && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border border-blue-200 dark:border-blue-800">
                                    "{searchQuery}"
                                    <button onClick={() => setSearchQuery?.('')} className="hover:text-blue-600 dark:hover:text-blue-400 p-0.5 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors">
                                        <X size={14} />
                                    </button>
                                </span>
                            )}

                            {/* Subject */}
                            {selectedSubject && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border border-purple-200 dark:border-purple-800">
                                    {subjects.find(s => s.subject_id === selectedSubject)?.subject_name}
                                    <button onClick={() => onSubjectChange?.(null)} className="hover:text-purple-600 dark:hover:text-purple-400 p-0.5 rounded-full hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors">
                                        <X size={14} />
                                    </button>
                                </span>
                            )}

                            {/* Topics */}
                            {selectedTopics.map(topicId => {
                                const topicName = getTopicName(topics, topicId);
                                if (!topicName) return null;
                                return (
                                    <span key={topicId} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800">
                                        {topicName}
                                        <button onClick={() => onTopicToggle?.(topicId)} className="hover:text-indigo-600 dark:hover:text-indigo-400 p-0.5 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors">
                                            <X size={14} />
                                        </button>
                                    </span>
                                );
                            })}

                            {/* Levels */}
                            {selectedLevels.map(levelId => {
                                const levelName = levels.find(l => l.id === levelId)?.name;
                                if (!levelName) return null;
                                return (
                                    <span key={levelId} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border border-green-200 dark:border-green-800">
                                        {levelName}
                                        <button onClick={() => onLevelToggle?.(levelId)} className="hover:text-green-600 dark:hover:text-green-400 p-0.5 rounded-full hover:bg-green-200 dark:hover:bg-green-800 transition-colors">
                                            <X size={14} />
                                        </button>
                                    </span>
                                );
                            })}

                            {/* Languages */}
                            {selectedLanguages.map(lang => (
                                <span key={lang} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 border border-orange-200 dark:border-orange-800">
                                    {lang === 'pl' ? 'Polski' : lang === 'en' ? 'Angielski' : lang}
                                    <button onClick={() => onLanguageToggle?.(lang)} className="hover:text-orange-600 dark:hover:text-orange-400 p-0.5 rounded-full hover:bg-orange-200 dark:hover:bg-orange-800 transition-colors">
                                        <X size={14} />
                                    </button>
                                </span>
                            ))}
                        </>
                    ) : (
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                            Wszystkie zasoby
                        </h2>
                    )}
                </div>

                {/* Sorting dropdown */}
                <div className="flex items-center gap-2">
                    <label htmlFor="sort" className="text-sm text-gray-600 dark:text-gray-400">Sortuj:</label>
                    <select
                        id="sort"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        className="px-3 py-1.5 border border-gray-300 dark:border-slate-600 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                    >
                        <option value="newest">Najnowsze</option>
                        <option value="rating">Najlepiej oceniane</option>
                        <option value="popular">Najpopularniejsze</option>
                        <option value="alphabetical">Alfabetycznie (A-Z)</option>
                    </select>
                </div>
            </div>

            <div className="grid gap-4 md:gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))' }}>
                {currentResources.map((resource) => (
                    <ResourceCard
                        key={resource.id}
                        resource={resource}
                        topics={resourceTopics.get(resource.id) || []}
                        levels={resourceLevels.get(resource.id) || []}
                        onTopicClick={onTopicClick}
                        onCardClick={onCardClick}
                        isFavorite={isFavorite?.(resource.id)}
                        onFavoriteToggle={onFavoriteToggle}
                        isLoggedIn={isLoggedIn}
                    />
                ))}
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8 pb-4">
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 dark:text-gray-300"
                    >
                        <ChevronLeft size={20} />
                    </button>

                    <div className="flex gap-1 overflow-x-auto max-w-[200px] sm:max-w-none no-scrollbar">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                            // Show first, last, current, and surrounding pages
                            if (
                                page === 1 ||
                                page === totalPages ||
                                (page >= currentPage - 1 && page <= currentPage + 1)
                            ) {
                                return (
                                    <button
                                        key={page}
                                        onClick={() => onPageChange(page)}
                                        className={`w-10 h-10 rounded-md flex-shrink-0 flex items-center justify-center text-sm font-medium transition-colors
                      ${currentPage === page
                                                ? 'bg-blue-600 dark:bg-blue-500 text-white'
                                                : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 border border-gray-300 dark:border-slate-600'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                );
                            } else if (
                                page === currentPage - 2 ||
                                page === currentPage + 2
                            ) {
                                return <span key={page} className="w-10 h-10 flex items-center justify-center text-gray-400 dark:text-gray-500">...</span>;
                            }
                            return null;
                        })}
                    </div>

                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 dark:text-gray-300"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            )}

            {filteredBlogPosts.length > 0 && (
                <div className="mt-12 pt-8 border-t border-gray-200 dark:border-slate-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                        <BookOpen size={24} className="text-blue-600" />
                        Artykuły z Bloga
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredBlogPosts.map((post) => (
                            <div
                                key={post.slug}
                                onClick={() => navigate(`/blog/${post.slug}`)}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate(`/blog/${post.slug}`); }}
                                role="link"
                                tabIndex={0}
                                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-slate-700 overflow-hidden cursor-pointer group flex flex-col"
                            >
                                {post.coverImage && (
                                    <div className="h-40 overflow-hidden bg-gray-100 dark:bg-slate-700">
                                        <img
                                            src={post.coverImage}
                                            alt={post.title}
                                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                )}
                                <div className="p-4 flex flex-col flex-1">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                                        {post.title}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2 flex-1">
                                        {post.excerpt}
                                    </p>
                                    <div className="mt-auto flex items-center text-blue-600 dark:text-blue-400 font-medium text-xs group-hover:translate-x-1 transition-transform">
                                        Czytaj więcej <ArrowRight size={14} className="ml-1" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {filteredResources.length === 0 && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400 flex flex-col items-center gap-4">
                    <p>Nie znaleziono zasobów pasujących do filtrów</p>
                    {searchQuery && (
                        <button
                            onClick={() => onAskAi(searchQuery)}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-md hover:shadow-lg transition-all transform hover:scale-105"
                        >
                            <Sparkles size={18} />
                            Nie znalazłeś tego, czego szukasz? Zapytaj AI!
                        </button>
                    )}
                </div>
            )}
        </>
    );
}
