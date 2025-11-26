import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase, Resource, Subject, Level, TopicNode, Topic, ResourceTopic, ResourceLevel } from '../lib/supabase';
import { useTopics } from '../hooks/useTopics';
import { Sidebar } from './Sidebar';
import { ResourceCard } from './ResourceCard';
import { AddResourceModal } from './AddResourceModal';
import { ResourceDetailModal } from './ResourceDetailModal';
import { AdminPanel } from './AdminPanel';
import { Plus, LogOut, Loader, Settings, Menu, ArrowLeft } from 'lucide-react';

type DashboardProps = {
  isGuestMode?: boolean;
  onNavigateToAuth?: () => void;
  onBackToLanding?: () => void;
  initialSubject?: string | null;
};

export function Dashboard({ isGuestMode = false, onNavigateToAuth, onBackToLanding, initialSubject = null }: DashboardProps) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [allTopics, setAllTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(initialSubject);
  const { topics: topicNodes, loading: topicsLoading } = useTopics(selectedSubject);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [userNick, setUserNick] = useState('');
  const [userRole, setUserRole] = useState('');
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [resourceTopics, setResourceTopics] = useState<Map<string, ResourceTopic[]>>(new Map());
  const [resourceLevels, setResourceLevels] = useState<Map<string, ResourceLevel[]>>(new Map());

  const loadUserProfile = useCallback(async () => {
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
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [resourcesRes, subjectsRes, levelsRes, topicsRes] = await Promise.all([
        supabase.from('v_resources_full').select('*'),
        supabase.from('v_subjects_basic').select('*').order('order_index'),
        supabase.from('levels').select('*').order('order_index'),
        supabase.from('topics').select('*').order('order_index'),
      ]);

      if (resourcesRes.data) {
        let resourcesData = resourcesRes.data;

        // Manual fetch of contributor nicks if missing or just to be safe
        const contributorIds = [...new Set(resourcesData.map(r => r.contributor_id).filter(Boolean))];

        if (contributorIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, nick')
            .in('id', contributorIds);

          if (profiles) {
            const nickMap = new Map(profiles.map(p => [p.id, p.nick]));
            resourcesData = resourcesData.map(r => ({
              ...r,
              contributor_nick: r.contributor_nick || nickMap.get(r.contributor_id!) || 'Anonim'
            }));
          }
        }

        setResources(resourcesData);
      }
      if (subjectsRes.data) setSubjects(subjectsRes.data);
      if (levelsRes.data) setLevels(levelsRes.data);
      if (topicsRes.data) setAllTopics(topicsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadResourceTopics = useCallback(async (resourceIds: string[]) => {
    if (resourceIds.length === 0) return;

    const { data } = await supabase
      .from('v_resource_topics')
      .select('resource_id, topic_id, topic_name, topic_slug, parent_topic_id, subject_slug')
      .in('resource_id', resourceIds);

    if (data) {
      const topicsMap = new Map<string, ResourceTopic[]>();
      data.forEach((item: any) => {
        const { resource_id, ...topicData } = item;
        if (!topicsMap.has(resource_id)) {
          topicsMap.set(resource_id, []);
        }
        topicsMap.get(resource_id)!.push(topicData);
      });
      setResourceTopics(topicsMap);
    }
  }, []);

  const loadResourceLevels = useCallback(async (resourceIds: string[]) => {
    if (resourceIds.length === 0) return;

    const { data } = await supabase
      .from('v_resource_levels')
      .select('resource_id, levels')
      .in('resource_id', resourceIds);

    if (data) {
      const levelsMap = new Map<string, ResourceLevel[]>();
      data.forEach((item: any) => {
        if (item.levels && Array.isArray(item.levels)) {
          levelsMap.set(item.resource_id, item.levels);
        }
      });
      setResourceLevels(levelsMap);
    }
  }, []);

  useEffect(() => {
    loadData().then(() => {
      // Load topics after resources are loaded
    });
    if (!isGuestMode) {
      loadUserProfile();
    }
  }, [isGuestMode, loadData, loadUserProfile]);

  useEffect(() => {
    if (resources.length > 0) {
      const resourceIds = resources.map(r => r.id);
      loadResourceTopics(resourceIds);
      loadResourceLevels(resourceIds);
    }
  }, [resources, loadResourceTopics, loadResourceLevels]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const handleTopicToggle = (topicId: string) => {
    setSelectedTopics((prev) => {
      const isCurrentlySelected = prev.includes(topicId);

      // Helper function to collect all descendant topic IDs
      const getAllDescendantIds = (nodes: TopicNode[], parentId: string): string[] => {
        let ids: string[] = [];
        for (const node of nodes) {
          if (node.id === parentId) {
            // Found the parent, collect all its children recursively
            const collectChildren = (n: TopicNode): string[] => {
              let childIds = [n.id];
              if (n.children) {
                n.children.forEach(child => {
                  childIds = [...childIds, ...collectChildren(child)];
                });
              }
              return childIds;
            };
            ids = collectChildren(node);
            break;
          }
          if (node.children) {
            ids = getAllDescendantIds(node.children, parentId);
            if (ids.length > 0) break;
          }
        }
        return ids;
      };

      if (isCurrentlySelected) {
        // Deselect this topic and all its descendants
        const idsToRemove = getAllDescendantIds(topicNodes, topicId);
        return prev.filter(id => !idsToRemove.includes(id));
      } else {
        // Select this topic and all its descendants
        const idsToAdd = getAllDescendantIds(topicNodes, topicId);
        return [...new Set([...prev, ...idsToAdd])];
      }
    });
  };

  const handleLevelToggle = (levelId: string) => {
    setSelectedLevels((prev) =>
      prev.includes(levelId) ? prev.filter((id) => id !== levelId) : [...prev, levelId]
    );
  };

  const handleLanguageToggle = (language: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(language) ? prev.filter((l) => l !== language) : [...prev, language]
    );
  };

  const handleSubjectChange = (subjectId: string | null) => {
    setSelectedSubject(subjectId);
    setSelectedTopics([]); // Clear selected topics when subject changes
  };

  const handleTopicClick = (topicName: string) => {
    console.log('Topic clicked:', topicName);
  };

  const [editingResource, setEditingResource] = useState<Resource | null>(null);

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
  };

  const filteredResources = resources.filter((resource) => {
    if (selectedSubject) {
      if (resource.subject_id !== selectedSubject) {
        return false;
      }
    }

    if (selectedTopics.length > 0) {
      const findTopicNames = (nodes: TopicNode[], ids: string[]): string[] => {
        const names: string[] = [];
        for (const node of nodes) {
          if (ids.includes(node.id)) names.push(node.name);
          if (node.children) names.push(...findTopicNames(node.children, ids));
        }
        return names;
      };

      const selectedTopicNames = findTopicNames(topicNodes, selectedTopics);
      const currentResourceTopics = resourceTopics.get(resource.id) || [];

      const hasMatchingTopic = selectedTopicNames.some((topicName) =>
        currentResourceTopics.some(topic => topic.topic_name === topicName)
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

    if (selectedLanguages.length > 0) {
      if (!resource.language || !selectedLanguages.includes(resource.language)) {
        return false;
      }
    }

    return true;
  });

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

  const hasActiveFilters = selectedSubject !== null || selectedTopics.length > 0 || selectedLevels.length > 0 || selectedLanguages.length > 0;
  const isAdmin = userRole === 'admin';

  if (showAdminPanel && isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-4 md:px-8 py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">ZroZoom Hub</h1>
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
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">Szkoła Przyszłości z AI - ZroZoom Hub</h1>
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
              {!hasActiveFilters && recentlyAddedResources.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Ostatnio dodane</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {recentlyAddedResources.map((resource) => (
                      <ResourceCard
                        key={resource.id}
                        resource={resource}
                        topics={resourceTopics.get(resource.id) || []}
                        levels={resourceLevels.get(resource.id) || []}
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {filteredResources.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    topics={resourceTopics.get(resource.id) || []}
                    levels={resourceLevels.get(resource.id) || []}
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
          onClose={handleCloseAddModal}
          onSuccess={loadData}
          subjects={subjects}
          topics={allTopics}
          levels={levels}
          initialData={editingResource}
        />
      )}

      <ResourceDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        resource={selectedResource}
        onResourceUpdated={loadData}
        isGuestMode={isGuestMode}
        onEdit={handleEditResource}
      />
    </div>
  );
}
