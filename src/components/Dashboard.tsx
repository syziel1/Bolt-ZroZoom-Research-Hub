import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase, Resource, Subject, Level, TopicNode, Topic, ResourceTopic, ResourceLevel } from '../lib/supabase';
import { useTopics } from '../hooks/useTopics';
import { Sidebar } from './Sidebar';
import { ResourceCard } from './ResourceCard';
import { AddResourceModal } from './AddResourceModal';
import { ResourceDetailModal } from './ResourceDetailModal';
import { AdminPanel } from './AdminPanel';
import { Plus, LogOut, Loader, Settings, Menu, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';

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
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

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
      const [resourcesRes, subjectsRes, levelsRes, topicsRes, ratingsRes, commentsRes] = await Promise.all([
        supabase.from('v_resources_full').select('*'),
        supabase.from('v_subjects_basic').select('*').order('order_index'),
        supabase.from('levels').select('*').order('order_index'),
        supabase.from('topics').select('*').order('order_index'),
        supabase.from('ratings').select('resource_id, rating_usefulness, rating_correctness'),
        supabase.from('comments').select('resource_id')
      ]);

      if (resourcesRes.data) {
        let resourcesData = resourcesRes.data;

        // Calculate ratings stats
        const ratingsStats = new Map<string, { count: number; sumUsefulness: number; sumCorrectness: number }>();
        if (ratingsRes.data) {
          ratingsRes.data.forEach((r: any) => {
            if (!ratingsStats.has(r.resource_id)) {
              ratingsStats.set(r.resource_id, { count: 0, sumUsefulness: 0, sumCorrectness: 0 });
            }
            const stats = ratingsStats.get(r.resource_id)!;
            stats.count++;
            stats.sumUsefulness += r.rating_usefulness;
            stats.sumCorrectness += r.rating_correctness;
          });
        }

        // Calculate comments counts
        const commentsCounts = new Map<string, number>();
        if (commentsRes.data) {
          commentsRes.data.forEach((c: any) => {
            const count = commentsCounts.get(c.resource_id) || 0;
            commentsCounts.set(c.resource_id, count + 1);
          });
        }

        // Manual fetch of contributor nicks if missing or just to be safe
        const contributorIds = [...new Set(resourcesData.map(r => r.contributor_id).filter(Boolean))];

        if (contributorIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, nick')
            .in('id', contributorIds);

          if (profiles) {
            const nickMap = new Map(profiles.map(p => [p.id, p.nick]));
            resourcesData = resourcesData.map(r => {
              const stats = ratingsStats.get(r.id);
              const commentsCount = commentsCounts.get(r.id) || 0;

              return {
                ...r,
                contributor_nick: r.contributor_nick || nickMap.get(r.contributor_id!) || 'Anonim',
                ratings_count: stats ? stats.count : 0,
                avg_usefulness: stats ? stats.sumUsefulness / stats.count : null,
                avg_correctness: stats ? stats.sumCorrectness / stats.count : null,
                comments_count: commentsCount
              };
            });
          } else {
            // Even if profiles fail, we still want to attach stats
            resourcesData = resourcesData.map(r => {
              const stats = ratingsStats.get(r.id);
              const commentsCount = commentsCounts.get(r.id) || 0;

              return {
                ...r,
                ratings_count: stats ? stats.count : 0,
                avg_usefulness: stats ? stats.sumUsefulness / stats.count : null,
                avg_correctness: stats ? stats.sumCorrectness / stats.count : null,
                comments_count: commentsCount
              };
            });
          }
        } else {
          // No contributors to fetch, but still attach stats
          resourcesData = resourcesData.map(r => {
            const stats = ratingsStats.get(r.id);
            const commentsCount = commentsCounts.get(r.id) || 0;

            return {
              ...r,
              ratings_count: stats ? stats.count : 0,
              avg_usefulness: stats ? stats.sumUsefulness / stats.count : null,
              avg_correctness: stats ? stats.sumCorrectness / stats.count : null,
              comments_count: commentsCount
            };
          });
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
      const currentResourceLevels = resourceLevels.get(resource.id) || [];
      const hasMatchingLevel = currentResourceLevels.some((level) =>
        selectedLevels.includes(level.id)
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

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSubject, selectedTopics, selectedLevels, selectedLanguages]);

  const indexOfLastResource = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstResource = indexOfLastResource - ITEMS_PER_PAGE;
  const currentResources = filteredResources.slice(indexOfFirstResource, indexOfLastResource);
  const totalPages = Math.ceil(filteredResources.length / ITEMS_PER_PAGE);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    // Scroll to top of the list or top of the page
    const mainContent = document.querySelector('main');
    if (mainContent) {
      mainContent.scrollTo({ top: 0, behavior: 'smooth' });
    }
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
        <AdminPanel userRole={userRole} requireAdmin={true} onDataChange={loadData} />
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
                  Zarejestruj się
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
                  <div className="grid gap-4 md:gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))' }}>
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
                  Wyświetlanie zasobów {filteredResources.length > 0 ? indexOfFirstResource + 1 : 0}-{Math.min(indexOfLastResource, filteredResources.length)} spośród {filteredResources.length} znalezionych materiałów
                </p>
              </div>

              <div className="grid gap-4 md:gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))' }}>
                {currentResources.map((resource) => (
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

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8 pb-4">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <div className="flex gap-1 overflow-x-auto max-w-[200px] sm:max-w-none no-scrollbar">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      // Show first, last, current, and surrounding pages
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`w-10 h-10 rounded-md flex-shrink-0 flex items-center justify-center text-sm font-medium transition-colors
                              ${currentPage === page
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                              }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return <span key={page} className="w-10 h-10 flex items-center justify-center text-gray-400">...</span>;
                      }
                      return null;
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}

              {filteredResources.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  Nie znaleziono zasobów pasujących do filtrów
                </div>
              )}
            </>
          )}

          <footer className="mt-12 pt-8 border-t border-gray-200">
            <div className="text-center text-sm text-gray-600">
              <p className="mb-2">Szkoła Przyszłości AI - ZroZoom Hub - Twoja baza wiedzy edukacyjnej</p>
              <p className="text-xs text-gray-500">
                © {new Date().getFullYear()} Sylwester Zieliński. All rights reserved
              </p>
            </div>
          </footer>
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
