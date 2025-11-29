import { useState } from 'react';
import { SubjectsManager } from './SubjectsManager';
import { TopicTreeManager } from './TopicTreeManager';
import { LevelsManager } from './LevelsManager';
import { CommentsManager } from './CommentsManager';
import { BookOpen, Tag, BarChart3, MessageSquare } from 'lucide-react';

type Tab = 'subjects' | 'topics' | 'levels' | 'comments';

type AdminPanelProps = {
    userRole: string;
    requireAdmin: boolean;
    onDataChange?: () => void;
};

export function AdminPanel({ userRole, requireAdmin, onDataChange }: AdminPanelProps) {
    const [activeTab, setActiveTab] = useState<Tab>('subjects');

    if (requireAdmin && userRole !== 'admin') {
        return <div className="p-8 text-center text-red-600">Brak uprawnień administratora.</div>;
    }

    const tabs = [
        { id: 'subjects' as Tab, name: 'Przedmioty', icon: BookOpen },
        { id: 'topics' as Tab, name: 'Tematy', icon: Tag },
        { id: 'levels' as Tab, name: 'Poziomy', icon: BarChart3 },
        { id: 'comments' as Tab, name: 'Komentarze', icon: MessageSquare },
    ];

    return (
        <div className="h-full flex flex-col">
            <div className="mb-6">
                <nav className="-mb-px flex space-x-8 border-b border-gray-200 dark:border-slate-700">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                  flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-slate-600'
                                    }
                `}
                            >
                                <Icon size={20} />
                                {tab.name}
                            </button>
                        );
                    })}
                </nav>
            </div>

            <div className="flex-1">
                {activeTab === 'subjects' && <SubjectsManager />}
                {activeTab === 'topics' && <TopicTreeManager />}
                {activeTab === 'levels' && <LevelsManager />}
                {activeTab === 'comments' && <CommentsManager onCommentDeleted={onDataChange} />}
            </div>
        </div>
    );
}
