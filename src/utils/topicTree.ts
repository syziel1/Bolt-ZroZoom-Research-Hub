import { Topic, TopicNode } from '../lib/supabase';

/**
 * Builds a hierarchical tree of topics from a flat list of topics.
 * 
 * @param rows - The flat list of Topic objects from the database.
 * @returns An array of root TopicNodes, each containing their children.
 */
export function buildTopicTree(rows: Topic[]): TopicNode[] {
    const nodeMap = new Map<string, TopicNode>();
    const roots: TopicNode[] = [];

    // First pass: Create nodes and map them by ID
    rows.forEach((row) => {
        nodeMap.set(row.id, { ...row, children: [] });
    });

    // Second pass: Connect children to parents
    rows.forEach((row) => {
        const node = nodeMap.get(row.id);
        if (!node) return;

        if (row.parent_topic_id) {
            const parent = nodeMap.get(row.parent_topic_id);
            if (parent) {
                parent.children.push(node);
            } else {
                // If parent is missing (shouldn't happen with referential integrity), treat as root or log warning
                console.warn(`Parent topic ${row.parent_topic_id} not found for topic ${row.id}`);
                roots.push(node);
            }
        } else {
            roots.push(node);
        }
    });

    // Helper to sort nodes by order_index
    const sortNodes = (nodes: TopicNode[]) => {
        nodes.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
        nodes.forEach((node) => {
            if (node.children.length > 0) {
                sortNodes(node.children);
            }
        });
    };

    sortNodes(roots);

    return roots;
}
