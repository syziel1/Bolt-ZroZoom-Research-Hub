import { useState, useEffect, useCallback } from 'react';
import { supabase, Resource, Subject, Level, Topic, ResourceTopic, ResourceLevel } from '../lib/supabase';

export type RatingData = {
    resource_id: string;
    rating_usefulness: number;
    rating_correctness: number;
};

export type CommentData = {
    resource_id: string;
};

type RatingsStats = Map<string, { count: number; sumUsefulness: number; sumCorrectness: number }>;
type CommentsCounts = Map<string, number>;

function attachResourceStats(
    resourcesData: Resource[],
    ratingsStats: RatingsStats,
    commentsCounts: CommentsCounts,
    nickMap?: Map<string, string>
): Resource[] {
    return resourcesData.map(r => {
        const stats = ratingsStats.get(r.id);
        const commentsCount = commentsCounts.get(r.id) || 0;

        return {
            ...r,
            ...(nickMap && { contributor_nick: r.contributor_nick || nickMap.get(r.contributor_id!) || 'Anonim' }),
            ratings_count: stats ? stats.count : 0,
            avg_usefulness: stats ? stats.sumUsefulness / stats.count : null,
            avg_correctness: stats ? stats.sumCorrectness / stats.count : null,
            comments_count: commentsCount
        };
    });
}

export type ResourceTopicData = {
    resource_id: string;
    topic_id: string;
    topic_name: string;
    topic_slug: string;
    parent_topic_id: string | null;
    subject_slug: string;
};

export type ResourceLevelData = {
    resource_id: string;
    levels: ResourceLevel[];
};

export function useDashboardData(isGuestMode: boolean) {
    const [resources, setResources] = useState<Resource[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [levels, setLevels] = useState<Level[]>([]);
    const [allTopics, setAllTopics] = useState<Topic[]>([]);
    const [loading, setLoading] = useState(true);
    const [resourceTopics, setResourceTopics] = useState<Map<string, ResourceTopic[]>>(new Map());
    const [resourceLevels, setResourceLevels] = useState<Map<string, ResourceLevel[]>>(new Map());
    const [userNick, setUserNick] = useState('');
    const [userName, setUserName] = useState('');
    const [userRole, setUserRole] = useState('');

    const loadUserProfile = useCallback(async () => {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('nick, name, role')
                .eq('id', user.id)
                .single();
            setUserNick(profile?.nick || user.email?.split('@')[0] || 'Użytkownik');
            setUserName(profile?.name || '');
            setUserRole(profile?.role || '');
        }
    }, []);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [resourcesRes, subjectsRes, levelsRes, topicsRes, ratingsRes, commentsRes] = await Promise.all([
                supabase.from('v_resources_full').select('*'),
                supabase.from('v_subjects_basic').select('*').order('order_index'),
                supabase.from('levels').select('*').order('order_index'),
                supabase.from('topics').select('*').order('order_index'),
                supabase.from('ratings').select('resource_id, rating_usefulness, rating_correctness'),
                supabase.from('comments').select('resource_id')
            ]);

            if (resourcesRes.data) {
                let resourcesData = resourcesRes.data;

                // Calculate ratings stats
                const ratingsStats = new Map<string, { count: number; sumUsefulness: number; sumCorrectness: number }>();
                if (ratingsRes.data) {
                    (ratingsRes.data as RatingData[]).forEach((r) => {
                        if (!ratingsStats.has(r.resource_id)) {
                            ratingsStats.set(r.resource_id, { count: 0, sumUsefulness: 0, sumCorrectness: 0 });
                        }
                        const stats = ratingsStats.get(r.resource_id)!;
                        stats.count++;
                        stats.sumUsefulness += r.rating_usefulness;
                        stats.sumCorrectness += r.rating_correctness;
                    });
                }

                // Calculate comments counts
                const commentsCounts = new Map<string, number>();
                if (commentsRes.data) {
                    (commentsRes.data as CommentData[]).forEach((c) => {
                        const count = commentsCounts.get(c.resource_id) || 0;
                        commentsCounts.set(c.resource_id, count + 1);
                    });
                }

                // Manual fetch of contributor nicks if missing or just to be safe
                const contributorIds = [...new Set(resourcesData.map(r => r.contributor_id).filter(Boolean))];

                if (contributorIds.length > 0) {
                    const { data: profiles } = await supabase
                        .from('profiles')
                        .select('id, nick')
                        .in('id', contributorIds);

                    if (profiles) {
                        const nickMap = new Map(profiles.map(p => [p.id, p.nick]));
                        resourcesData = attachResourceStats(resourcesData, ratingsStats, commentsCounts, nickMap);
                    } else {
                        // Even if profiles fail, we still want to attach stats
                        resourcesData = attachResourceStats(resourcesData, ratingsStats, commentsCounts);
                    }
                } else {
                    // No contributors to fetch, but still attach stats
                    resourcesData = attachResourceStats(resourcesData, ratingsStats, commentsCounts);
                }

                setResources(resourcesData);
            }
            if (subjectsRes.data) setSubjects(subjectsRes.data);
            if (levelsRes.data) setLevels(levelsRes.data);
            if (topicsRes.data) setAllTopics(topicsRes.data);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadResourceTopics = useCallback(async (resourceIds: string[]) => {
        if (resourceIds.length === 0) return;

        const { data } = await supabase
            .from('v_resource_topics')
            .select('resource_id, topic_id, topic_name, topic_slug, parent_topic_id, subject_slug')
            .in('resource_id', resourceIds);

        if (data) {
            const topicsMap = new Map<string, ResourceTopic[]>();
            (data as ResourceTopicData[]).forEach((item) => {
                const { resource_id, ...topicData } = item;
                if (!topicsMap.has(resource_id)) {
                    topicsMap.set(resource_id, []);
                }
                topicsMap.get(resource_id)!.push(topicData);
            });
            setResourceTopics(topicsMap);
        }
    }, []);

    const loadResourceLevels = useCallback(async (resourceIds: string[]) => {
        if (resourceIds.length === 0) return;

        const { data } = await supabase
            .from('v_resource_levels')
            .select('resource_id, levels')
            .in('resource_id', resourceIds);

        if (data) {
            const levelsMap = new Map<string, ResourceLevel[]>();
            (data as ResourceLevelData[]).forEach((item) => {
                if (item.levels && Array.isArray(item.levels)) {
                    levelsMap.set(item.resource_id, item.levels);
                }
            });
            setResourceLevels(levelsMap);
        }
    }, []);

    useEffect(() => {
        loadData();
        if (!isGuestMode) {
            loadUserProfile();
        }
    }, [isGuestMode, loadData, loadUserProfile]);

    useEffect(() => {
        if (resources.length > 0) {
            const resourceIds = resources.map(r => r.id);
            loadResourceTopics(resourceIds);
            loadResourceLevels(resourceIds);
        }
    }, [resources, loadResourceTopics, loadResourceLevels]);

    return {
        resources,
        subjects,
        levels,
        allTopics,
        loading,
        resourceTopics,
        resourceLevels,
        userNick,
        userName,
        userRole,
        refreshData: loadData
    };
}
