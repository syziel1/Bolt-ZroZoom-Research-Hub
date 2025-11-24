import { useState, useEffect } from 'react';
import { supabase, Resource } from '../lib/supabase';
import { X, Star, MessageSquare, Edit, Trash2, ExternalLink, Video, FileText, Presentation, Beaker, Wrench } from 'lucide-react';
import { ConfirmationModal } from './ConfirmationModal';

type ResourceDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  resource: Resource | null;
  onResourceUpdated: () => void;
};

type Rating = {
  id: string;
  rating_usefulness: number;
  rating_correctness: number;
  difficulty_match: number | null;
  author_nick: string;
  created_at: string;
};

type Comment = {
  id: string;
  content: string;
  author_nick: string;
  created_at: string;
  author_id: string;
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

export function ResourceDetailModal({ isOpen, onClose, resource, onResourceUpdated }: ResourceDetailModalProps) {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string>('student');
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [ratingData, setRatingData] = useState({
    usefulness: 5,
    correctness: 5,
    difficulty: 3,
  });
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [userHasRated, setUserHasRated] = useState(false);
  const [deleteCommentConfirm, setDeleteCommentConfirm] = useState<string | null>(null);
  const [deleteResourceConfirm, setDeleteResourceConfirm] = useState(false);

  useEffect(() => {
    if (isOpen && resource) {
      loadUserData();
      loadRatings();
      loadComments();
      checkUserRating();
    }
  }, [isOpen, resource]);

  const loadUserData = async () => {
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
  };

  const checkUserRating = async () => {
    if (!resource) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('ratings')
        .select('id')
        .eq('resource_id', resource.id)
        .eq('author_id', user.id)
        .maybeSingle();
      setUserHasRated(!!data);
    }
  };

  const loadRatings = async () => {
    if (!resource) return;
    const { data } = await supabase
      .from('ratings')
      .select(`
        id,
        rating_usefulness,
        rating_correctness,
        difficulty_match,
        created_at,
        author:author_id (nick)
      `)
      .eq('resource_id', resource.id)
      .order('created_at', { ascending: false });

    if (data) {
      setRatings(data.map(r => ({
        ...r,
        author_nick: (r.author as any)?.nick || 'Unknown',
      })));
    }
  };

  const loadComments = async () => {
    if (!resource) return;
    const { data } = await supabase
      .from('comments')
      .select(`
        id,
        content,
        created_at,
        author_id,
        author:author_id (nick)
      `)
      .eq('resource_id', resource.id)
      .is('parent_comment_id', null)
      .order('created_at', { ascending: false });

    if (data) {
      setComments(data.map(c => ({
        ...c,
        author_nick: (c.author as any)?.nick || 'Unknown',
      })));
    }
  };

  const handleSubmitRating = async () => {
    if (!resource || !currentUserId || userHasRated) return;

    setSubmitting(true);
    const { error } = await supabase
      .from('ratings')
      .insert({
        resource_id: resource.id,
        author_id: currentUserId,
        rating_usefulness: ratingData.usefulness,
        rating_correctness: ratingData.correctness,
        difficulty_match: ratingData.difficulty,
      });

    if (!error) {
      setShowRatingForm(false);
      setUserHasRated(true);
      loadRatings();
      onResourceUpdated();
    }
    setSubmitting(false);
  };

  const handleSubmitComment = async () => {
    if (!resource || !currentUserId || !commentText.trim()) return;

    setSubmitting(true);
    const { error } = await supabase
      .from('comments')
      .insert({
        resource_id: resource.id,
        author_id: currentUserId,
        content: commentText.trim(),
      });

    if (!error) {
      setCommentText('');
      setShowCommentForm(false);
      loadComments();
    }
    setSubmitting(false);
  };

  const handleDeleteCommentClick = (commentId: string) => {
    setDeleteCommentConfirm(commentId);
  };

  const handleDeleteCommentConfirm = async () => {
    if (!deleteCommentConfirm) return;

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', deleteCommentConfirm);

    setDeleteCommentConfirm(null);
    if (!error) {
      loadComments();
    }
  };

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

  const canEdit = resource && currentUserId && (
    resource.contributor_nick === currentUserRole ||
    currentUserRole === 'admin'
  );

  if (!isOpen || !resource) return null;

  const Icon = typeIcons[resource.type] || FileText;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Szczegóły zasobu</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-blue-50 p-3 rounded-lg">
              <Icon size={32} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {resource.title}
              </h3>
              <p className="text-sm text-gray-600 mb-2">{resource.subject_name}</p>
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
              >
                Otwórz zasób
                <ExternalLink size={14} />
              </a>
            </div>
            {canEdit && (
              <div className="flex gap-2">
                <button className="text-blue-600 hover:text-blue-800 p-2">
                  <Edit size={20} />
                </button>
                <button
                  onClick={handleDeleteResourceClick}
                  className="text-red-600 hover:text-red-800 p-2"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            )}
          </div>

          {resource.description && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-2">Opis</h4>
              <p className="text-gray-700">{resource.description}</p>
            </div>
          )}

          <div className="mb-6">
            <div className="flex flex-wrap gap-2 mb-2">
              {resource.level_names?.map((level, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                >
                  {level}
                </span>
              ))}
            </div>
            {resource.topic_names && resource.topic_names.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {resource.topic_names.map((topic, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 pt-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Star className="text-yellow-500 fill-yellow-500" size={20} />
                Oceny ({ratings.length})
              </h4>
              {!userHasRated && (
                <button
                  onClick={() => setShowRatingForm(!showRatingForm)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  {showRatingForm ? 'Anuluj' : 'Dodaj ocenę'}
                </button>
              )}
            </div>

            {showRatingForm && (
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Przydatność: {ratingData.usefulness}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={ratingData.usefulness}
                      onChange={(e) => setRatingData({ ...ratingData, usefulness: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Poprawność: {ratingData.correctness}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={ratingData.correctness}
                      onChange={(e) => setRatingData({ ...ratingData, correctness: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dopasowanie trudności: {ratingData.difficulty}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={ratingData.difficulty}
                      onChange={(e) => setRatingData({ ...ratingData, difficulty: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                  <button
                    onClick={handleSubmitRating}
                    disabled={submitting}
                    className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {submitting ? 'Wysyłanie...' : 'Wyślij ocenę'}
                  </button>
                </div>
              </div>
            )}

            {userHasRated && !showRatingForm && (
              <p className="text-sm text-gray-600 mb-4">Już oceniłeś ten zasób.</p>
            )}

            <div className="space-y-3">
              {ratings.map((rating) => (
                <div key={rating.id} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{rating.author_nick}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(rating.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex gap-4 text-sm text-gray-700">
                    <span>Przydatność: {rating.rating_usefulness}/5</span>
                    <span>Poprawność: {rating.rating_correctness}/5</span>
                    {rating.difficulty_match && (
                      <span>Trudność: {rating.difficulty_match}/5</span>
                    )}
                  </div>
                </div>
              ))}
              {ratings.length === 0 && (
                <p className="text-sm text-gray-500">Brak ocen. Bądź pierwszy!</p>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <MessageSquare size={20} />
                Komentarze ({comments.length})
              </h4>
              <button
                onClick={() => setShowCommentForm(!showCommentForm)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                {showCommentForm ? 'Anuluj' : 'Dodaj komentarz'}
              </button>
            </div>

            {showCommentForm && (
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Podziel się swoimi przemyśleniami..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                  rows={3}
                />
                <button
                  onClick={handleSubmitComment}
                  disabled={submitting || !commentText.trim()}
                  className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Publikowanie...' : 'Opublikuj komentarz'}
                </button>
              </div>
            )}

            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{comment.author_nick}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                      {(comment.author_id === currentUserId || currentUserRole === 'admin') && (
                        <button
                          onClick={() => handleDeleteCommentClick(comment.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">{comment.content}</p>
                </div>
              ))}
              {comments.length === 0 && (
                <p className="text-sm text-gray-500">Brak komentarzy. Rozpocznij rozmowę!</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={deleteCommentConfirm !== null}
        title="Usuń komentarz"
        message="Czy na pewno chcesz usunąć ten komentarz?"
        confirmLabel="Usuń"
        cancelLabel="Anuluj"
        onConfirm={handleDeleteCommentConfirm}
        onCancel={() => setDeleteCommentConfirm(null)}
        variant="danger"
      />

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
  );
}
