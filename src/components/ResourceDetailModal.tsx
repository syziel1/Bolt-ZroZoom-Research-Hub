import React, { useState, useEffect, useCallback } from 'react';
import { supabase, Resource, ResourceTopic } from '../lib/supabase';
import { useRecentResources } from '../hooks/useRecentResources';
import { getThumbnailUrl } from '../lib/storage';
import { getYouTubeEmbedUrl, extractYouTubeVideoId } from '../lib/youtube';
import { ResourceActionButton } from './ResourceActionButton';
import { YouTubeModal } from './YouTubeModal';
import { ResourceRatingSection } from './resource-detail/ResourceRatingSection';
import { ResourceCommentsSection } from './resource-detail/ResourceCommentsSection';
import { X, Edit, Trash2, Video, FileText, Presentation, Beaker, Wrench, User, Globe, Calendar, Sparkles, Heart, Share2, Check } from 'lucide-react';
import { ConfirmationModal } from './ConfirmationModal';
import { ExternalLinkWarningModal } from './ExternalLinkWarningModal';
import { isTrustedDomain } from '../lib/external-links';

type ResourceDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  resource: Resource | null;
  onResourceUpdated: () => void;
  isGuestMode?: boolean;
  onEdit?: (resource: Resource) => void;
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

/**
 * Parse a timestamp string (mm:ss or hh:mm:ss) to seconds with validation.
 * Returns null if the timestamp is malformed or invalid.
 */
function parseTimestamp(timestamp: string): number | null {
  try {
    const parts = timestamp.split(':');
    if (parts.length < 2 || parts.length > 3) {
      return null;
    }
    
    const parsedParts = parts.map(p => {
      const num = parseInt(p, 10);
      if (isNaN(num) || num < 0) {
        return null;
      }
      return num;
    });
    
    if (parsedParts.some(p => p === null)) {
      return null;
    }
    
    const validParts = parsedParts as number[];
    
    // Validate ranges: seconds should be 0-59, minutes 0-59 for hh:mm:ss format
    if (parts.length === 2) {
      // Format: mm:ss - minutes can be any non-negative number for video timestamps
      const [minutes, seconds] = validParts;
      if (seconds > 59) return null;
      return minutes * 60 + seconds;
    } else {
      // Format: hh:mm:ss - both minutes and seconds should be 0-59
      const [hours, minutes, seconds] = validParts;
      if (minutes > 59 || seconds > 59) return null;
      return hours * 3600 + minutes * 60 + seconds;
    }
  } catch {
    return null;
  }
}

export function ResourceDetailModal({ isOpen, onClose, resource, onResourceUpdated, isGuestMode = false, onEdit }: ResourceDetailModalProps) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string>('student');
  const [deleteResourceConfirm, setDeleteResourceConfirm] = useState(false);
  const [topics, setTopics] = useState<ResourceTopic[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showYouTubeModal, setShowYouTubeModal] = useState(false);
  const [youTubeVideoId, setYouTubeVideoId] = useState<string | null>(null);
  const [videoStartTime, setVideoStartTime] = useState<number>(0);
  const [warningModalUrl, setWarningModalUrl] = useState<string | null>(null);
  const [showShareTooltip, setShowShareTooltip] = useState(false);

  const handleShare = async () => {
    if (!resource) return;
    const url = `${window.location.origin}/zasoby?r=${resource.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setShowShareTooltip(true);
      setTimeout(() => setShowShareTooltip(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, url: string) => {
    if (!isTrustedDomain(url)) {
      e.preventDefault();
      setWarningModalUrl(url);
    }
  };

  const handleConfirmNavigation = () => {
    if (warningModalUrl) {
      window.open(warningModalUrl, '_blank', 'noopener,noreferrer');
      setWarningModalUrl(null);
    }
  };

  const loadUserData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      if (profile) {
        setCurrentUserRole(profile.role || 'student');
      }
    }
  }, []);

  const checkFavoriteStatus = useCallback(async () => {
    if (!resource || isGuestMode) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('user_favorites')
        .select('id')
        .eq('resource_id', resource.id)
        .eq('user_id', user.id)
        .maybeSingle();
      setIsFavorite(!!data);
    }
  }, [resource, isGuestMode]);

  const toggleFavorite = async () => {
    if (!resource || !currentUserId) return;

    if (isFavorite) {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('resource_id', resource.id)
        .eq('user_id', currentUserId);

      if (!error) setIsFavorite(false);
    } else {
      const { error } = await supabase
        .from('user_favorites')
        .insert({
          resource_id: resource.id,
          user_id: currentUserId
        });

      if (!error) setIsFavorite(true);
    }
  };

  const loadTopics = useCallback(async () => {
    if (!resource) return;
    const { data } = await supabase
      .from('v_resource_topics')
      .select('topic_id, topic_name, topic_slug, parent_topic_id, subject_slug')
      .eq('resource_id', resource.id);

    if (data) {
      setTopics(data);
    }
  }, [resource]);

  const { addRecent } = useRecentResources();

  useEffect(() => {
    if (isOpen && resource) {
      if (!isGuestMode) {
        loadUserData();
        checkFavoriteStatus();
        addRecent(resource.id);
      }
      loadTopics();
    }
  }, [isOpen, resource, isGuestMode, loadUserData, checkFavoriteStatus, loadTopics, addRecent]);

  const handleDeleteResourceClick = () => {
    setDeleteResourceConfirm(true);
  };

  const handleDeleteResourceConfirm = async () => {
    if (!resource) return;

    const { error } = await supabase
      .from('resources')
      .delete()
      .eq('id', resource.id);

    setDeleteResourceConfirm(false);
    if (!error) {
      onResourceUpdated();
      onClose();
    }
  };

  const handleYouTubePlay = (videoId: string) => {
    setYouTubeVideoId(videoId);
    setShowYouTubeModal(true);
  };

  const canEdit =
    !!resource &&
    !!currentUserId &&
    (resource.contributor_id === currentUserId || currentUserRole === 'admin');

  if (!isOpen || !resource) return null;

  const Icon = typeIcons[resource.type] || FileText;
  const thumbnailUrl = getThumbnailUrl(resource.thumbnail_path) || resource.thumbnail_url;

  const videoId = extractYouTubeVideoId(resource.url);
  const embedUrl = videoId ? getYouTubeEmbedUrl(videoId) : null;
  const finalEmbedUrl = embedUrl ? `${embedUrl}${embedUrl.includes('?') ? '&' : '?'}start=${videoStartTime}&autoplay=${videoStartTime > 0 ? '1' : '0'}` : undefined;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <div className="bg-white dark:bg-slate-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-slate-700">
          <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between z-10">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mr-auto">Szczegóły zasobu</h2>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-md transition-colors relative"
                title="Udostępnij link"
              >
                {showShareTooltip ? (
                  <>
                    <Check size={16} className="text-green-600 dark:text-green-400" />
                    <span className="text-green-600 dark:text-green-400">Skopiowano!</span>
                  </>
                ) : (
                  <>
                    <Share2 size={16} />
                    <span>Udostępnij</span>
                  </>
                )}
              </button>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors ml-4"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-6">
            <div className="flex flex-col md:flex-row items-start gap-6 mb-6">
              <div className="flex-shrink-0 w-full md:w-1/2 aspect-video bg-gradient-to-br from-gray-100 to-gray-50 dark:from-slate-700 dark:to-slate-800 rounded-lg border border-gray-200 dark:border-slate-600 shadow-sm flex items-center justify-center overflow-hidden">
                {embedUrl ? (
                  <iframe
                    key={videoStartTime} // Force reload on seek
                    src={finalEmbedUrl}
                    title={resource.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : thumbnailUrl ? (
                  <img
                    src={thumbnailUrl}
                    alt={resource.title}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="bg-blue-50 dark:bg-blue-900/30 p-6 rounded-lg flex items-center justify-center">
                    <Icon size={48} className="text-blue-600 dark:text-blue-400" />
                  </div>
                )}
              </div>
              <div className="flex-1 w-full">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {resource.title}
                </h3>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <span className="px-2 py-1 bg-gray-100 dark:bg-slate-700 rounded text-gray-700 dark:text-gray-300 font-medium">
                    {resource.subject_name}
                  </span>

                  {resource.language && (
                    <span className="flex items-center gap-1" title="Język">
                      <Globe size={16} />
                      {resource.language.toUpperCase()}
                    </span>
                  )}

                  {resource.contributor_nick && (
                    <span className="flex items-center gap-1" title="Dodane przez">
                      <User size={16} />
                      {resource.contributor_nick}
                    </span>
                  )}

                  {resource.created_at && (
                    <span className="flex items-center gap-1" title="Data dodania">
                      <Calendar size={16} />
                      {new Date(resource.created_at).toLocaleDateString()}
                    </span>
                  )}

                  {resource.ai_generated && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium border border-purple-200 dark:border-purple-800">
                      <Sparkles size={12} />
                      AI
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <ResourceActionButton
                    url={resource.url}
                    variant="large"
                    onYouTubePlay={handleYouTubePlay}
                  />

                  {!isGuestMode && (
                    <button
                      onClick={toggleFavorite}
                      className={`p-2 rounded-lg border transition-colors ${isFavorite
                        ? 'bg-red-50 border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
                        : 'bg-white border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 dark:bg-slate-800 dark:border-slate-600 dark:text-gray-500 dark:hover:text-red-400'
                        }`}
                      title={isFavorite ? "Usuń z ulubionych" : "Dodaj do ulubionych"}
                    >
                      <Heart size={20} className={isFavorite ? "fill-current" : ""} />
                    </button>
                  )}
                </div>
              </div>
              {canEdit && (
                <div className="flex gap-2 ml-auto">
                  <button
                    onClick={() => onEdit?.(resource)}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-2 transition-colors"
                    title="Edytuj zasób"
                  >
                    <Edit size={20} />
                  </button>
                  <button
                    onClick={handleDeleteResourceClick}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-2 transition-colors"
                    title="Usuń zasób"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              )}
            </div>

            {resource.description && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Opis</h4>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {resource.description.split(/((?:https?:\/\/[^\s]+)|(?:\b\d{1,2}:\d{2}(?::\d{2})?\b))/g).map((part, i) => {
                    // Handle URLs
                    if (part.match(/^https?:\/\/[^\s]+$/)) {
                      return (
                        <a
                          key={i}
                          href={part}
                          onClick={(e) => handleLinkClick(e, part)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline break-all"
                        >
                          {part}
                        </a>
                      );
                    }

                    // Handle timestamps (e.g., 2:30, 12:45, 1:05:20)
                    if (part.match(/^\d{1,2}:\d{2}(?::\d{2})?$/)) {
                      const seconds = parseTimestamp(part);
                      
                      // If parsing fails, render as plain text
                      if (seconds === null) {
                        return part;
                      }
                      
                      return (
                        <button
                          key={i}
                          onClick={() => {
                            if (embedUrl) {
                              const newUrl = new URL(embedUrl);
                              newUrl.searchParams.set('start', seconds.toString());
                              newUrl.searchParams.set('autoplay', '1');
                              // Force iframe reload by updating key or similar, but here we just update src
                              // A simple way to force reload is to update the state that controls the iframe
                              // But since we don't have that state exposed easily, we might need to update the key of the iframe
                              // For now, let's try to update the iframe src directly if possible or use a ref
                            }
                            // Since we can't easily update the iframe src without state, let's use a state for the start time
                            setVideoStartTime(seconds);
                          }}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium hover:underline cursor-pointer bg-blue-50 dark:bg-blue-900/30 px-1.5 rounded mx-0.5"
                          title={`Przewiń do ${part}`}
                        >
                          {part}
                        </button>
                      );
                    }

                    return part;
                  })}
                </p>
              </div>
            )}

            <div className="mb-6">
              <div className="flex flex-wrap gap-2 mb-2">
                {resource.level_names?.map((level, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 text-sm rounded-full border border-gray-200 dark:border-slate-600"
                  >
                    {level}
                  </span>
                ))}
              </div>
              {topics.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {topics.map((topic) => (
                    <span
                      key={topic.topic_id}
                      className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm rounded border border-blue-100 dark:border-blue-800"
                    >
                      {topic.topic_name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <ResourceRatingSection
              resourceId={resource.id}
              isGuestMode={isGuestMode}
              onRatingUpdate={onResourceUpdated}
            />

            <ResourceCommentsSection
              resourceId={resource.id}
              isGuestMode={isGuestMode}
              onUpdate={onResourceUpdated}
            />
          </div>
        </div>

        <ConfirmationModal
          isOpen={deleteResourceConfirm}
          title="Usuń zasób"
          message="Czy na pewno chcesz usunąć ten zasób?"
          confirmLabel="Usuń"
          cancelLabel="Anuluj"
          onConfirm={handleDeleteResourceConfirm}
          onCancel={() => setDeleteResourceConfirm(false)}
          variant="danger"
        />
      </div>

      {showYouTubeModal && youTubeVideoId && (
        <YouTubeModal
          videoId={youTubeVideoId}
          isOpen={showYouTubeModal}
          onClose={() => setShowYouTubeModal(false)}
        />
      )}

      <ExternalLinkWarningModal
        isOpen={!!warningModalUrl}
        onClose={() => setWarningModalUrl(null)}
        onConfirm={handleConfirmNavigation}
        url={warningModalUrl || ''}
      />
    </>
  );
}
