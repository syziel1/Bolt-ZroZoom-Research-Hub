import React, { useState, useEffect, useCallback } from 'react';
import { supabase, Resource, ResourceTopic } from '../lib/supabase';
import { useRecentResources } from '../hooks/useRecentResources';
import { getThumbnailUrl } from '../lib/storage';
import { getYouTubeEmbedUrl, extractYouTubeVideoId } from '../lib/youtube';
import { ResourceActionButton } from './ResourceActionButton';
import { YouTubeModal } from './YouTubeModal';
import { ResourceRatingSection } from './resource-detail/ResourceRatingSection';
import { ResourceCommentsSection } from './resource-detail/ResourceCommentsSection';
import { X, Edit, Trash2, Video, FileText, Presentation, Beaker, Wrench, User, Globe, Calendar, Sparkles, Heart } from 'lucide-react';
import { ConfirmationModal } from './ConfirmationModal';

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

const getYouTubeEmbedUrl = (url: string): string | null => {
  if (!url) return null;

  // Handle various YouTube URL formats
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);

  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}`;
  }

  return null;
};

export function ResourceDetailModal({ isOpen, onClose, resource, onResourceUpdated, isGuestMode = false, onEdit }: ResourceDetailModalProps) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string>('student');
  const [deleteResourceConfirm, setDeleteResourceConfirm] = useState(false);
  const [topics, setTopics] = useState<ResourceTopic[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showYouTubeModal, setShowYouTubeModal] = useState(false);
  const [youTubeVideoId, setYouTubeVideoId] = useState<string | null>(null);

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

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <div className="bg-white dark:bg-slate-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-slate-700">
          <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between z-10">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Szczegóły zasobu</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-6">
            <div className="flex flex-col md:flex-row items-start gap-6 mb-6">
              <div className="flex-shrink-0 w-full md:w-80 aspect-video bg-gradient-to-br from-gray-100 to-gray-50 dark:from-slate-700 dark:to-slate-800 rounded-lg border border-gray-200 dark:border-slate-600 shadow-sm flex items-center justify-center overflow-hidden">
                {embedUrl ? (
                  <iframe
                    src={embedUrl}
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
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{resource.description}</p>
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
    </>
  );
}
