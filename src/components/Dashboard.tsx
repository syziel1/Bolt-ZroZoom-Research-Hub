import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, Resource } from '../lib/supabase';
import { Sidebar } from './Sidebar';
import { AddResourceModal } from './AddResourceModal';
import { ResourceDetailModal } from './ResourceDetailModal';
import { AdminPanel } from './AdminPanel';
import { LogOut } from 'lucide-react';
import { YouTubeSearchModal } from './YouTubeSearchModal';
import { useDashboardData } from '../hooks/useDashboardData';
import { useDashboardFilters } from '../hooks/useDashboardFilters';
import { DashboardHeader } from './DashboardHeader';
import { DashboardGrid } from './DashboardGrid';
import { AiAssistant } from './AiAssistant';

type DashboardProps = {
  isGuestMode?: boolean;
};

export function Dashboard({ isGuestMode: propIsGuestMode = false }: DashboardProps) {
  const navigate = useNavigate();

  // Check auth session (simplified as it was in original, but could be moved to a context)
  const [session, setSession] = useState<any>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const isGuestMode = sessionChecked ? !session : propIsGuestMode;

  // Ideally this session check should be in a higher level provider, but keeping it here for now to minimize scope creep
  useState(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setSessionChecked(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setSessionChecked(true);
    });

    return () => subscription.unsubscribe();
  });

  const {
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
    refreshData
  } = useDashboardData(isGuestMode);

  const {
    selectedSubject,
    selectedTopics,
    selectedLevels,
    selectedLanguages,
    searchQuery,
    setSearchQuery,
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
  } = useDashboardFilters({
    resources,
    subjects,
    allTopics,
    resourceTopics,
    resourceLevels
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);

  // YouTube Integration State
  const [isYouTubeModalOpen, setIsYouTubeModalOpen] = useState(false);
  const [prefilledResource, setPrefilledResource] = useState<Partial<Resource> | null>(null);

  // AI Assistant State
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [aiInitialQuery, setAiInitialQuery] = useState('');

  const handleAskAi = (query: string) => {
    setAiInitialQuery(query);
    setIsAiAssistantOpen(true);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const handleTopicClick = (topicName: string) => {
    console.log('Topic clicked:', topicName);
  };

  const handleCardClick = (resource: Resource) => {
    setSelectedResource(resource);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedResource(null);
  };

  const handleEditResource = (resource: Resource) => {
    setEditingResource(resource);
    setIsDetailModalOpen(false);
    setIsModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsModalOpen(false);
    setEditingResource(null);
    setPrefilledResource(null);
  };

  const handleYouTubeVideoAdd = (video: any) => {
    setIsYouTubeModalOpen(false);
    setPrefilledResource({
      title: video.title,
      url: video.url,
      type: 'video',
      description: `${video.description}\n\n[Czas trwania: ${video.duration}]`,
      thumbnail_url: video.thumbnailUrl,
      language: 'pl' // Default to PL, user can change
    });
    setIsModalOpen(true);
  };

  const languages = useMemo(() => {
    const langs = new Set(resources.map((r) => r.language).filter(Boolean));
    return Array.from(langs) as string[];
  }, [resources]);

  const recentlyAddedResources = useMemo(() => {
    const sorted = [...resources].sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA;
    });
    return sorted.slice(0, 3);
  }, [resources]);

  const isAdmin = userRole === 'admin';

  if (showAdminPanel && isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-4 md:px-8 py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Szkoła Przyszłości z AI</h1>
            <div className="flex items-center gap-2 md:gap-4">
              <button
                onClick={() => setShowAdminPanel(false)}
                className="text-blue-600 hover:text-blue-800 flex items-center gap-2 text-sm md:text-base"
              >
                <span className="hidden md:inline">Powrót do pulpitu</span>
                <span className="md:hidden">Powrót</span>
              </button>
              <button
                onClick={handleSignOut}
                className="text-gray-600 hover:text-gray-900 flex items-center gap-2 text-sm md:text-base"
              >
                <LogOut size={20} />
                <span className="hidden md:inline">Wyloguj się</span>
              </button>
            </div>
          </div>
        </div>
        <AdminPanel userRole={userRole} requireAdmin={true} onDataChange={refreshData} />
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
          onEdit={handleEditResource}
          onResourceUpdated={refreshData}
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

  return (
    <div className="flex h-screen bg-gray-50">

      <Sidebar
        subjects={subjects}
        topicNodes={topicNodes}
        levels={levels}
        languages={languages}
        selectedSubject={selectedSubject}
        selectedTopics={selectedTopics}
        selectedLevels={selectedLevels}
        selectedLanguages={selectedLanguages}
        onSubjectChange={handleSubjectChange}
        onTopicToggle={handleTopicToggle}
        onLevelToggle={handleLevelToggle}
        onLanguageToggle={handleLanguageToggle}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isLoading={topicsLoading}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader
          isGuestMode={isGuestMode}
          userNick={userNick}
          userName={userName}
          userRole={userRole}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onSignOut={handleSignOut}
          onOpenAdmin={() => setShowAdminPanel(true)}
          onOpenAddResource={() => setIsModalOpen(true)}
          onOpenYouTube={() => setIsYouTubeModalOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {isGuestMode && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900 mb-1">Przeglądasz jako gość</h3>
                  <p className="text-sm text-blue-700">
                    Zaloguj się, aby dodawać własne materiały, oceniać zasoby i mieć dostęp do dodatkowych funkcji.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/auth')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm whitespace-nowrap"
                >
                  Zarejestruj się
                </button>
              </div>
            </div>
          )}

          <DashboardGrid
            loading={loading}
            filteredResources={filteredResources}
            sortedResources={sortedResources}
            currentResources={currentResources}
            resourceTopics={resourceTopics}
            resourceLevels={resourceLevels}
            hasActiveFilters={hasActiveFilters}
            recentlyAddedResources={recentlyAddedResources}
            sortBy={sortBy}
            setSortBy={setSortBy}
            currentPage={currentPage}
            totalPages={totalPages}
            indexOfFirstResource={indexOfFirstResource}
            indexOfLastResource={indexOfLastResource}
            onPageChange={handlePageChange}
            onTopicClick={handleTopicClick}
            onCardClick={handleCardClick}
            searchQuery={searchQuery}
            onAskAi={handleAskAi}
          />

          <footer className="mt-12 pt-8 border-t border-gray-200">
            <div className="text-center text-sm text-gray-600">
              <p className="mb-2">Szkoła Przyszłości z AI - Twoja baza wiedzy edukacyjnej</p>
              <div className="flex justify-center gap-4 mb-2 text-xs text-gray-500">
                <button onClick={() => navigate('/o-nas')} className="hover:text-gray-700 transition-colors">O nas</button>
                <button onClick={() => navigate('/polityka-prywatnosci')} className="hover:text-gray-700 transition-colors">Polityka Prywatności</button>
              </div>
              <p className="text-xs text-gray-500">
                © {new Date().getFullYear()} Sylwester Zieliński. All rights reserved
              </p>
            </div>
          </footer>
        </main>
      </div >

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
      )
      }

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
      <AiAssistant
        isOpen={isAiAssistantOpen}
        onToggle={setIsAiAssistantOpen}
        initialQuery={aiInitialQuery}
      />
    </div>
  );
}
