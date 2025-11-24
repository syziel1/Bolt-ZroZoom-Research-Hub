import { useState, useEffect, useMemo } from 'react';
import { supabase, Resource, Subject, Topic, Level } from '../lib/supabase';
import { Sidebar } from './Sidebar';
import { ResourceCard } from './ResourceCard';
import { AddResourceModal } from './AddResourceModal';
import { Plus, LogOut, Loader, Library, BookOpen, Hash } from 'lucide-react';

export function Dashboard() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userNick, setUserNick] = useState('');

  useEffect(() => {
    loadData();
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('nick')
        .eq('id', user.id)
        .single();
      setUserNick(profile?.nick || user.email?.split('@')[0] || 'User');
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [resourcesRes, subjectsRes, topicsRes, levelsRes] = await Promise.all([
        supabase.from('v_resources_full').select('*'),
        supabase.from('v_subjects_basic').select('*').order('order_index'),
        supabase.from('topics').select('*').order('order_index'),
        supabase.from('levels').select('*').order('order_index'),
      ]);

      if (resourcesRes.data) setResources(resourcesRes.data);
      if (subjectsRes.data) setSubjects(subjectsRes.data);
      if (topicsRes.data) setTopics(topicsRes.data);
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
    const topic = topics.find((t) => t.name === topicName);
    if (topic) {
      if (topic.subject_id !== selectedSubject) {
        setSelectedSubject(topic.subject_id);
      }
      if (!selectedTopics.includes(topic.id)) {
        setSelectedTopics((prev) => [...prev, topic.id]);
      }
    }
  };

  const filteredResources = resources.filter((resource) => {
    if (selectedSubject) {
      const subject = subjects.find((s) => s.id === selectedSubject);
      if (subject && resource.subject_slug !== subject.slug) {
        return false;
      }
    }

    if (selectedTopics.length > 0) {
      const resourceTopics = topics
        .filter((t) => selectedTopics.includes(t.id))
        .map((t) => t.name);
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
      totalTopics: topics.length,
    };
  }, [resources.length, subjects.length, topics.length]);

  const recentlyAddedResources = useMemo(() => {
    const sorted = [...resources].sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA;
    });
    return sorted.slice(0, 3);
  }, [resources]);

  const hasActiveFilters = selectedSubject !== null || selectedTopics.length > 0 || selectedLevels.length > 0;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        subjects={subjects}
        topics={topics}
        levels={levels}
        selectedSubject={selectedSubject}
        selectedTopics={selectedTopics}
        selectedLevels={selectedLevels}
        onSubjectChange={setSelectedSubject}
        onTopicToggle={handleTopicToggle}
        onLevelToggle={handleLevelToggle}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">ZroZoom Research Hub</h1>
              <p className="text-sm text-gray-600 mt-1">
                Discover and share educational resources
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Welcome, {userNick}</span>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus size={20} />
                Add Resource
              </button>
              <button
                onClick={handleSignOut}
                className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
              >
                <LogOut size={20} />
                Sign Out
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader className="animate-spin text-blue-600" size={48} />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold text-gray-900">{stats.totalResources}</p>
                      <p className="text-sm text-gray-600 mt-1">Total Resources</p>
                    </div>
                    <Library className="text-blue-500" size={32} />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold text-gray-900">{stats.totalSubjects}</p>
                      <p className="text-sm text-gray-600 mt-1">Subjects</p>
                    </div>
                    <BookOpen className="text-blue-500" size={32} />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold text-gray-900">{stats.totalTopics}</p>
                      <p className="text-sm text-gray-600 mt-1">Topics</p>
                    </div>
                    <Hash className="text-blue-500" size={32} />
                  </div>
                </div>
              </div>

              {!hasActiveFilters && recentlyAddedResources.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Recently Added</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recentlyAddedResources.map((resource) => (
                      <ResourceCard key={resource.id} resource={resource} onTopicClick={handleTopicClick} />
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {hasActiveFilters ? 'Filtered Results' : 'All Resources'}
                </h2>
                <p className="text-sm text-gray-600">
                  Showing {filteredResources.length} of {resources.length} resources
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResources.map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} onTopicClick={handleTopicClick} />
                ))}
              </div>

              {filteredResources.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No resources found matching your filters
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <AddResourceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadData}
        subjects={subjects}
        topics={topics}
        levels={levels}
      />
    </div>
  );
}
