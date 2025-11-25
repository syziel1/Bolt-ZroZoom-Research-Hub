import { useState, useEffect } from 'react';
import { supabase, Subject, Level } from '../lib/supabase';
import { useTopics } from '../hooks/useTopics';
import { X, Loader } from 'lucide-react';

type AddResourceModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  subjects: Subject[];
  levels: Level[];
};

export function AddResourceModal({
  isOpen,
  onClose,
  onSuccess,
  subjects,
  levels,
}: AddResourceModalProps) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState('article');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [language, setLanguage] = useState('pl');
  const [aiGenerated, setAiGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Use the useTopics hook to fetch topics when a subject is selected
  const { topics: topicNodes, loading: topicsLoading } = useTopics(subjectId || null);

  // Flatten the topic tree for selection
  const flattenTopics = (nodes: typeof topicNodes): { id: string; name: string }[] => {
    const result: { id: string; name: string }[] = [];
    for (const node of nodes) {
      result.push({ id: node.id, name: node.name });
      if (node.children && node.children.length > 0) {
        result.push(...flattenTopics(node.children));
      }
    }
    return result;
  };

  const availableTopics = flattenTopics(topicNodes);

  useEffect(() => {
    if (!isOpen) {
      setTitle('');
      setUrl('');
      setType('article');
      setDescription('');
      setSubjectId('');
      setSelectedTopics([]);
      setSelectedLevels([]);
      setLanguage('pl');
      setAiGenerated(false);
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: resource, error: resourceError } = await supabase
        .from('resources')
        .insert({
          title,
          url,
          type,
          description,
          subject_id: subjectId,
          contributor_id: user.id,
          author: user.user_metadata?.nick || user.email?.split('@')[0] || 'Anonymous',
          language,
          ai_generated: aiGenerated,
        })
        .select()
        .single();

      if (resourceError) throw resourceError;

      if (selectedTopics.length > 0) {
        const topicRelations = selectedTopics.map((topicId) => ({
          resource_id: resource.id,
          topic_id: topicId,
        }));
        const { error: topicsError } = await supabase
          .from('resource_topics')
          .insert(topicRelations);
        if (topicsError) throw topicsError;
      }

      if (selectedLevels.length > 0) {
        const levelRelations = selectedLevels.map((levelId) => ({
          resource_id: resource.id,
          level_id: levelId,
        }));
        const { error: levelsError } = await supabase
          .from('resource_levels')
          .insert(levelRelations);
        if (levelsError) throw levelsError;
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Dodaj nowy zasób</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Tytuł *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
              URL *
            </label>
            <input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Typ *
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="article">Artykuł</option>
              <option value="video">Wideo</option>
              <option value="pdf">PDF</option>
              <option value="presentation">Prezentacja</option>
              <option value="quiz">Quiz</option>
              <option value="simulation">Symulacja</option>
              <option value="tool">Narzędzie</option>
            </select>
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
              Przedmiot *
            </label>
            <select
              id="subject"
              value={subjectId}
              onChange={(e) => {
                setSubjectId(e.target.value);
                setSelectedTopics([]);
              }}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Wybierz przedmiot</option>
              {subjects.map((subject) => (
                <option key={subject.subject_id} value={subject.subject_id}>
                  {subject.subject_name}
                </option>
              ))}
            </select>
          </div>

          {subjectId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tematy (opcjonalnie)
              </label>
              <div className="border border-gray-300 rounded-md p-3 max-h-40 overflow-y-auto space-y-2">
                {topicsLoading ? (
                  <div className="flex items-center justify-center py-2">
                    <Loader className="animate-spin text-blue-600" size={20} />
                    <span className="ml-2 text-sm text-gray-500">Ładowanie tematów...</span>
                  </div>
                ) : availableTopics.length > 0 ? (
                  availableTopics.map((topic) => (
                    <label
                      key={topic.id}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTopics.includes(topic.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTopics([...selectedTopics, topic.id]);
                          } else {
                            setSelectedTopics(selectedTopics.filter((id) => id !== topic.id));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{topic.name}</span>
                    </label>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">Brak dostępnych tematów dla tego przedmiotu</span>
                )}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Poziomy (opcjonalnie)
            </label>
            <div className="border border-gray-300 rounded-md p-3 max-h-40 overflow-y-auto space-y-2">
              {levels.map((level) => (
                <label
                  key={level.id}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedLevels.includes(level.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedLevels([...selectedLevels, level.id]);
                      } else {
                        setSelectedLevels(selectedLevels.filter((id) => id !== level.id));
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{level.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
              Język *
            </label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="pl">Polski</option>
              <option value="en">English</option>
              <option value="de">Deutsch</option>
              <option value="fr">Français</option>
              <option value="es">Español</option>
              <option value="other">Inny</option>
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={aiGenerated}
                onChange={(e) => setAiGenerated(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Treść wygenerowana przez AI
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-6">
              Zaznacz, jeśli zasób został stworzony lub znacząco wspomagany przez sztuczną inteligencję
            </p>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Opis (opcjonalnie)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Dodawanie...' : 'Dodaj zasób'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Anuluj
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
