import { useState, useEffect } from 'react';
import { supabase, Subject, Topic, Level } from '../lib/supabase';
import { X } from 'lucide-react';
import { ResourceForm } from './ResourceForm';
import { uploadThumbnail } from '../lib/storage';

type AddResourceModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  subjects: Subject[];
  topics: Topic[];
  levels: Level[];
};

export function AddResourceModal({
  isOpen,
  onClose,
  onSuccess,
  subjects,
  topics,
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
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

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
      setThumbnailFile(null);
      setThumbnailPreview(null);
      setThumbnailUploading(false);
      setError('');
      setStatusMessage('');
    }
  }, [isOpen]);

  const handleTopicToggle = (topicId: string, checked: boolean) => {
    setSelectedTopics((prev) =>
      checked ? [...prev, topicId] : prev.filter((id) => id !== topicId)
    );
  };

  const handleLevelToggle = (levelId: string, checked: boolean) => {
    setSelectedLevels((prev) =>
      checked ? [...prev, levelId] : prev.filter((id) => id !== levelId)
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setStatusMessage('');

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

      if (thumbnailFile) {
        setThumbnailUploading(true);
        await uploadThumbnail(resource.id, thumbnailFile);
        setStatusMessage('Miniatura została zapisana.');
      }

      setStatusMessage((prev) => prev || 'Zasób dodany pomyślnie!');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Nie udało się dodać zasobu.');
    } finally {
      setLoading(false);
      setThumbnailUploading(false);
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
        <div className="p-6 space-y-4">
          {statusMessage && (
            <div className="bg-green-50 border border-green-200 text-green-800 text-sm px-4 py-3 rounded-md">
              {statusMessage}
            </div>
          )}

          <ResourceForm
            subjects={subjects}
            topics={topics}
            levels={levels}
            title={title}
            url={url}
            type={type}
            description={description}
            subjectId={subjectId}
            selectedTopics={selectedTopics}
            selectedLevels={selectedLevels}
            language={language}
            aiGenerated={aiGenerated}
            error={error}
            loading={loading}
            thumbnailPreview={thumbnailPreview}
            thumbnailUploading={thumbnailUploading}
            onSubmit={handleSubmit}
            onCancel={onClose}
            onTitleChange={setTitle}
            onUrlChange={setUrl}
            onTypeChange={setType}
            onDescriptionChange={setDescription}
            onSubjectChange={(value) => {
              setSubjectId(value);
              setSelectedTopics([]);
            }}
            onToggleTopic={handleTopicToggle}
            onToggleLevel={handleLevelToggle}
            onLanguageChange={setLanguage}
            onAiGeneratedChange={setAiGenerated}
            onThumbnailSelect={(file, previewUrl) => {
              setThumbnailFile(file);
              setThumbnailPreview(previewUrl);
            }}
          />
        </div>
      </div>
    </div>
  );
}
