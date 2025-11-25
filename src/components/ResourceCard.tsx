import React from 'react';
import { Resource } from '../lib/supabase';
import { getThumbnailUrl } from '../lib/storage';
import { Video, FileText, Presentation, Beaker, Wrench, Star, ExternalLink, ImageIcon } from 'lucide-react';

export type ResourceCardVariant = 'default' | 'hero' | 'list';

type ResourceCardProps = {
  resource: Resource;
  onTopicClick?: (topicName: string) => void;
  onCardClick?: (resource: Resource) => void;
  variant?: ResourceCardVariant;
};

const typeIcons: Record<string, React.ElementType> = {
  video: Video,
  article: FileText,
  pdf: FileText,
  presentation: Presentation,
  quiz: FileText,
  simulation: Beaker,
  tool: Wrench,
};

export function ResourceCard({ resource, onTopicClick, onCardClick, variant = 'default' }: ResourceCardProps) {
  const Icon = typeIcons[resource.type] || FileText;
  const thumbnailUrl = getThumbnailUrl(resource.thumbnail_path);

  const calculateOverallRating = (): number | null => {
    const { avg_usefulness, avg_correctness } = resource;
    if (avg_usefulness != null && avg_correctness != null) {
      return (avg_usefulness + avg_correctness) / 2;
    }
    return avg_usefulness ?? avg_correctness ?? null;
  };

  const overallRating = calculateOverallRating();
  const hasRatings = (resource.ratings_count || 0) > 0;

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

  if (variant === 'hero') {
    return (
      <div
        onClick={() => onCardClick?.(resource)}
        className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 cursor-pointer flex flex-col h-full overflow-hidden group"
      >
        <div className="w-full h-48 sm:h-56 bg-gray-100 relative overflow-hidden">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={resource.title}
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-gray-50 to-gray-100">
              <ImageIcon size={48} />
            </div>
          )}
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-sm">
            <Icon size={20} className="text-blue-600" />
          </div>
        </div>

        <div className="p-6 flex flex-col flex-1">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700">
                {resource.subject_name}
              </span>
              {resource.level_names?.[0] && (
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700">
                  {resource.level_names[0]}
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
              {resource.title}
            </h3>
            {resource.description && (
              <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                {resource.description}
              </p>
            )}
          </div>

          <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Star
                size={16}
                className={`${getRatingColor(overallRating)} ${hasRatings ? 'fill-current' : ''}`}
              />
              <span className="text-sm font-medium text-gray-700">
                {hasRatings ? overallRating?.toFixed(1) : '-'}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              {resource.contributor_nick}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div
        onClick={() => onCardClick?.(resource)}
        className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 border border-gray-200 cursor-pointer flex gap-4 items-center"
      >
        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
          {thumbnailUrl ? (
            <img src={thumbnailUrl} alt={resource.title} className="w-full h-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-gray-400">
              <ImageIcon size={20} />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Icon size={16} className="text-blue-600" />
            <h3 className="font-semibold text-gray-900 truncate">
              {resource.title}
            </h3>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span>{resource.subject_name}</span>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Star size={14} className={hasRatings ? "text-yellow-400 fill-current" : "text-gray-300"} />
              <span>{hasRatings ? overallRating?.toFixed(1) : 'Brak ocen'}</span>
            </div>
          </div>
        </div>

        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleLinkClick}
          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
        >
          <ExternalLink size={20} />
        </a>
      </div>
    );
  }

  // Default variant
  return (
    <div
      onClick={() => onCardClick?.(resource)}
      className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 border border-gray-200 cursor-pointer flex flex-col h-full"
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
          {thumbnailUrl ? (
            <img src={thumbnailUrl} alt="Miniatura zasobu" className="w-full h-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-gray-50 to-gray-100">
              <ImageIcon size={32} />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <div className="bg-blue-50 p-2 rounded-lg">
              <Icon size={20} className="text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                {resource.title}
              </h3>
              <p className="text-sm text-gray-600">{resource.subject_name}</p>
            </div>
          </div>
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
