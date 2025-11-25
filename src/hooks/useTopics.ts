import { useState, useEffect } from 'react';
import { supabase, TopicNode, TopicRow } from '../lib/supabase';
import { buildTopicTree } from '../utils/topicTree';

export function useTopics(subjectId: string | null) {
    const [topics, setTopics] = useState<TopicNode[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!subjectId) {
            setTopics([]);
            setLoading(false);
            setError(null);
            return;
        }

        const fetchTopics = async () => {
            setLoading(true);
            setError(null);
            try {
                const { data, error } = await supabase
                    .from('topics')
                    .select('*')
                    .eq('subject_id', subjectId)
                    .order('order_index');

                if (error) throw error;

                const tree = buildTopicTree(data as TopicRow[]);
                setTopics(tree);
            } catch (err: any) {
                console.error('Error fetching topics:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTopics();
    }, [subjectId]);

    return { topics, loading, error };
}
