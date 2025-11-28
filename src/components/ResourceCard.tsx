import React, { useState } from 'react';
import { Resource, ResourceTopic, ResourceLevel } from '../lib/supabase';
import { getThumbnailUrl } from '../lib/storage';
import { YouTubeModal } from './YouTubeModal';
import { ResourceActionButton } from './ResourceActionButton';
import { Star, ImageIcon, MessageSquare, Heart } from 'lucide-react';

export type ResourceCardVariant = 'default' | 'hero' | 'list';

type ResourceCardProps = {
  resource: Resource;
  topics?: ResourceTopic[];
  levels?: ResourceLevel[];
  onTopicClick?: (topicName: string) => void;
  onCardClick?: (resource: Resource) => void;
  variant?: ResourceCardVariant;
  isFavorite?: boolean;
  onFavoriteToggle?: (resourceId: string) => void;
  isLoggedIn?: boolean;
};

export function ResourceCard({ resource, topics = [], levels = [], onTopicClick, onCardClick, variant = 'default', isFavorite = false, onFavoriteToggle, isLoggedIn = true }: ResourceCardProps) {
  const thumbnailUrl = getThumbnailUrl(resource.thumbnail_path) || resource.thumbnail_url;

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
    if (rating === null) return 'text-yellow-400';
    if (rating >= 4.5) return 'text-yellow-500';
    if (rating >= 3.5) return 'text-yellow-400';
    if (rating >= 2.5) return 'text-orange-400';
    return 'text-red-400';
  };

  const handleTopicClick = (e: React.MouseEvent, topicName: string) => {
    e.stopPropagation();
    onTopicClick?.(topicName);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoggedIn && onFavoriteToggle) {
      onFavoriteToggle(resource.id);
    }
  };

  // YouTube modal state
  const [showYouTubeModal, setShowYouTubeModal] = useState(false);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  const handleYouTubePlay = (videoId: string) => {
    setPlayingVideoId(videoId);
    setShowYouTubeModal(true);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoggedIn && onFavoriteToggle) {
      onFavoriteToggle(resource.id);
    }
  };

  if (variant === 'hero') {
    return (
      <div
        onClick={() => onCardClick?.(resource)}
        className="bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-slate-700 cursor-pointer flex flex-col h-full overflow-hidden group"
      >
        <div className="w-full h-48 sm:h-56 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-slate-700 dark:to-slate-800 relative overflow-hidden flex items-center justify-center">
          <button
            onClick={handleFavoriteClick}
            disabled={!isLoggedIn}
            className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 z-10 ${isLoggedIn
              ? 'bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 hover:scale-110 shadow-md cursor-pointer'
              : 'bg-gray-200/50 dark:bg-slate-700/50 cursor-not-allowed'
              }`}
            title={!isLoggedIn ? 'Zaloguj się, aby dodać do ulubionych' : isFavorite ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
          >
            <Heart
              size={20}
              className={`transition-colors ${isFavorite && isLoggedIn
                ? 'fill-red-500 text-red-500'
                : isLoggedIn
                  ? 'text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400'
                  : 'text-gray-400 dark:text-gray-500'
                }`}
            />
          </button>
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={resource.title}
              className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-gray-400 dark:text-gray-500">
              <ImageIcon size={48} />
            </div>
          )}
        </div>

        <div className="p-6 flex flex-col flex-1">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                {resource.subject_name}
              </span>
              {levels.slice(0, 2).map((level) => (
                <span key={level.id} className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300">
                  {level.name}
                </span>
              ))}
              {resource.language && (
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 uppercase border border-purple-100 dark:border-purple-800">
                  {resource.language}
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {resource.title}
            </h3>
            {resource.description && (
              <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-4 mb-4">
                {resource.description}
              </p>
            )}
          </div>

          <div className="mt-auto pt-4 border-t border-gray-100 dark:border-slate-700 flex flex-col gap-3">
            {topics.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {topics.slice(0, 3).map((topic) => (
                  <span
                    key={topic.topic_id}
                    className="inline-block px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded"
                  >
                    {topic.topic_name}
                  </span>
                ))}
                {topics.length > 3 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 px-1">
                    +{topics.length - 3}
                  </span>
                )}
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <Star
                    size={16}
                    className={`text-yellow-400 ${hasRatings ? 'fill-current' : ''}`}
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {hasRatings ? overallRating?.toFixed(1) : 'Dodaj pierwszą ocenę'}
                  </span>
                </div>
                {(resource.comments_count || 0) > 0 && (
                  <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                    <MessageSquare size={16} />
                    <span>{resource.comments_count}</span>
                  </div>
                )}
              </div>
              <ResourceActionButton
                url={resource.url}
                onYouTubePlay={handleYouTubePlay}
              />
            </div>
          </div>
        </div>

        {/* YouTube Modal */}
        {showYouTubeModal && playingVideoId && (
          <YouTubeModal
            videoId={playingVideoId}
            isOpen={showYouTubeModal}
            onClose={() => setShowYouTubeModal(false)}
          />
        )}
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div
        onClick={() => onCardClick?.(resource)}
        className="bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 border border-gray-200 dark:border-slate-700 cursor-pointer flex gap-4 items-center"
      >
        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 dark:from-slate-700 dark:to-slate-800 flex-shrink-0 border border-gray-200 dark:border-slate-700 flex items-center justify-center relative">
          <button
            onClick={handleFavoriteClick}
            disabled={!isLoggedIn}
            className={`absolute -top-2 -right-2 p-1.5 rounded-full transition-all duration-200 z-10 ${isLoggedIn
              ? 'bg-white dark:bg-slate-800 hover:scale-110 shadow-md cursor-pointer'
              : 'bg-gray-200 dark:bg-slate-700 cursor-not-allowed'
              }`}
            title={!isLoggedIn ? 'Zaloguj się, aby dodać do ulubionych' : isFavorite ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
          >
            <Heart
              size={14}
              className={`transition-colors ${isFavorite && isLoggedIn
                ? 'fill-red-500 text-red-500'
                : isLoggedIn
                  ? 'text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400'
                  : 'text-gray-400 dark:text-gray-500'
                }`}
            />
          </button>
          {thumbnailUrl ? (
            <img src={thumbnailUrl} alt={resource.title} className="w-full h-full object-contain" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-gray-400 dark:text-gray-500">
              <ImageIcon size={20} />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate mb-1">
            {resource.title}
          </h3>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
              <span>{resource.subject_name}</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Star size={14} className={`text-yellow-400 ${hasRatings ? 'fill-current' : ''}`} />
                <span>{hasRatings ? overallRating?.toFixed(1) : 'Dodaj pierwszą ocenę'}</span>
              </div>
            </div>
            {topics.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {topics.slice(0, 3).map((topic) => (
                  <span
                    key={topic.topic_id}
                    className="inline-block px-1.5 py-0.5 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 text-xs rounded"
                  >
                    {topic.topic_name}
                  </span>
                ))}
                {topics.length > 3 && (
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    +{topics.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex-shrink-0">
          <ResourceActionButton
            url={resource.url}
            onYouTubePlay={handleYouTubePlay}
          />
        </div>

        {/* YouTube Modal */}
        {showYouTubeModal && playingVideoId && (
          <YouTubeModal
            videoId={playingVideoId}
            isOpen={showYouTubeModal}
            onClose={() => setShowYouTubeModal(false)}
          />
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div
      onClick={() => onCardClick?.(resource)}
      className="bg-white dark:bg-slate-800 rounded-lg shadow hover:shadow-lg transition-shadow p-6 border border-gray-200 dark:border-slate-700 cursor-pointer flex flex-col h-full relative"
    >
      <div className="flex items-start gap-4 mb-4">
        <button
          onClick={handleFavoriteClick}
          disabled={!isLoggedIn}
          className={`absolute top-4 right-4 p-2 rounded-full transition-all duration-200 z-10 ${isLoggedIn
            ? 'bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 hover:scale-110 shadow-md cursor-pointer'
            : 'bg-gray-200 dark:bg-slate-700 cursor-not-allowed'
            }`}
          title={!isLoggedIn ? 'Zaloguj się, aby dodać do ulubionych' : isFavorite ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
        >
          <Heart
            size={18}
            className={`transition-colors ${isFavorite && isLoggedIn
              ? 'fill-red-500 text-red-500'
              : isLoggedIn
                ? 'text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400'
                : 'text-gray-400 dark:text-gray-500'
              }`}
          />
        </button>
        <div className="w-24 h-24 rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 dark:from-slate-700 dark:to-slate-800 flex-shrink-0 border border-gray-200 dark:border-slate-700 flex items-center justify-center">
          {thumbnailUrl ? (
            <img src={thumbnailUrl} alt="Miniatura zasobu" className="w-full h-full object-contain" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-gray-400 dark:text-gray-500">
              <ImageIcon size={32} />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
            {resource.subject_name}
          </span>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 my-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {resource.title}
          </h3>
        </div>
      </div>

      {resource.description && (
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
          {resource.description}
        </p>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        {levels.map((level) => (
          <span
            key={level.id}
            className="inline-block px-2 py-1 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 text-xs rounded-full"
          >
            {level.name}
          </span>
        ))}
        {resource.language && (
          <span className="inline-block px-2 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full uppercase border border-purple-100 dark:border-purple-800">
            {resource.language}
          </span>
        )}
      </div>

      {topics.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {topics.slice(0, 3).map((topic) => (
            <button
              key={topic.topic_id}
              onClick={(e) => handleTopicClick(e, topic.topic_name)}
              className="inline-block px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors cursor-pointer"
            >
              {topic.topic_name}
            </button>
          ))}
          {topics.length > 3 && (
            <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
              +{topics.length - 3} więcej
            </span>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 pt-4 mt-4 border-t border-gray-100 dark:border-slate-700">
        <div className="flex items-center gap-1 text-sm">
          <Star
            size={16}
            className={`${getRatingColor(overallRating)} ${hasRatings ? 'fill-current' : ''}`}
          />
          {hasRatings ? (
            <div className="flex items-center gap-1">
              <span className="font-medium text-gray-900 dark:text-gray-100">{overallRating?.toFixed(1)}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">({resource.ratings_count})</span>
            </div>
          ) : (
            <span className="text-xs text-gray-500 dark:text-gray-400">Dodaj pierwszą ocenę</span>
          )}
        </div>

        {(resource.comments_count || 0) > 0 && (
          <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
            <MessageSquare size={16} />
            <span>{resource.comments_count}</span>
          </div>
        )}

        <div className="ml-auto">
          <ResourceActionButton
            url={resource.url}
            onYouTubePlay={handleYouTubePlay}
          />
        </div>
      </div>

      {/* YouTube Modal */}
      {showYouTubeModal && playingVideoId && (
        <YouTubeModal
          videoId={playingVideoId}
          isOpen={showYouTubeModal}
          onClose={() => setShowYouTubeModal(false)}
        />
      )}
    </div>
  );
}
