import { render, screen, fireEvent } from '@testing-library/react';
import { TopicTree } from '../TopicTree';
import { describe, it, expect, vi } from 'vitest';
import { TopicNode } from '../../lib/supabase';

const mockNodes: TopicNode[] = [
    {
        id: '1',
        name: 'Matematyka',
        slug: 'matematyka',
        subject_id: 'subject-1',
        parent_topic_id: null,
        order_index: 1,
        children: [
            {
                id: '2',
                name: 'Algebra',
                slug: 'algebra',
                subject_id: 'subject-1',
                parent_topic_id: '1',
                order_index: 1,
                children: []
            }
        ]
    },
    {
        id: '3',
        name: 'Fizyka',
        slug: 'fizyka',
        subject_id: 'subject-2',
        parent_topic_id: null,
        order_index: 2,
        children: []
    }
];

describe('TopicTree', () => {
    it('renders topics correctly', () => {
        render(
            <TopicTree
                nodes={mockNodes}
                selectedTopics={[]}
                onTopicToggle={() => { }}
            />
        );

        expect(screen.getByText('Matematyka')).toBeInTheDocument();
        expect(screen.getByText('Fizyka')).toBeInTheDocument();
    });

    it('handles topic selection', () => {
        const handleToggle = vi.fn();
        render(
            <TopicTree
                nodes={mockNodes}
                selectedTopics={[]}
                onTopicToggle={handleToggle}
            />
        );

        fireEvent.click(screen.getByText('Matematyka'));
        expect(handleToggle).toHaveBeenCalledWith('1');
    });

    it('expands children on click', () => {
        render(
            <TopicTree
                nodes={mockNodes}
                selectedTopics={[]}
                onTopicToggle={() => { }}
            />
        );

        // Algebra should not be visible initially (if we assume collapsed by default, but the component logic might differ)
        // Looking at component: children are rendered only if isExpanded is true.
        // And isExpanded is false by default.

        expect(screen.queryByText('Algebra')).not.toBeInTheDocument();

        // Click expand button
        const expandButton = screen.getByLabelText('Expand Matematyka');
        fireEvent.click(expandButton);

        expect(screen.getByText('Algebra')).toBeInTheDocument();
    });
});
