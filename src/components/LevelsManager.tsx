import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { generateSlug } from '../lib/utils';
import { Plus, Edit, Trash2, ChevronUp, ChevronDown, Save, X } from 'lucide-react';
import { ConfirmationModal } from './ConfirmationModal';

type Level = {
    id: string;
    name: string;
    slug: string;
    order_index: number;
};

export function LevelsManager() {
    const [levels, setLevels] = useState<Level[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({ name: '', slug: '' });
    const [error, setError] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

    useEffect(() => {
        loadLevels();
    }, []);

    const loadLevels = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('levels')
                .select('*')
                .order('order_index');

            if (error) throw error;
            setLevels(data || []);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        setError('');
        if (!formData.name.trim()) {
            setError('Nazwa jest wymagana');
            return;
        }
        // Validate custom slug if provided
        if (formData.slug) {
            if (!/^[a-z0-9-]+$/.test(formData.slug)) {
                setError('Slug może zawierać tylko małe litery, cyfry i myślniki');
                return;
            }
        }
        try {
            const slug = formData.slug ? generateSlug(formData.slug) : generateSlug(formData.name);
            const maxOrder = Math.max(...levels.map(l => l.order_index), -1);

            const { error } = await supabase
                .from('levels')
                .insert({
                    name: formData.name.trim(),
                    slug,
                    order_index: maxOrder + 1
                });

            if (error) throw error;

            setFormData({ name: '', slug: '' });
            setIsAdding(false);
            loadLevels();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        }
    };

    const handleEdit = async (id: string) => {
        setError('');
        if (!formData.name.trim()) {
            setError('Nazwa jest wymagana');
            return;
        }

        try {
            const slug = formData.slug ? generateSlug(formData.slug) : generateSlug(formData.name);

            const { error } = await supabase
                .from('levels')
                .update({
                    name: formData.name.trim(),
                    slug
                })
                .eq('id', id);

            if (error) throw error;

            setEditingId(null);
            setFormData({ name: '', slug: '' });
            loadLevels();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        }
    };

    const handleDeleteClick = (id: string, name: string) => {
        setDeleteConfirm({ id, name });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteConfirm) return;

        const { id, name } = deleteConfirm;
        setDeleteConfirm(null);
        setError('');

        // First, check if level has resources
        try {
            const { count, error: countError } = await supabase
                .from('resource_levels')
                .select('*', { count: 'exact', head: true })
                .eq('level_id', id);

            if (countError) {
                setError(`Błąd podczas sprawdzania zasobów przypisanych do poziomu "${name}": ${countError.message}`);
                return;
            }

            if (count && count > 0) {
                setError(`Nie można usunąć poziomu "${name}" - ma przypisane zasoby (${count})`);
                return;
            }
        } catch (err: unknown) {
            setError(`Błąd podczas sprawdzania zasobów przypisanych do poziomu "${name}": ${err instanceof Error ? err.message : 'Nieznany błąd'}`);
            return;
        }

        // Then, try to delete the level
        try {
            const { error } = await supabase
                .from('levels')
                .delete()
                .eq('id', id);

            if (error) {
                setError(`Błąd podczas usuwania poziomu "${name}": ${error.message}`);
                return;
            }
            loadLevels();
        } catch (err: unknown) {
            setError(`Błąd podczas usuwania poziomu "${name}": ${err instanceof Error ? err.message : 'Nieznany błąd'}`);
        }
    };

    const handleMove = async (id: string, direction: 'up' | 'down') => {
        setError('');
        const index = levels.findIndex(l => l.id === id);
        if (index === -1) return;
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === levels.length - 1) return;

        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        const level1 = levels[index];
        const level2 = levels[swapIndex];

        try {
            // Use atomic RPC function to swap order indices
            const { error } = await supabase.rpc('swap_levels_order', {
                level1_id: level1.id,
                level2_id: level2.id
            });

            if (error) {
                setError(`Nie udało się przesunąć poziomu: ${error.message}`);
                return;
            }

            // Reload levels to reflect the change
            loadLevels();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Wystąpił błąd podczas zmiany kolejności poziomów.');
            loadLevels(); // Reload to ensure UI is in sync with database
        }
    };

    const startEdit = (level: Level) => {
        setEditingId(level.id);
        setFormData({ name: level.name, slug: level.slug });
        setIsAdding(false);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setIsAdding(false);
        setFormData({ name: '', slug: '' });
    };

    if (loading) {
        return <div className="text-center py-8">Ładowanie...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Zarządzanie Poziomami</h2>
                <button
                    onClick={() => setIsAdding(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
                >
                    <Plus size={20} />
                    Dodaj Poziom
                </button>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md">
                    {error}
                    <button onClick={() => setError('')} className="ml-2 underline">Zamknij</button>
                </div>
            )}

            {isAdding && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="font-semibold mb-3">Nowy Poziom</h3>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nazwa *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="np. Podstawowy"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Slug (opcjonalnie - wygeneruje się automatycznie)
                            </label>
                            <input
                                type="text"
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="np. podstawowy"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleAdd}
                                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"
                            >
                                <Save size={16} />
                                Zapisz
                            </button>
                            <button
                                onClick={cancelEdit}
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 flex items-center gap-2"
                            >
                                <X size={16} />
                                Anuluj
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kolejność</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nazwa</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Akcje</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {levels.map((level, index) => (
                            <tr key={level.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => handleMove(level.id, 'up')}
                                            disabled={index === 0}
                                            className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-30"
                                            aria-label="Przesuń w górę"
                                        >
                                            <ChevronUp size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleMove(level.id, 'down')}
                                            disabled={index === levels.length - 1}
                                            className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-30"
                                            aria-label="Przesuń w dół"
                                        >
                                            <ChevronDown size={16} />
                                        </button>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {editingId === level.id ? (
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-2 py-1 border border-gray-300 rounded"
                                        />
                                    ) : (
                                        <span className="text-sm font-medium text-gray-900">{level.name}</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    {editingId === level.id ? (
                                        <input
                                            type="text"
                                            value={formData.slug}
                                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                            className="w-full px-2 py-1 border border-gray-300 rounded"
                                        />
                                    ) : (
                                        <span className="text-sm text-gray-500">{level.slug}</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {editingId === level.id ? (
                                        <div className="flex gap-2 justify-end">
                                            <button
                                                onClick={() => handleEdit(level.id)}
                                                className="text-green-600 hover:text-green-900"
                                                aria-label="Zapisz zmiany"
                                            >
                                                <Save size={16} />
                                            </button>
                                            <button
                                                onClick={cancelEdit}
                                                className="text-gray-600 hover:text-gray-900"
                                                aria-label="Anuluj"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2 justify-end">
                                            <button
                                                onClick={() => startEdit(level)}
                                                className="text-blue-600 hover:text-blue-900"
                                                aria-label="Edytuj poziom"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(level.id, level.name)}
                                                className="text-red-600 hover:text-red-900"
                                                aria-label="Usuń poziom"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <ConfirmationModal
                isOpen={deleteConfirm !== null}
                title="Usuń poziom"
                message={deleteConfirm ? `Czy na pewno chcesz usunąć poziom "${deleteConfirm.name}"?` : ''}
                confirmLabel="Usuń"
                cancelLabel="Anuluj"
                onConfirm={handleDeleteConfirm}
                onCancel={() => setDeleteConfirm(null)}
                variant="danger"
            />
        </div>
    );
}
