import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { supabase, Subject, Topic, Level, Resource } from '../lib/supabase';
import { uploadResourceThumbnail, getThumbnailUrl } from '../lib/storage';
import { ThumbnailUploader } from './ThumbnailUploader';
import { buildTopicTree } from '../utils/topicTree';
import { TopicTree } from './TopicTree';

type ResourceFormProps = {
  subjects: Subject[];
  topics: Topic[];
  levels: Level[];
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: Resource | null;
  prefillData?: Partial<Resource> | null;
};

export function ResourceForm({ subjects, topics, levels, onSuccess, onCancel, initialData, prefillData }: ResourceFormProps) {
  const [title, setTitle] = useState(initialData?.title || prefillData?.title || '');
  const [url, setUrl] = useState(initialData?.url || prefillData?.url || '');
  const [type, setType] = useState(initialData?.type || prefillData?.type || 'article');
  const [description, setDescription] = useState(initialData?.description || prefillData?.description || '');
  const [subjectId, setSubjectId] = useState(initialData?.subject_id || prefillData?.subject_id || '');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [language, setLanguage] = useState(initialData?.language || prefillData?.language || 'pl');
  const [aiGenerated, setAiGenerated] = useState(initialData?.ai_generated || prefillData?.ai_generated || false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
    getThumbnailUrl(initialData?.thumbnail_path) || initialData?.thumbnail_url || prefillData?.thumbnail_url || null
  );
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const filteredTopics = useMemo(() => (subjectId ? topics.filter((t) => t.subject_id === subjectId) : []), [subjectId, topics]);
  const topicTree = useMemo(() => buildTopicTree(filteredTopics), [filteredTopics]);

  const handleTopicToggle = (topicId: string) => {
    setSelectedTopics(prev => {
      if (prev.includes(topicId)) {
        // If clicking the same topic, deselect it (optional, but good for radio buttons if we want to allow unchecking)
        // Actually for radio buttons, usually you can't uncheck by clicking again, but let's allow it or just switch.
        // Let's make it behave like a radio button: always select the new one.
        // But if it's already selected, maybe we want to keep it selected?
        // If we want standard radio behavior:
        return [topicId];
      } else {
        // If clicking a new topic, replace the old selection
        return [topicId];
      }
    });
  };

  // Update state when initialData or prefillData changes
  useEffect(() => {
    const data = initialData || prefillData;
    setTitle(data?.title || '');
    setUrl(data?.url || '');
    setType(data?.type || 'article');
    setDescription(data?.description || '');
    setSubjectId(data?.subject_id || '');
    setLanguage(data?.language || 'pl');
    setAiGenerated(data?.ai_generated || false);

    // Handle thumbnail
    if (initialData?.thumbnail_path) {
      setThumbnailPreview(getThumbnailUrl(initialData.thumbnail_path));
    } else if (data?.thumbnail_url) {
      setThumbnailPreview(data.thumbnail_url);
    } else {
      setThumbnailPreview(null);
    }

    setThumbnailFile(null);
    if (initialData) {
      setSelectedTopics([]);
      setSelectedLevels([]);
    }
  }, [initialData, prefillData]);

  useEffect(() => {
    if (initialData) {
      let isMounted = true;

      // Load initial relations
      const loadRelations = async () => {
        const { data: topicData } = await supabase
          .from('resource_topics')
          .select('topic_id')
          .eq('resource_id', initialData.id);

        if (isMounted && topicData) {
          setSelectedTopics(topicData.map(t => t.topic_id));
        }

        const { data: levelData } = await supabase
          .from('resource_levels')
          .select('level_id')
          .eq('resource_id', initialData.id);

        if (isMounted && levelData) {
          setSelectedLevels(levelData.map(l => l.level_id));
        }
      };
      loadRelations();

      return () => {
        isMounted = false;
      };
    }
  }, [initialData]);

  const resetForm = () => {
    setTitle('');
    setUrl('');
    setType('article');
    setDescription('');
    setSubjectId('');
    setSelectedTopics([]);
    setSelectedLevels([]);
    setLanguage('pl');
    setAiGenerated(false);
    setThumbnailFile(null);
    if (thumbnailPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(thumbnailPreview);
    }
    setThumbnailPreview(null);
    setError('');
  };

  useEffect(() => () => {
    if (thumbnailPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(thumbnailPreview);
    }
  }, [thumbnailPreview]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let resourceId = initialData?.id;

      if (initialData) {
        // Update existing resource
        // If we have a thumbnail preview but no file, it's an external URL (e.g., from YouTube)
        const externalThumbnailUrl = (!thumbnailFile && thumbnailPreview && !thumbnailPreview.startsWith('blob:'))
          ? thumbnailPreview
          : undefined;

        const { error: updateError } = await supabase
          .from('resources')
          .update({
            title,
            url,
            type,
            description,
            subject_id: subjectId,
            language,
            ai_generated: aiGenerated,
            ...(externalThumbnailUrl && { thumbnail_url: externalThumbnailUrl }),
          })
          .eq('id', initialData.id);

        if (updateError) throw updateError;
      } else {
        // Create new resource
        // If we have a thumbnail preview but no file, it's an external URL (e.g., from YouTube)
        const externalThumbnailUrl = (!thumbnailFile && thumbnailPreview && !thumbnailPreview.startsWith('blob:'))
          ? thumbnailPreview
          : undefined;

        const { data: resource, error: insertError } = await supabase
          .from('resources')
          .insert({
            title,
            url,
            type,
            description,
            subject_id: subjectId,
            contributor_id: user.id,
            author: user.user_metadata?.nick || user.email?.split('@')[0] || 'Anonim',
            language,
            ai_generated: aiGenerated,
            ...(externalThumbnailUrl && { thumbnail_url: externalThumbnailUrl }),
          })
          .select()
          .single();

        if (insertError) throw insertError;
        resourceId = resource.id;
      }

      if (!resourceId) throw new Error('Failed to get resource ID');

      // Update relations (delete all and re-insert for simplicity)
      // Note: For updates, we always delete existing relations first, then re-insert selected ones (if any).
      // For creates, there are no existing relations to delete, so we skip directly to inserting.
      if (initialData) {
        await supabase.from('resource_topics').delete().eq('resource_id', resourceId);
        await supabase.from('resource_levels').delete().eq('resource_id', resourceId);
      }

      if (selectedTopics.length > 0) {
        const topicRelations = selectedTopics.map((topicId) => ({
          resource_id: resourceId,
          topic_id: topicId,
        }));
        const { error: topicsError } = await supabase.from('resource_topics').insert(topicRelations);
        if (topicsError) throw topicsError;
      }

      if (selectedLevels.length > 0) {
        const levelRelations = selectedLevels.map((levelId) => ({
          resource_id: resourceId,
          level_id: levelId,
        }));
        const { error: levelsError } = await supabase.from('resource_levels').insert(levelRelations);
        if (levelsError) throw levelsError;
      }

      // Upload thumbnail if file selected
      if (thumbnailFile) {
        try {
          setUploading(true);
          console.log('Starting thumbnail upload for resource:', resourceId);
          console.log('File details:', {
            name: thumbnailFile.name,
            size: thumbnailFile.size,
            type: thumbnailFile.type
          });

          const result = await uploadResourceThumbnail(resourceId, thumbnailFile);
          console.log('Thumbnail upload successful:', result);
          setSuccessMessage('Miniatura została przesłana pomyślnie.');
        } catch (uploadError) {
          console.error('Thumbnail upload failed:', uploadError);
          const errorMessage = uploadError instanceof Error ? uploadError.message : 'Nie udało się przesłać miniatury.';
          setError(`Błąd miniaturki: ${errorMessage}`);
          // Don't throw - allow resource to be saved even if thumbnail fails
        } finally {
          setUploading(false);
        }
      }

      setSuccessMessage(initialData ? 'Zasób został zaktualizowany.' : 'Zasób został zapisany.');
      if (!initialData) resetForm();
      onSuccess();
      onCancel();
    } catch (err: unknown) {
      console.error('Resource save error:', err);
      setError(err instanceof Error ? err.message : 'Wystąpił błąd podczas zapisu.');
    } finally {
      setUploading(false);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">{initialData ? 'Edytuj zasób' : 'Dodaj nowy zasób'}</h2>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>
      </div>

      <ThumbnailUploader
        onFileSelect={(file) => {
          if (thumbnailPreview?.startsWith('blob:')) {
            URL.revokeObjectURL(thumbnailPreview);
          }
          setThumbnailFile(file);
          setThumbnailPreview(file ? URL.createObjectURL(file) : null);
        }}
        previewUrl={thumbnailPreview ?? undefined}
        uploading={uploading}
      />

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

      {subjectId && filteredTopics.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tematy (opcjonalnie)
          </label>
          <div className="border border-gray-300 rounded-md p-3 max-h-60 overflow-y-auto">
            <TopicTree
              nodes={topicTree}
              selectedTopics={selectedTopics}
              onTopicToggle={handleTopicToggle}
            />
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

      {successMessage && (
        <div className="text-green-600 text-sm bg-green-50 p-3 rounded-md">
          {successMessage}
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Zapisywanie...' : (initialData ? 'Zaktualizuj zasób' : 'Zapisz zasób')}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Anuluj
        </button>
      </div>
    </form>
  );
}
