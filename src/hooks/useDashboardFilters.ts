import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { Resource, Subject, Topic, TopicNode, ResourceTopic, ResourceLevel } from '../lib/supabase';
import { useTopics } from './useTopics';

export type SortOption = 'newest' | 'rating' | 'popular' | 'alphabetical';

type UseDashboardFiltersProps = {
    resources: Resource[];
    subjects: Subject[];
    allTopics: Topic[];
    resourceTopics: Map<string, ResourceTopic[]>;
    resourceLevels: Map<string, ResourceLevel[]>;
};

export function useDashboardFilters({
    resources,
    subjects,
    allTopics,
    resourceTopics,
    resourceLevels
}: UseDashboardFiltersProps) {
    const navigate = useNavigate();
    const { subjectSlug, topicSlug, subtopicSlug } = useParams<{ subjectSlug?: string; topicSlug?: string; subtopicSlug?: string }>();
    const [searchParams, setSearchParams] = useSearchParams();

    const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
    const { topics: topicNodes, loading: topicsLoading } = useTopics(selectedSubject);
    const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
    const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState<SortOption>('newest');

    const ITEMS_PER_PAGE = 12;

    // Read search query from URL params
    useEffect(() => {
        const query = searchParams.get('q');
        if (query) {
            setSearchQuery(query);
        }
    }, [searchParams]);

    // Map subjectSlug to subject ID
    useEffect(() => {
        if (subjectSlug && subjects.length > 0) {
            const subject = subjects.find(s => s.subject_slug === subjectSlug);
            if (subject) {
                setSelectedSubject(subject.subject_id);
            }
        } else if (!subjectSlug) {
            setSelectedSubject(null);
        }
    }, [subjectSlug, subjects]);

    // Map topicSlug/subtopicSlug to topic IDs
    useEffect(() => {
        if (allTopics.length > 0 && subjectSlug) {
            if (subtopicSlug) {
                const topic = allTopics.find(t => t.slug === subtopicSlug);
                if (topic) {
                    setSelectedTopics([topic.id]);
                }
            } else if (topicSlug) {
                const topic = allTopics.find(t => t.slug === topicSlug);
                if (topic) {
                    setSelectedTopics([topic.id]);
                }
            } else {
                setSelectedTopics([]);
            }
        }
    }, [subjectSlug, topicSlug, subtopicSlug, allTopics]);

    const handleSubjectChange = (subjectId: string | null) => {
        if (subjectId) {
            const subject = subjects.find(s => s.subject_id === subjectId);
            if (subject) {
                navigate(`/zasoby/${subject.subject_slug}`);
            }
        } else {
            navigate('/zasoby');
        }
        setSelectedTopics([]);
    };

    const handleTopicToggle = (topicId: string) => {
        const topic = allTopics.find(t => t.id === topicId);
        if (!topic || !selectedSubject) return;

        const subject = subjects.find(s => s.subject_id === selectedSubject);
        if (!subject) return;

        if (topic.parent_topic_id) {
            const parentTopic = allTopics.find(t => t.id === topic.parent_topic_id);
            if (parentTopic) {
                navigate(`/zasoby/${subject.subject_slug}/${parentTopic.slug}/${topic.slug}`);
                return;
            }
        }

        navigate(`/zasoby/${subject.subject_slug}/${topic.slug}`);
    };

    const handleLevelToggle = (levelId: string) => {
        setSelectedLevels((prev) =>
            prev.includes(levelId) ? prev.filter((id) => id !== levelId) : [...prev, levelId]
        );
    };

    const handleLanguageToggle = (language: string) => {
        setSelectedLanguages((prev) =>
            prev.includes(language) ? prev.filter((l) => l !== language) : [...prev, language]
        );
    };

    const handleSearchChange = (query: string) => {
        setSearchQuery(query);
        if (query) {
            setSearchParams({ q: query });
        } else {
            setSearchParams({});
        }
    };

    const filteredResources = useMemo(() => {
        return resources.filter((resource) => {
            if (selectedSubject) {
                if (resource.subject_id !== selectedSubject) {
                    return false;
                }
            }

            if (selectedTopics.length > 0) {
                const findTopicNames = (nodes: TopicNode[], ids: string[]): string[] => {
                    const names: string[] = [];
                    for (const node of nodes) {
                        if (ids.includes(node.id)) names.push(node.name);
                        if (node.children) names.push(...findTopicNames(node.children, ids));
                    }
                    return names;
                };

                const selectedTopicNames = findTopicNames(topicNodes, selectedTopics);
                const currentResourceTopics = resourceTopics.get(resource.id) || [];

                const hasMatchingTopic = selectedTopicNames.some((topicName) =>
                    currentResourceTopics.some(topic => topic.topic_name === topicName)
                );
                if (!hasMatchingTopic) return false;
            }

            if (selectedLevels.length > 0) {
                const currentResourceLevels = resourceLevels.get(resource.id) || [];
                const hasMatchingLevel = currentResourceLevels.some((level) =>
                    selectedLevels.includes(level.id)
                );
                if (!hasMatchingLevel) return false;
            }

            if (selectedLanguages.length > 0) {
                if (!resource.language || !selectedLanguages.includes(resource.language)) {
                    return false;
                }
            }

            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const titleMatch = resource.title.toLowerCase().includes(query);
                const descriptionMatch = resource.description?.toLowerCase().includes(query);

                const currentResourceTopics = resourceTopics.get(resource.id) || [];
                const topicMatch = currentResourceTopics.some(topic =>
                    topic.topic_name.toLowerCase().includes(query)
                );

                if (!titleMatch && !descriptionMatch && !topicMatch) {
                    return false;
                }
            }

            return true;
        });
    }, [resources, selectedSubject, selectedTopics, selectedLevels, selectedLanguages, searchQuery, topicNodes, resourceTopics, resourceLevels]);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedSubject, selectedTopics, selectedLevels, selectedLanguages, searchQuery]);

    const sortedResources = useMemo(() => {
        const sorted = [...filteredResources];

        switch (sortBy) {
            case 'newest':
                return sorted.sort((a, b) => {
                    const dateA = new Date(a.created_at || 0).getTime();
                    const dateB = new Date(b.created_at || 0).getTime();
                    return dateB - dateA;
                });

            case 'rating':
                return sorted.sort((a, b) => {
                    const avgA = a.avg_usefulness && a.avg_correctness
                        ? (a.avg_usefulness + a.avg_correctness) / 2
                        : 0;
                    const avgB = b.avg_usefulness && b.avg_correctness
                        ? (b.avg_usefulness + b.avg_correctness) / 2
                        : 0;
                    return avgB - avgA;
                });

            case 'popular':
                return sorted.sort((a, b) => {
                    const popularityA = (a.ratings_count || 0) + (a.comments_count || 0);
                    const popularityB = (b.ratings_count || 0) + (b.comments_count || 0);
                    return popularityB - popularityA;
                });

            case 'alphabetical':
                return sorted.sort((a, b) => a.title.localeCompare(b.title, 'pl'));

            default:
                return sorted;
        }
    }, [filteredResources, sortBy]);

    const indexOfLastResource = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstResource = indexOfLastResource - ITEMS_PER_PAGE;
    const currentResources = sortedResources.slice(indexOfFirstResource, indexOfLastResource);
    const totalPages = Math.ceil(sortedResources.length / ITEMS_PER_PAGE);

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
        const mainContent = document.querySelector('main');
        if (mainContent) {
            mainContent.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const hasActiveFilters = selectedSubject !== null || selectedTopics.length > 0 || selectedLevels.length > 0 || selectedLanguages.length > 0 || searchQuery.length > 0;

    return {
        selectedSubject,
        selectedTopics,
        selectedLevels,
        selectedLanguages,
        searchQuery,
        setSearchQuery: handleSearchChange,
        sortBy,
        setSortBy,
        currentPage,
        totalPages,
        currentResources,
        filteredResources,
        sortedResources,
        topicNodes,
        topicsLoading,
        hasActiveFilters,
        indexOfFirstResource,
        indexOfLastResource,
        handleSubjectChange,
        handleTopicToggle,
        handleLevelToggle,
        handleLanguageToggle,
        handlePageChange
    };
}
