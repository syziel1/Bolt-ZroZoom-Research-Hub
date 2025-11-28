import React, { useState } from 'react';
import { Resource, ResourceTopic, ResourceLevel } from '../lib/supabase';
import { getThumbnailUrl } from '../lib/storage';
import { YouTubeModal } from './YouTubeModal';
import { ResourceActionButton } from './ResourceActionButton';
import { Star, ImageIcon, MessageSquare, Heart, Globe, Calendar, User } from 'lucide-react';

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

export function ResourceCard({ resource, topics = [], levels = [], onCardClick, variant = 'default', isFavorite = false, onFavoriteToggle, isLoggedIn = true }: ResourceCardProps) {
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

  const favoriteTooltip = !isLoggedIn
    ? 'Zaloguj się, aby dodać do swoich ulubionych'
    : isFavorite
      ? 'Usuń z ulubionych'
      : 'Dodaj do ulubionych';

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const InfoBadge = ({ icon: Icon, text }: { icon: any, text: string }) => (
    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
      <Icon size={14} />
      <span>{text}</span>
    </div>
  );

  if (variant === 'hero') {
    return (
      <div
        onClick={() => onCardClick?.(resource)}
        className="bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-slate-700 cursor-pointer flex flex-col h-full overflow-hidden group"
      >
        {/* Full width thumbnail */}
        <div className="w-full h-48 sm:h-56 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-slate-700 dark:to-slate-800 relative overflow-hidden flex items-center justify-center">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={resource.title}
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-gray-400 dark:text-gray-500">
              <ImageIcon size={48} />
            </div>
          )}
        </div>

        <div className="p-6 flex flex-col flex-1">
          {/* Subject | Topic | Subtopics */}
          <div className="flex flex-wrap items-center gap-2 mb-3 text-xs">
            <span className="font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              {resource.subject_name}
            </span>
            {topics.length > 0 && (
              <>
                <span className="text-gray-300 dark:text-gray-600">|</span>
                <div className="flex flex-wrap gap-1.5">
                  {topics.slice(0, 3).map((topic) => (
                    <span key={topic.topic_id} className="text-gray-600 dark:text-gray-300">
                      {topic.topic_name}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors capitalize">
            {resource.title}
          </h3>

          {/* Description */}
          {resource.description && (
            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-5 mb-4 leading-relaxed">
              {resource.description}
            </p>
          )}

          {/* Levels */}
          <div className="flex flex-wrap gap-2 mb-6">
            {levels.map((level) => (
              <span key={level.id} className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300">
                {level.name}
              </span>
            ))}
          </div>

          {/* Bottom Row */}
          <div className="mt-auto pt-4 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between gap-4">
            <div className="flex flex-wrap gap-4">
              {resource.language && (
                <InfoBadge icon={Globe} text={resource.language.toUpperCase()} />
              )}
              <InfoBadge icon={Calendar} text={formatDate(resource.created_at)} />
            </div>
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

  // Default variant (and list variant fallback for now)
  return (
    <div
      onClick={() => onCardClick?.(resource)}
      className="bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-5 border border-gray-200 dark:border-slate-700 cursor-pointer flex flex-col h-full relative group w-full max-w-4xl mx-auto"
    >
      {/* Top Section */}
      <div className="flex gap-5 mb-4">
        {/* Thumbnail (Left, Max 50%) */}
        <div className="w-1/2 max-w-[200px] aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-slate-700 relative flex-shrink-0 border border-gray-100 dark:border-slate-600">
          {thumbnailUrl ? (
            <img src={thumbnailUrl} alt={resource.title} className="w-full h-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-gray-400 dark:text-gray-500">
              <ImageIcon size={32} />
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex justify-between items-start gap-2">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2 block">
              {resource.subject_name}
            </span>
            <button
              onClick={handleFavoriteClick}
              disabled={!isLoggedIn}
              className={`p-1.5 rounded-full transition-all duration-200 ${isLoggedIn
                ? 'hover:bg-gray-100 dark:hover:bg-slate-700 hover:scale-110'
                : 'opacity-50 cursor-not-allowed'
                }`}
              title={favoriteTooltip}
            >
              <Heart
                size={18}
                className={`transition-colors ${isFavorite && isLoggedIn
                  ? 'fill-red-500 text-red-500'
                  : 'text-gray-400 dark:text-gray-500'
                  }`}
              />
            </button>
          </div>

          {/* Topics */}
          {topics.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {topics.slice(0, 3).map((topic) => (
                <span
                  key={topic.topic_id}
                  className="inline-block px-2 py-0.5 bg-gray-50 dark:bg-slate-700/50 text-gray-600 dark:text-gray-300 text-xs rounded border border-gray-100 dark:border-slate-600"
                >
                  {topic.topic_name}
                </span>
              ))}
              {topics.length > 3 && (
                <span className="text-xs text-gray-400 dark:text-gray-500 px-1">
                  +{topics.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Middle Section */}
      <div className="flex-1 flex flex-col">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors capitalize">
          {resource.title}
        </h3>

        {resource.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-5 leading-relaxed">
            {resource.description}
          </p>
        )}

        <div className="flex flex-wrap gap-2 mb-4 mt-auto">
          {levels.map((level) => (
            <span
              key={level.id}
              className="inline-block px-2 py-0.5 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 text-xs rounded-full"
            >
              {level.name}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="pt-4 mt-2 border-t border-gray-100 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3 gap-y-2">
          {resource.language && (
            <InfoBadge icon={Globe} text={resource.language.toUpperCase()} />
          )}
          {resource.contributor_nick && (
            <InfoBadge icon={User} text={resource.contributor_nick} />
          )}
          <InfoBadge icon={Calendar} text={formatDate(resource.created_at)} />
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1">
              <Star
                size={16}
                className={`${getRatingColor(overallRating)} ${hasRatings ? 'fill-current' : ''}`}
              />
              {hasRatings ? (
                <span className="font-medium text-gray-900 dark:text-gray-100">{overallRating?.toFixed(1)}</span>
              ) : (
                <span className="text-xs text-gray-400">Brak ocen</span>
              )}
            </div>
            {(resource.comments_count || 0) > 0 && (
              <div className="flex items-center gap-1 text-gray-400">
                <MessageSquare size={16} />
                <span className="text-xs">{resource.comments_count}</span>
              </div>
            )}
          </div>

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
