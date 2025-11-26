import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Trash2, Loader, MessageSquare } from 'lucide-react';
import { ConfirmationModal } from './ConfirmationModal';

type Comment = {
    id: string;
    content: string;
    created_at: string;
    author_nick: string;
    resource_title: string;
};

type CommentsManagerProps = {
    onCommentDeleted?: () => void;
};

export function CommentsManager({ onCommentDeleted }: CommentsManagerProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; snippet: string } | null>(null);

    const loadComments = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('comments')
                .select(`
          id,
          content,
          created_at,
          author:author_id(nick),
          resource:resource_id(title)
        `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data) {
                const formattedComments = data.map((item: any) => ({
                    id: item.id,
                    content: item.content,
                    created_at: item.created_at,
                    author_nick: item.author?.nick || 'Nieznany',
                    resource_title: item.resource?.title || 'Usunięty zasób',
                }));
                setComments(formattedComments);
            }
        } catch (err) {
            console.error('Error loading comments:', err);
            setError('Nie udało się załadować komentarzy.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadComments();
    }, [loadComments]);

    const handleDeleteClick = (comment: Comment) => {
        const snippet = comment.content.length > 50
            ? comment.content.substring(0, 50) + '...'
            : comment.content;
        setDeleteConfirm({ id: comment.id, snippet });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteConfirm) return;

        try {
            const { error } = await supabase
                .from('comments')
                .delete()
                .eq('id', deleteConfirm.id);

            if (error) throw error;

            setDeleteConfirm(null);
            loadComments();

            if (onCommentDeleted) {
                onCommentDeleted();
            }
        } catch (err) {
            console.error('Error deleting comment:', err);
            setError('Nie udało się usunąć komentarza.');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader className="animate-spin text-blue-600" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Zarządzanie Komentarzami</h2>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md flex justify-between items-center">
                    <span>{error}</span>
                    <button onClick={() => setError('')} className="underline text-sm">Zamknij</button>
                </div>
            )}

            <div className="bg-white shadow overflow-hidden rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                                Data
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                                Autor
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                                Zasób
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Treść
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                                Akcje
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {comments.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                    <MessageSquare className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                                    <p>Brak komentarzy do wyświetlenia</p>
                                </td>
                            </tr>
                        ) : (
                            comments.map((comment) => (
                                <tr key={comment.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(comment.created_at).toLocaleDateString()}
                                        <br />
                                        <span className="text-xs text-gray-400">
                                            {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {comment.author_nick}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        <span className="line-clamp-2" title={comment.resource_title}>
                                            {comment.resource_title}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700">
                                        <p className="whitespace-pre-wrap">{comment.content}</p>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleDeleteClick(comment)}
                                            className="text-red-600 hover:text-red-900 p-2 rounded hover:bg-red-50 transition-colors"
                                            title="Usuń komentarz"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <ConfirmationModal
                isOpen={deleteConfirm !== null}
                title="Usuń komentarz"
                message={deleteConfirm ? `Czy na pewno chcesz usunąć komentarz: "${deleteConfirm.snippet}"?` : ''}
                confirmLabel="Usuń"
                cancelLabel="Anuluj"
                onConfirm={handleDeleteConfirm}
                onCancel={() => setDeleteConfirm(null)}
                variant="danger"
            />
        </div>
    );
}
