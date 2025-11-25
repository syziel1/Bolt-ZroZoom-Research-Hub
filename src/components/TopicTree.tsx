import { useState } from 'react';
import { TopicNode } from '../lib/supabase';
import { ChevronDown, ChevronRight } from 'lucide-react';

type TopicTreeProps = {
    nodes: TopicNode[];
    selectedTopics: string[];
    onTopicToggle: (topicId: string) => void;
};

type TopicItemProps = {
    node: TopicNode;
    selectedTopics: string[];
    onTopicToggle: (topicId: string) => void;
    level?: number;
};

function TopicItem({ node, selectedTopics, onTopicToggle, level = 0 }: TopicItemProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = selectedTopics.includes(node.id);

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsExpanded(!isExpanded);
    };

    return (
        <div className="select-none">
            <div
                className={`flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-100 cursor-pointer ${isSelected ? 'bg-blue-50' : ''
                    }`}
                style={{ marginLeft: `${level * 16}px` }}
                onClick={() => onTopicToggle(node.id)}
            >
                <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
                    {hasChildren && (
                        <button
                            onClick={handleToggle}
                            className="text-gray-500 hover:text-gray-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
                            aria-label={isExpanded ? `Collapse ${node.name}` : `Expand ${node.name}`}
                            aria-expanded={isExpanded}
                        >
                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onTopicToggle(node.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <span className={`text-sm truncate ${isSelected ? 'text-blue-700 font-medium' : 'text-gray-700'}`}>
                        {node.name}
                    </span>
                </div>
            </div>

            {hasChildren && isExpanded && (
                <div className="mt-0.5">
                    {node.children.map((child) => (
                        <TopicItem
                            key={child.id}
                            node={child}
                            selectedTopics={selectedTopics}
                            onTopicToggle={onTopicToggle}
                            level={level + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export function TopicTree({ nodes, selectedTopics, onTopicToggle }: TopicTreeProps) {
    if (nodes.length === 0) {
        return <div className="text-sm text-gray-500 px-4 py-2">Brak tematów dla tego przedmiotu</div>;
    }

    return (
        <div className="space-y-0.5">
            {nodes.map((node) => (
                <TopicItem
                    key={node.id}
                    node={node}
                    selectedTopics={selectedTopics}
                    onTopicToggle={onTopicToggle}
                />
            ))}
        </div>
    );
}
