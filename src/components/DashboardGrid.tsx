import { Resource, ResourceTopic, ResourceLevel } from '../lib/supabase';
import { ResourceCard } from './ResourceCard';
import { ChevronLeft, ChevronRight, Loader, Sparkles } from 'lucide-react';
import { SortOption } from '../hooks/useDashboardFilters';

type DashboardGridProps = {
    loading: boolean;
    filteredResources: Resource[];
    sortedResources: Resource[];
    currentResources: Resource[];
    resourceTopics: Map<string, ResourceTopic[]>;
    resourceLevels: Map<string, ResourceLevel[]>;
    hasActiveFilters: boolean;
    recentlyAddedResources: Resource[];
    sortBy: SortOption;
    setSortBy: (sort: SortOption) => void;
    currentPage: number;
    totalPages: number;
    indexOfFirstResource: number;
    indexOfLastResource: number;
    onPageChange: (page: number) => void;
    onTopicClick: (topicName: string) => void;
    onCardClick: (resource: Resource) => void;
    searchQuery: string;
    onAskAi: (query: string) => void;
};

export function DashboardGrid({
    loading,
    filteredResources,
    sortedResources,
    currentResources,
    resourceTopics,
    resourceLevels,
    hasActiveFilters,
    recentlyAddedResources,
    sortBy,
    setSortBy,
    currentPage,
    totalPages,
    indexOfFirstResource,
    indexOfLastResource,
    onPageChange,
    onTopicClick,
    onCardClick,
    searchQuery,
    onAskAi
}: DashboardGridProps) {

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader className="animate-spin text-blue-600" size={48} />
            </div>
        );
    }

    return (
        <>
            {/* Sorting dropdown */}
            {hasActiveFilters && filteredResources.length > 0 && (
                <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                        Znaleziono {filteredResources.length} {filteredResources.length === 1 ? 'zasób' : filteredResources.length < 5 ? 'zasoby' : 'zasobów'}
                    </p>
                    <div className="flex items-center gap-2">
                        <label htmlFor="sort" className="text-sm text-gray-600">Sortuj:</label>
                        <select
                            id="sort"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as SortOption)}
                            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="newest">Najnowsze</option>
                            <option value="rating">Najlepiej oceniane</option>
                            <option value="popular">Najpopularniejsze</option>
                            <option value="alphabetical">Alfabetycznie (A-Z)</option>
                        </select>
                    </div>
                </div>
            )}

            {!hasActiveFilters && recentlyAddedResources.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Ostatnio dodane</h2>
                    <div className="grid gap-4 md:gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))' }}>
                        {recentlyAddedResources.map((resource) => (
                            <ResourceCard
                                key={resource.id}
                                resource={resource}
                                topics={resourceTopics.get(resource.id) || []}
                                levels={resourceLevels.get(resource.id) || []}
                                onTopicClick={onTopicClick}
                                onCardClick={onCardClick}
                            />
                        ))}
                    </div>
                </div>
            )}

            <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {hasActiveFilters ? 'Wyniki filtrowania' : 'Wszystkie zasoby'}
                </h2>
                <p className="text-sm text-gray-600">
                    Wyświetlanie zasobów {sortedResources.length > 0 ? indexOfFirstResource + 1 : 0}-{Math.min(indexOfLastResource, sortedResources.length)} spośród {sortedResources.length} znalezionych materiałów
                </p>
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
                    />
                ))}
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8 pb-4">
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600"
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
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                );
                            } else if (
                                page === currentPage - 2 ||
                                page === currentPage + 2
                            ) {
                                return <span key={page} className="w-10 h-10 flex items-center justify-center text-gray-400">...</span>;
                            }
                            return null;
                        })}
                    </div>

                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            )}

            {filteredResources.length === 0 && (
                <div className="text-center py-12 text-gray-500 flex flex-col items-center gap-4">
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
