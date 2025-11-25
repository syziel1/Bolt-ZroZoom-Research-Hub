import { useState, useEffect, useMemo } from 'react';
import { supabase, Resource, Subject, Level, TopicNode } from '../lib/supabase';
import { useTopics } from '../hooks/useTopics';
import { Sidebar } from './Sidebar';
import { ResourceCard } from './ResourceCard';
import { AddResourceModal } from './AddResourceModal';
import { ResourceDetailModal } from './ResourceDetailModal';
import { AdminPanel } from './AdminPanel';
import { Plus, LogOut, Loader, Library, BookOpen, Hash, Settings, Menu, ArrowLeft } from 'lucide-react';

type DashboardProps = {
  isGuestMode?: boolean;
  onNavigateToAuth?: () => void;
  onBackToLanding?: () => void;
};

export function Dashboard({ isGuestMode = false, onNavigateToAuth, onBackToLanding }: DashboardProps = {}) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const { topics: topicNodes, loading: topicsLoading } = useTopics(selectedSubject);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [userNick, setUserNick] = useState('');
  const [userRole, setUserRole] = useState('');
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    loadData();
    if (!isGuestMode) {
      loadUserProfile();
    }
  }, [isGuestMode]);

  const loadUserProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('nick, role')
        .eq('id', user.id)
        .single();
      setUserNick(profile?.nick || user.email?.split('@')[0] || 'User');
      setUserRole(profile?.role || '');
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [resourcesRes, subjectsRes, levelsRes] = await Promise.all([
        supabase.from('v_resources_full').select('*'),
        supabase.from('v_subjects_basic').select('*').order('order_index'),
        supabase.from('levels').select('*').order('order_index'),
      ]);

      if (resourcesRes.data) setResources(resourcesRes.data);
      if (subjectsRes.data) setSubjects(subjectsRes.data);
      if (levelsRes.data) setLevels(levelsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const handleTopicToggle = (topicId: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topicId) ? prev.filter((id) => id !== topicId) : [...prev, topicId]
    );
  };

  const handleLevelToggle = (levelId: string) => {
    setSelectedLevels((prev) =>
      prev.includes(levelId) ? prev.filter((id) => id !== levelId) : [...prev, levelId]
    );
  };

  const handleTopicClick = (topicName: string) => {
    // Logic for clicking a topic on a card
    // Since we don't have all topics loaded, we can't easily switch subject and select topic
    // without fetching. For now, we'll log it.
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

  const filteredResources = resources.filter((resource) => {
    if (selectedSubject) {
      const subject = subjects.find((s) => s.subject_id === selectedSubject);
      if (subject && resource.subject_slug !== subject.subject_slug) {
        return false;
      }
    }

    if (selectedTopics.length > 0) {
      // Helper to flatten tree to find names
      const findTopicNames = (nodes: TopicNode[], ids: string[]): string[] => {
        let names: string[] = [];
        for (const node of nodes) {
          if (ids.includes(node.id)) names.push(node.name);
          if (node.children) names.push(...findTopicNames(node.children, ids));
        }
        return names;
      };

      const resourceTopics = findTopicNames(topicNodes, selectedTopics);

      const hasMatchingTopic = resourceTopics.some((topicName) =>
        resource.topic_names?.includes(topicName)
      );
      if (!hasMatchingTopic) return false;
    }

    if (selectedLevels.length > 0) {
      const resourceLevels = levels
        .filter((l) => selectedLevels.includes(l.id))
        .map((l) => l.name);
      const hasMatchingLevel = resourceLevels.some((levelName) =>
        resource.level_names?.includes(levelName)
      );
      if (!hasMatchingLevel) return false;
    }

    return true;
  });

  const stats = useMemo(() => {
    return {
      totalResources: resources.length,
      totalSubjects: subjects.length,
      totalTopics: 0, // Topics are now fetched per subject
    };
  }, [resources.length, subjects.length]);

  const recentlyAddedResources = useMemo(() => {
    const sorted = [...resources].sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA;
    });
    return sorted.slice(0, 3);
  }, [resources]);

  const hasActiveFilters = selectedSubject !== null || selectedTopics.length > 0 || selectedLevels.length > 0;
  const isAdmin = userRole === 'admin';

  if (showAdminPanel && isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-4 md:px-8 py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">ZroZoom Research Hub</h1>
            <div className="flex items-center gap-2 md:gap-4">
              <button
                onClick={() => setShowAdminPanel(false)}
                className="text-blue-600 hover:text-blue-800 flex items-center gap-2 text-sm md:text-base"
              >
                <span className="hidden md:inline">Powrót do Dashboard</span>
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
        <AdminPanel userRole={userRole} requireAdmin={true} />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        subjects={subjects}
        topicNodes={topicNodes}
        levels={levels}
        selectedSubject={selectedSubject}
        selectedTopics={selectedTopics}
        selectedLevels={selectedLevels}
        onSubjectChange={setSelectedSubject}
        onTopicToggle={handleTopicToggle}
        onLevelToggle={handleLevelToggle}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isLoading={topicsLoading}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden mr-4 text-gray-600 hover:text-gray-900"
              >
                <Menu size={24} />
              </button>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">ZroZoom Research Hub</h1>
                <p className="text-xs md:text-sm text-gray-600 mt-1 hidden sm:block">
                  Odkrywaj i dziel się zasobami edukacyjnymi
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              {isGuestMode ? (
                <>
                  <button
                    onClick={onBackToLanding}
                    className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
                    title="Powrót do strony głównej"
                  >
                    <ArrowLeft size={20} />
                    <span className="hidden lg:inline">Powrót</span>
                  </button>
                  <button
                    onClick={onNavigateToAuth}
                    className="bg-blue-600 text-white px-3 py-2 md:px-4 md:py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
                  >
                    <span>Zaloguj się</span>
                  </button>
                </>
              ) : (
                <>
                  <span className="text-sm text-gray-600 hidden md:inline">Witaj, {userNick}</span>
                  {isAdmin && (
                    <button
                      onClick={() => setShowAdminPanel(true)}
                      className="bg-purple-600 text-white px-3 py-2 md:px-4 md:py-2 rounded-md hover:bg-purple-700 flex items-center gap-2"
                      title="Panel Administracyjny"
                    >
                      <Settings size={20} />
                      <span className="hidden lg:inline">Panel Admina</span>
                    </button>
                  )}
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 text-white px-3 py-2 md:px-4 md:py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
                    title="Dodaj zasób"
                  >
                    <Plus size={20} />
                    <span className="hidden sm:inline">Dodaj zasób</span>
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
                    title="Wyloguj się"
                  >
                    <LogOut size={20} />
                    <span className="hidden lg:inline">Wyloguj się</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </header>

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
                  onClick={onNavigateToAuth}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm whitespace-nowrap"
                >
                  Zaloguj się
                </button>
              </div>
            </div>
          )}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader className="animate-spin text-blue-600" size={48} />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold text-gray-900">{stats.totalResources}</p>
                      <p className="text-sm text-gray-600 mt-1">Wszystkie zasoby</p>
                    </div>
                    <Library className="text-blue-500" size={32} />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold text-gray-900">{stats.totalSubjects}</p>
                      <p className="text-sm text-gray-600 mt-1">Przedmioty</p>
                    </div>
                    <BookOpen className="text-blue-500" size={32} />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold text-gray-900">{stats.totalTopics}</p>
                      <p className="text-sm text-gray-600 mt-1">Tematy</p>
                    </div>
                    <Hash className="text-blue-500" size={32} />
                  </div>
                </div>
              </div>

              {!hasActiveFilters && recentlyAddedResources.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Ostatnio dodane</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {recentlyAddedResources.map((resource) => (
                      <ResourceCard
                        key={resource.id}
                        resource={resource}
                        onTopicClick={handleTopicClick}
                        onCardClick={handleCardClick}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {hasActiveFilters ? 'Wyniki filtrowania' : 'Wszystkie zasoby'}
                </h2>
                <p className="text-sm text-gray-600">
                  Wyświetlanie {filteredResources.length} z {resources.length} zasobów
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {filteredResources.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    onTopicClick={handleTopicClick}
                    onCardClick={handleCardClick}
                  />
                ))}
              </div>

              {filteredResources.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  Nie znaleziono zasobów pasujących do filtrów
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {!isGuestMode && (
        <AddResourceModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={loadData}
          subjects={subjects}
          topics={topicNodes}
          levels={levels}
        />
      )}

      <ResourceDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        resource={selectedResource}
        onResourceUpdated={loadData}
        isGuestMode={isGuestMode}
      />
    </div>
  );
}
