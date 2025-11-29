import { LogOut } from 'lucide-react';
import { AdminPanel } from '../AdminPanel';
import { AddResourceModal } from '../AddResourceModal';
import { ResourceDetailModal } from '../ResourceDetailModal';
import { YouTubeSearchModal } from '../YouTubeSearchModal';
import { Resource, Subject, Topic, Level } from '../../lib/supabase';

type AdminViewProps = {
    userRole: string | null;
    onClose: () => void;
    onSignOut: () => void;
    refreshData: () => void;
    isModalOpen: boolean;
    handleCloseAddModal: () => void;
    subjects: Subject[];
    allTopics: Topic[];
    levels: Level[];
    editingResource: Resource | null;
    prefilledResource: Partial<Resource> | null;
    isDetailModalOpen: boolean;
    handleCloseDetailModal: () => void;
    selectedResource: Resource | null;
    isGuestMode: boolean;
    handleEditResource: (resource: Resource) => void;
    isYouTubeModalOpen: boolean;
    setIsYouTubeModalOpen: (isOpen: boolean) => void;
    searchQuery: string;
    handleYouTubeVideoAdd: (video: any) => void;
};

export function AdminView({
    userRole,
    onClose,
    onSignOut,
    refreshData,
    isModalOpen,
    handleCloseAddModal,
    subjects,
    allTopics,
    levels,
    editingResource,
    prefilledResource,
    isDetailModalOpen,
    handleCloseDetailModal,
    selectedResource,
    isGuestMode,
    handleEditResource,
    isYouTubeModalOpen,
    setIsYouTubeModalOpen,
    searchQuery,
    handleYouTubeVideoAdd
}: AdminViewProps) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
            <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-4 md:px-8 py-4">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">Szkoła Przyszłości z AI</h1>
                    <div className="flex items-center gap-2 md:gap-4">
                        <button
                            onClick={onClose}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-2 text-sm md:text-base"
                        >
                            <span className="hidden md:inline">Powrót do pulpitu</span>
                            <span className="md:hidden">Powrót</span>
                        </button>
                        <button
                            onClick={onSignOut}
                            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 flex items-center gap-2 text-sm md:text-base"
                        >
                            <LogOut size={20} />
                            <span className="hidden md:inline">Wyloguj się</span>
                        </button>
                    </div>
                </div>
            </div>
            <AdminPanel userRole={userRole || ''} requireAdmin={true} onDataChange={refreshData} />
            <AddResourceModal
                isOpen={isModalOpen}
                onClose={handleCloseAddModal}
                onSuccess={() => {
                    handleCloseAddModal();
                    refreshData();
                }}
                subjects={subjects}
                topics={allTopics}
                levels={levels}
                initialData={editingResource}
                prefillData={prefilledResource}
            />
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
        </div>
    );
}
