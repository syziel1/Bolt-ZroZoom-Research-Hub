import { ThumbnailUploader } from './ThumbnailUploader';
import { Level, Subject, Topic } from '../lib/supabase';

type ResourceFormProps = {
  subjects: Subject[];
  topics: Topic[];
  levels: Level[];
  title: string;
  url: string;
  type: string;
  description: string;
  subjectId: string;
  selectedTopics: string[];
  selectedLevels: string[];
  language: string;
  aiGenerated: boolean;
  error?: string;
  loading?: boolean;
  thumbnailPreview: string | null;
  thumbnailUploading?: boolean;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  onTitleChange: (value: string) => void;
  onUrlChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onSubjectChange: (value: string) => void;
  onToggleTopic: (id: string, checked: boolean) => void;
  onToggleLevel: (id: string, checked: boolean) => void;
  onLanguageChange: (value: string) => void;
  onAiGeneratedChange: (checked: boolean) => void;
  onThumbnailSelect: (file: File | null, previewUrl: string | null) => void;
};

export function ResourceForm({
  subjects,
  topics,
  levels,
  title,
  url,
  type,
  description,
  subjectId,
  selectedTopics,
  selectedLevels,
  language,
  aiGenerated,
  error,
  loading,
  thumbnailPreview,
  thumbnailUploading,
  onSubmit,
  onCancel,
  onTitleChange,
  onUrlChange,
  onTypeChange,
  onDescriptionChange,
  onSubjectChange,
  onToggleTopic,
  onToggleLevel,
  onLanguageChange,
  onAiGeneratedChange,
  onThumbnailSelect,
}: ResourceFormProps) {
  const filteredTopics = subjectId ? topics.filter((t) => t.subject_id === subjectId) : [];

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Tytuł *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
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
              onChange={(e) => onUrlChange(e.target.value)}
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
              onChange={(e) => onTypeChange(e.target.value)}
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
              onChange={(e) => onSubjectChange(e.target.value)}
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Tematy (opcjonalnie)</label>
              <div className="border border-gray-300 rounded-md p-3 max-h-40 overflow-y-auto space-y-2">
                {filteredTopics.map((topic) => (
                  <label key={topic.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedTopics.includes(topic.id)}
                      onChange={(e) => onToggleTopic(topic.id, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{topic.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <ThumbnailUploader
            onFileSelect={onThumbnailSelect}
            previewUrl={thumbnailPreview}
            disabled={loading}
            uploading={thumbnailUploading}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Poziomy (opcjonalnie)</label>
            <div className="border border-gray-300 rounded-md p-3 max-h-40 overflow-y-auto space-y-2">
              {levels.map((level) => (
                <label key={level.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedLevels.includes(level.id)}
                    onChange={(e) => onToggleLevel(level.id, e.target.checked)}
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
              onChange={(e) => onLanguageChange(e.target.value)}
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
                onChange={(e) => onAiGeneratedChange(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Treść wygenerowana przez AI</span>
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-6">
              Zaznacz, jeśli zasób został stworzony lub znacząco wspomagany przez sztuczną inteligencję
            </p>
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Opis (opcjonalnie)
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">{error}</div>}

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Zapisywanie...' : 'Zapisz zasób'}
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
