import { AddResourceModal } from '../AddResourceModal';
import { ResourceDetailModal } from '../ResourceDetailModal';
import { YouTubeSearchModal } from '../YouTubeSearchModal';
import { WikipediaSearchModal } from '../WikipediaSearchModal';
import { AiAssistant } from '../AiAssistant';
import { AdminPanelModal } from './AdminPanelModal';
import { Resource, Subject, Topic, Level } from '../../lib/supabase';

type TopicNode = {
    id: string;
    name: string;
    children?: TopicNode[];
};

type DashboardModalsProps = {
    isGuestMode: boolean;
    isModalOpen: boolean;
    handleCloseAddModal: () => void;
    refreshData: () => void;
    subjects: Subject[];
    allTopics: Topic[];
    levels: Level[];
    editingResource: Resource | null;
    prefilledResource: Partial<Resource> | null;
    isDetailModalOpen: boolean;
    handleCloseDetailModal: () => void;
    selectedResource: Resource | null;
    handleEditResource: (resource: Resource) => void;
    isYouTubeModalOpen: boolean;
    setIsYouTubeModalOpen: (isOpen: boolean) => void;
    searchQuery: string;
    handleYouTubeVideoAdd: (video: any) => void;
    isWikipediaModalOpen: boolean;
    setIsWikipediaModalOpen: (isOpen: boolean) => void;
    handleWikipediaArticleAdd: (article: any) => void;
    isAiAssistantOpen: boolean;
    setIsAiAssistantOpen: (isOpen: boolean) => void;
    aiInitialQuery: string;
    selectedSubject: string | null;
    selectedTopics: string[];
    topicNodes: TopicNode[];
    selectedLevels: string[];
    selectedLanguages: string[];
    showAdminPanel: boolean;
    setShowAdminPanel: (isOpen: boolean) => void;
    userRole: string | null;
};

export function DashboardModals({
    isGuestMode,
    isModalOpen,
    handleCloseAddModal,
    refreshData,
    subjects,
    allTopics,
    levels,
    editingResource,
    prefilledResource,
    isDetailModalOpen,
    handleCloseDetailModal,
    selectedResource,
    handleEditResource,
    isYouTubeModalOpen,
    setIsYouTubeModalOpen,
    searchQuery,
    handleYouTubeVideoAdd,
    isWikipediaModalOpen,
    setIsWikipediaModalOpen,
    handleWikipediaArticleAdd,
    isAiAssistantOpen,
    setIsAiAssistantOpen,
    aiInitialQuery,
    selectedSubject,
    selectedTopics,
    topicNodes,
    selectedLevels,
    selectedLanguages,
    showAdminPanel,
    setShowAdminPanel,
    userRole
}: DashboardModalsProps) {

    const findTopicNames = (nodes: TopicNode[], ids: string[]): string[] => {
        const names: string[] = [];
        for (const node of nodes) {
            if (ids.includes(node.id)) names.push(node.name);
            if (node.children) names.push(...findTopicNames(node.children, ids));
        }
        return names;
    };

    return (
        <>
            {!isGuestMode && (
                <AddResourceModal
                    isOpen={isModalOpen}
                    onClose={handleCloseAddModal}
                    onSuccess={refreshData}
                    subjects={subjects}
                    topics={allTopics}
                    levels={levels}
                    initialData={editingResource}
                    prefillData={prefilledResource}
                />
            )}

            <ResourceDetailModal
                isOpen={isDetailModalOpen}
                onClose={handleCloseDetailModal}
                resource={selectedResource}
                onResourceUpdated={refreshData}
                isGuestMode={isGuestMode}
                onEdit={handleEditResource}
            />

            <YouTubeSearchModal
                isOpen={isYouTubeModalOpen}
                onClose={() => setIsYouTubeModalOpen(false)}
                initialQuery={searchQuery}
                onAddVideo={handleYouTubeVideoAdd}
                isGuestMode={isGuestMode}
            />

            <WikipediaSearchModal
                isOpen={isWikipediaModalOpen}
                onClose={() => setIsWikipediaModalOpen(false)}
                initialQuery={searchQuery}
                onAddArticle={handleWikipediaArticleAdd}
                isGuestMode={isGuestMode}
            />

            <AiAssistant
                isOpen={isAiAssistantOpen}
                onToggle={setIsAiAssistantOpen}
                initialQuery={aiInitialQuery}
                selectedSubject={subjects.find(s => s.subject_id === selectedSubject) || null}
                selectedTopics={findTopicNames(topicNodes, selectedTopics)}
                selectedLevels={selectedLevels.map(levelId => {
                    const level = levels.find(l => l.id === levelId);
                    return level ? level.name : levelId;
                })}
                selectedLanguages={selectedLanguages}
                currentResource={selectedResource}
            />

            <AdminPanelModal
                isOpen={showAdminPanel}
                onClose={() => setShowAdminPanel(false)}
                userRole={userRole || ''}
                onDataChange={refreshData}
            />
        </>
    );
}
