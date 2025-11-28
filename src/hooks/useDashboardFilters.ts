import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { Resource, Subject, Topic, TopicNode, ResourceTopic, ResourceLevel } from '../lib/supabase';
import { useTopics } from './useTopics';
import Fuse from 'fuse.js';
import { blogPosts } from '../content/blog/posts';
import { useResponsiveItemsPerPage } from './useResponsiveItemsPerPage';

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

    const [includeSubtopics, setIncludeSubtopics] = useState(true);

    const itemsPerPage = useResponsiveItemsPerPage();

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

    const fuse = useMemo(() => {
        const options = {
            keys: [
                { name: 'title', weight: 0.7 },
                { name: 'description', weight: 0.3 },
                { name: 'topic_names', weight: 0.4 }
            ],
            threshold: 0.4, // 0.0 = perfect match, 1.0 = match anything
            ignoreLocation: true,
            includeScore: true
        };

        // Prepare data with flattened topics for searching
        const searchableData = resources.map(resource => ({
            ...resource,
            topic_names: (resourceTopics.get(resource.id) || []).map(t => t.topic_name)
        }));

        return new Fuse(searchableData, options);
    }, [resources, resourceTopics]);

    const blogFuse = useMemo(() => {
        const options = {
            keys: ['title', 'excerpt'],
            threshold: 0.4,
        };
        return new Fuse(blogPosts, options);
    }, []);

    const filteredResources = useMemo(() => {
        let baseResources = resources;

        if (searchQuery) {
            const fuseResults = fuse.search(searchQuery);
            // Map back to the original resource structure (though searchableData is compatible)
            baseResources = fuseResults.map(result => result.item as Resource);
        }

        return baseResources.filter((resource) => {
            if (selectedSubject) {
                if (resource.subject_id !== selectedSubject) {
                    return false;
                }
            }

            if (selectedTopics.length > 0) {
                const findTopicNames = (nodes: TopicNode[], ids: string[]): string[] => {
                    const names: string[] = [];
                    for (const node of nodes) {
                        if (ids.includes(node.id)) {
                            names.push(node.name);
                            // If including subtopics, add all descendants
                            if (includeSubtopics && node.children) {
                                const getAllDescendants = (children: TopicNode[]): string[] => {
                                    let descendants: string[] = [];
                                    for (const child of children) {
                                        descendants.push(child.name);
                                        if (child.children) {
                                            descendants = [...descendants, ...getAllDescendants(child.children)];
                                        }
                                    }
                                    return descendants;
                                };
                                names.push(...getAllDescendants(node.children));
                            }
                        }
                        // Continue searching down the tree even if parent wasn't selected (to find selected subtopics)
                        if (node.children) {
                            names.push(...findTopicNames(node.children, ids));
                        }
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

            return true;
        });
    }, [resources, selectedSubject, selectedTopics, selectedLevels, selectedLanguages, searchQuery, topicNodes, resourceTopics, resourceLevels, fuse, includeSubtopics]);

    const filteredBlogPosts = useMemo(() => {
        if (!searchQuery) return [];
        return blogFuse.search(searchQuery).map(result => result.item);
    }, [searchQuery, blogFuse]);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedSubject, selectedTopics, selectedLevels, selectedLanguages, searchQuery, includeSubtopics]);

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

    const indexOfLastResource = currentPage * itemsPerPage;
    const indexOfFirstResource = indexOfLastResource - itemsPerPage;
    const currentResources = sortedResources.slice(indexOfFirstResource, indexOfLastResource);
    const totalPages = Math.ceil(sortedResources.length / itemsPerPage);

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
        handlePageChange,
        includeSubtopics,
        setIncludeSubtopics,
        filteredBlogPosts
    };
}
