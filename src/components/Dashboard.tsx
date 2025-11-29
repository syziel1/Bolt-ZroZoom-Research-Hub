import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase, Resource } from '../lib/supabase';
import { logger } from '../lib/logger';
import { Sidebar } from './Sidebar';
import { useDashboardData } from '../hooks/useDashboardData';
import { useDashboardFilters } from '../hooks/useDashboardFilters';
import { useFavorites } from '../hooks/useFavorites';
import { useResponsiveItemsPerPage } from '../hooks/useResponsiveItemsPerPage';
import { DashboardHeader } from './DashboardHeader';
import { DashboardGrid } from './DashboardGrid';
import { Footer } from './Footer';
import { SEO } from './SEO';

import { DashboardModals } from './dashboard/DashboardModals';
import type { Session } from '@supabase/supabase-js';

type YouTubeVideo = {
  title: string;
  url: string;
  description: string;
  duration: string;
  thumbnailUrl: string;
};

type WikipediaArticle = {
  title: string;
  url: string;
  description: string;
  thumbnailUrl: string | null;
};



type DashboardProps = {
  isGuestMode?: boolean;
};

export function Dashboard({ isGuestMode: propIsGuestMode = false }: DashboardProps) {
  const navigate = useNavigate();
  const routerLocation = useLocation();

  // Check auth session
  const [session, setSession] = useState<Session | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const isGuestMode = sessionChecked ? !session : propIsGuestMode;

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
    sortedResources,
    topicNodes,
    topicsLoading,
    hasActiveFilters,
    handleSubjectChange,
    handleTopicToggle,
    handleLevelToggle,
    handleLanguageToggle,
    handlePageChange,
    includeSubtopics,
    setIncludeSubtopics,
    filteredBlogPosts
  } = useDashboardFilters({
    resources,
    subjects,
    allTopics,
    resourceTopics,
    resourceLevels
  });

  // Favorites functionality
  const { isFavorite, toggleFavorite, isLoggedIn, favoritesCount } = useFavorites();
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [showOnlyRated, setShowOnlyRated] = useState(false);
  const [showOnlyMine, setShowOnlyMine] = useState(false);
  const [ratedResourceIds, setRatedResourceIds] = useState<Set<string>>(new Set());

  // Parse URL query params for filters and resource sharing
  useEffect(() => {
    const params = new URLSearchParams(routerLocation.search);

    // Handle resource sharing (?r=RESOURCE_ID)
    const resourceId = params.get('r');
    if (resourceId) {
      // First check if resource is already loaded
      const foundResource = resources.find(r => r.id === resourceId);
      if (foundResource) {
        setSelectedResource(foundResource);
        setIsDetailModalOpen(true);
      } else {
        // If not found (e.g. pagination), fetch it specifically
        supabase
          .from('v_resources_full')
          .select('*')
          .eq('id', resourceId)
          .single()
          .then(({ data, error }) => {
            if (data && !error) {
              setSelectedResource(data as Resource);
              setIsDetailModalOpen(true);
            }
          });
      }
    }

    // Handle filters
    if (params.get('favorites') === 'true') {
      setShowOnlyFavorites(true);
      setShowOnlyRated(false);
      setShowOnlyMine(false);
    } else if (params.get('rated') === 'true') {
      setShowOnlyRated(true);
      setShowOnlyFavorites(false);
      setShowOnlyMine(false);
    } else if (params.get('mine') === 'true') {
      setShowOnlyMine(true);
      setShowOnlyFavorites(false);
      setShowOnlyRated(false);
    }
  }, [routerLocation.search, resources]); // Add resources dependency to retry if loaded later

  useEffect(() => {
    if (session?.user?.id) {
      supabase
        .from('ratings')
        .select('resource_id')
        .eq('author_id', session.user.id)
        .then(({ data }) => {
          if (data) {
            setRatedResourceIds(new Set(data.map(r => r.resource_id)));
          }
        });
    }
  }, [session]);

  // Apply filters on top of existing filters
  const finalFilteredResources = useMemo(() => {
    let result = sortedResources;

    if (showOnlyFavorites) {
      result = result.filter(resource => isFavorite(resource.id));
    }

    if (showOnlyRated) {
      result = result.filter(resource => ratedResourceIds.has(resource.id));
    }

    if (showOnlyMine) {
      if (session?.user?.id) {
        result = result.filter(resource => resource.contributor_id === session.user.id);
      }
    }

    return result;
  }, [sortedResources, showOnlyFavorites, showOnlyRated, showOnlyMine, isFavorite, session, ratedResourceIds]);

  // Pagination for finalFilteredResources
  const itemsPerPage = useResponsiveItemsPerPage();
  const totalFilteredPages = Math.ceil(finalFilteredResources.length / itemsPerPage);
  const currentFilteredPage = Math.min(currentPage, Math.max(1, totalFilteredPages));

  const indexOfLastFilteredResource = currentFilteredPage * itemsPerPage;
  const indexOfFirstFilteredResource = indexOfLastFilteredResource - itemsPerPage;
  const currentFilteredResources = finalFilteredResources.slice(indexOfFirstFilteredResource, indexOfLastFilteredResource);

  // Reset page when local filters change
  useEffect(() => {
    handlePageChange(1);
  }, [showOnlyFavorites, showOnlyRated, showOnlyMine, handlePageChange]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);

  // YouTube Integration State
  const [isYouTubeModalOpen, setIsYouTubeModalOpen] = useState(false);
  const [isWikipediaModalOpen, setIsWikipediaModalOpen] = useState(false);
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
    logger.log('Topic clicked:', topicName);
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

  const handleYouTubeVideoAdd = (video: YouTubeVideo) => {
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

  const handleWikipediaArticleAdd = (article: WikipediaArticle) => {
    setIsWikipediaModalOpen(false);
    setPrefilledResource({
      title: article.title,
      url: article.url,
      type: 'article',
      description: article.description,
      thumbnail_url: article.thumbnailUrl ?? undefined,
      language: 'pl'
    });
    setIsModalOpen(true);
  };

  const languages = useMemo(() => {
    const langs = new Set(resources.map((r) => r.language).filter(Boolean));
    return Array.from(langs) as string[];
  }, [resources]);


  const isAdmin = userRole === 'admin';

  if (showAdminPanel && isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-4 md:px-8 py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">Szkoła Przyszłości z AI</h1>
            <div className="flex items-center gap-2 md:gap-4">
              <button
                onClick={() => setShowAdminPanel(false)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-2 text-sm md:text-base"
              >
                <span className="hidden md:inline">Powrót do pulpitu</span>
                <span className="md:hidden">Powrót</span>
              </button>
              <button
                onClick={handleSignOut}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 flex items-center gap-2 text-sm md:text-base"
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

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-900">
      <SEO
        title="Pulpit - Przeglądaj zasoby"
        description="Przeglądaj tysiące materiałów edukacyjnych, filtruj po przedmiotach i poziomach. Dołącz do społeczności Szkoły Przyszłości z AI."
      />
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
        includeSubtopics={includeSubtopics}
        onIncludeSubtopicsChange={setIncludeSubtopics}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        resources={resources}
        onResourceSelect={(resource: { id: string; title: string }) => {
          navigate(`/zasoby?r=${resource.id}`);
        }}
        onOpenYouTube={() => setIsYouTubeModalOpen(true)}
        onOpenWikipedia={() => setIsWikipediaModalOpen(true)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader
          isGuestMode={isGuestMode}
          userRole={userRole}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onSignOut={handleSignOut}
          onOpenAdmin={() => setShowAdminPanel(true)}
          onOpenAddResource={() => setIsModalOpen(true)}
          showOnlyFavorites={showOnlyFavorites}
          onFavoritesToggle={() => setShowOnlyFavorites(!showOnlyFavorites)}
          favoritesCount={favoritesCount}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-8">


          <DashboardGrid
            loading={loading}
            filteredResources={finalFilteredResources}
            sortedResources={finalFilteredResources}
            currentResources={currentFilteredResources}
            resourceTopics={resourceTopics}
            resourceLevels={resourceLevels}
            hasActiveFilters={hasActiveFilters || showOnlyFavorites}
            sortBy={sortBy}
            setSortBy={setSortBy}
            currentPage={currentFilteredPage}
            totalPages={totalFilteredPages}
            indexOfFirstResource={indexOfFirstFilteredResource}
            indexOfLastResource={indexOfLastFilteredResource}
            onPageChange={handlePageChange}
            onTopicClick={handleTopicClick}
            onCardClick={handleCardClick}
            searchQuery={searchQuery}
            onAskAi={handleAskAi}
            isFavorite={isFavorite}
            onFavoriteToggle={toggleFavorite}
            isLoggedIn={!isGuestMode && isLoggedIn}
            filteredBlogPosts={filteredBlogPosts}
            subjects={subjects}
            topics={topicNodes}
            levels={levels}
            selectedSubject={selectedSubject}
            selectedTopics={selectedTopics}
            selectedLevels={selectedLevels}
            selectedLanguages={selectedLanguages}
            onSubjectChange={handleSubjectChange}
            onTopicToggle={handleTopicToggle}
            onLevelToggle={handleLevelToggle}
            onLanguageToggle={handleLanguageToggle}
            setSearchQuery={setSearchQuery}
          />

          <Footer className="mt-12" />
        </main>
      </div>

      <DashboardModals
        isGuestMode={isGuestMode}
        isModalOpen={isModalOpen}
        handleCloseAddModal={handleCloseAddModal}
        refreshData={refreshData}
        subjects={subjects}
        allTopics={allTopics}
        levels={levels}
        editingResource={editingResource}
        prefilledResource={prefilledResource}
        isDetailModalOpen={isDetailModalOpen}
        handleCloseDetailModal={handleCloseDetailModal}
        selectedResource={selectedResource}
        handleEditResource={handleEditResource}
        isYouTubeModalOpen={isYouTubeModalOpen}
        setIsYouTubeModalOpen={setIsYouTubeModalOpen}
        searchQuery={searchQuery}
        handleYouTubeVideoAdd={handleYouTubeVideoAdd}
        isWikipediaModalOpen={isWikipediaModalOpen}
        setIsWikipediaModalOpen={setIsWikipediaModalOpen}
        handleWikipediaArticleAdd={handleWikipediaArticleAdd}
        isAiAssistantOpen={isAiAssistantOpen}
        setIsAiAssistantOpen={setIsAiAssistantOpen}
        aiInitialQuery={aiInitialQuery}
        selectedSubject={selectedSubject}
        selectedTopics={selectedTopics}
        topicNodes={topicNodes}
        selectedLevels={selectedLevels}
        selectedLanguages={selectedLanguages}
        showAdminPanel={showAdminPanel}
        setShowAdminPanel={setShowAdminPanel}
        userRole={userRole}
      />
    </div>
  );
}
