import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { MessageSquare, Edit, Trash2 } from 'lucide-react';
import { ConfirmationModal } from '../ConfirmationModal';
import { containsProfanity } from '../../lib/profanity';

type Comment = {
    id: string;
    content: string;
    author_nick: string;
    created_at: string;
    author_id: string;
};

type ResourceCommentsSectionProps = {
    resourceId: string;
    isGuestMode: boolean;
    onUpdate?: () => void;
};

export function ResourceCommentsSection({ resourceId, isGuestMode, onUpdate }: ResourceCommentsSectionProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [showCommentForm, setShowCommentForm] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [deleteCommentConfirm, setDeleteCommentConfirm] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [currentUserRole, setCurrentUserRole] = useState<string>('student');

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

    const loadComments = useCallback(async () => {
        const { data } = await supabase
            .from('comments')
            .select(`
        id,
        content,
        created_at,
        author_id,
        author:author_id (nick)
      `)
            .eq('resource_id', resourceId)
            .is('parent_comment_id', null)
            .order('created_at', { ascending: false });

        if (data) {
            setComments(data.map(c => ({
                ...c,
                author_nick: (c.author as unknown as { nick: string })?.nick || 'Nieznany',
            })));
        }
    }, [resourceId]);

    useEffect(() => {
        loadComments();
        if (!isGuestMode) {
            loadUserData();
        }
    }, [resourceId, isGuestMode, loadComments, loadUserData]);

    const handleSubmitComment = async () => {
        if (!currentUserId || !commentText.trim()) return;

        if (containsProfanity(commentText)) {
            alert('Twój komentarz zawiera niedozwolone słowa. Proszę, zachowaj kulturę wypowiedzi.');
            return;
        }

        setSubmitting(true);

        let error;

        if (editingCommentId) {
            const { error: updateError } = await supabase
                .from('comments')
                .update({ content: commentText.trim() })
                .eq('id', editingCommentId);
            error = updateError;
        } else {
            const { error: insertError } = await supabase
                .from('comments')
                .insert({
                    resource_id: resourceId,
                    author_id: currentUserId,
                    content: commentText.trim(),
                });
            error = insertError;
        }

        if (!error) {
            setCommentText('');
            setEditingCommentId(null);
            setShowCommentForm(false);
            loadComments();
            onUpdate?.();
        }
        setSubmitting(false);
    };

    const handleEditCommentClick = (comment: Comment) => {
        setCommentText(comment.content);
        setEditingCommentId(comment.id);
        setShowCommentForm(true);
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
            onUpdate?.();
        }
    };

    return (
        <div className="border-t border-gray-200 dark:border-slate-700 pt-6">
            <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <MessageSquare size={20} />
                    Komentarze ({comments.length})
                </h4>
                {!isGuestMode && (
                    <button
                        onClick={() => {
                            if (showCommentForm) {
                                setShowCommentForm(false);
                                setEditingCommentId(null);
                                setCommentText('');
                            } else {
                                setShowCommentForm(true);
                            }
                        }}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium transition-colors"
                    >
                        {showCommentForm ? 'Anuluj' : 'Dodaj komentarz'}
                    </button>
                )}
            </div>

            {showCommentForm && (
                <div className="bg-gray-50 dark:bg-slate-900 p-4 rounded-lg mb-4 border border-gray-200 dark:border-slate-700">
                    <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Podziel się swoimi przemyśleniami..."
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                        rows={3}
                    />
                    <button
                        onClick={handleSubmitComment}
                        disabled={submitting || !commentText.trim()}
                        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        {submitting ? 'Zapisywanie...' : (editingCommentId ? 'Zaktualizuj komentarz' : 'Opublikuj komentarz')}
                    </button>
                </div>
            )}

            <div className="space-y-3">
                {comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-50 dark:bg-slate-900 p-3 rounded-lg border border-gray-100 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{comment.author_nick}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {new Date(comment.created_at).toLocaleDateString()}
                                </span>
                                {(comment.author_id === currentUserId || currentUserRole === 'admin') && (
                                    <div className="flex gap-2">
                                        {comment.author_id === currentUserId && (
                                            <button
                                                onClick={() => handleEditCommentClick(comment)}
                                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                title="Edytuj komentarz"
                                            >
                                                <Edit size={14} />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDeleteCommentClick(comment.id)}
                                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                            title="Usuń komentarz"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{comment.content}</p>
                    </div>
                ))}
                {comments.length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">Brak komentarzy. Rozpocznij rozmowę!</p>
                )}
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
        </div>
    );
}
