import { Resource } from '../lib/supabase';
import { Video, FileText, Presentation, Beaker, Wrench, Star, ExternalLink, ImageOff } from 'lucide-react';
import { getThumbnailPublicUrl } from '../lib/storage';

type ResourceCardProps = {
  resource: Resource;
  onTopicClick?: (topicName: string) => void;
  onCardClick?: (resource: Resource) => void;
};

const typeIcons: Record<string, any> = {
  video: Video,
  article: FileText,
  pdf: FileText,
  presentation: Presentation,
  quiz: FileText,
  simulation: Beaker,
  tool: Wrench,
};

export function ResourceCard({ resource, onTopicClick, onCardClick }: ResourceCardProps) {
  const Icon = typeIcons[resource.type] || FileText;
  const thumbnailUrl = getThumbnailPublicUrl(resource.thumbnail_path);

  const calculateOverallRating = (): number | null => {
    const { avg_usefulness, avg_correctness } = resource;
    if (avg_usefulness !== null && avg_correctness !== null) {
      return (avg_usefulness + avg_correctness) / 2;
    }
    return avg_usefulness ?? avg_correctness ?? null;
  };

  const overallRating = calculateOverallRating();
  const hasRatings = resource.ratings_count > 0;

  const getRatingColor = (rating: number | null): string => {
    if (rating === null) return 'text-gray-400';
    if (rating >= 4.5) return 'text-yellow-500';
    if (rating >= 3.5) return 'text-yellow-400';
    if (rating >= 2.5) return 'text-orange-400';
    return 'text-red-400';
  };

  const handleTopicClick = (e: React.MouseEvent, topicName: string) => {
    e.stopPropagation();
    onTopicClick?.(topicName);
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      onClick={() => onCardClick?.(resource)}
      className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 border border-gray-200 min-w-[300px] cursor-pointer"
    >
      <div className="mb-4">
        <div className="aspect-video w-full overflow-hidden rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-center">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={`Miniatura zasobu ${resource.title}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400 text-sm gap-1">
              <ImageOff size={24} />
              <span>Brak miniatury</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-start gap-3 mb-3">
        <div className="bg-blue-50 p-2 rounded-lg">
          <Icon size={24} className="text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
            {resource.title}
          </h3>
          <p className="text-sm text-gray-600">{resource.subject_name}</p>
        </div>
      </div>

      {resource.description && (
        <p className="text-sm text-gray-700 mb-4 line-clamp-2">
          {resource.description}
        </p>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        {resource.level_names?.map((level, idx) => (
          <span
            key={idx}
            className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
          >
            {level}
          </span>
        ))}
      </div>

      {resource.topic_names && resource.topic_names.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {resource.topic_names.slice(0, 3).map((topic, idx) => (
            <button
              key={idx}
              onClick={(e) => handleTopicClick(e, topic)}
              className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded hover:bg-blue-100 transition-colors cursor-pointer"
            >
              {topic}
            </button>
          ))}
          {resource.topic_names.length > 3 && (
            <span className="text-xs text-gray-500 px-2 py-1">
              +{resource.topic_names.length - 3} więcej
            </span>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 pt-4 mt-4 border-t border-gray-100">
        <div className="flex items-center gap-1 text-sm">
          <Star
            size={16}
            className={`${getRatingColor(overallRating)} ${hasRatings ? 'fill-current' : ''}`}
          />
          {hasRatings ? (
            <div className="flex items-center gap-1">
              <span className="font-medium text-gray-900">{overallRating?.toFixed(1)}</span>
              <span className="text-xs text-gray-500">({resource.ratings_count})</span>
            </div>
          ) : (
            <span className="text-xs text-gray-500">Brak ocen</span>
          )}
        </div>
        <div className="text-xs text-gray-500 truncate max-w-[120px]">
          przez {resource.contributor_nick}
        </div>
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleLinkClick}
          className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm ml-auto"
        >
          Otwórz
          <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
}
