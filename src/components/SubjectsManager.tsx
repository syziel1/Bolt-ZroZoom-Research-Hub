import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Edit, Trash2, ChevronUp, ChevronDown, Save, X } from 'lucide-react';
import { ConfirmationModal } from './ConfirmationModal';

type Subject = {
    id: string;
    name: string;
    slug: string;
    order_index: number;
    resources_count?: number;
};

export function SubjectsManager() {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({ name: '', slug: '' });
    const [error, setError] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

    useEffect(() => {
        loadSubjects();
    }, []);

    const loadSubjects = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('subjects')
                .select('*')
                .order('order_index');

            if (error) throw error;
            setSubjects(data || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/ą/g, 'a')
            .replace(/ć/g, 'c')
            .replace(/ę/g, 'e')
            .replace(/ł/g, 'l')
            .replace(/ń/g, 'n')
            .replace(/ó/g, 'o')
            .replace(/ś/g, 's')
            .replace(/ź|ż/g, 'z')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    };

    const handleAdd = async () => {
        setError('');
        if (!formData.name.trim()) {
            setError('Nazwa jest wymagana');
            return;
        }

        try {
            const slug = formData.slug ? generateSlug(formData.slug) : generateSlug(formData.name);
            const maxOrder = Math.max(...subjects.map(s => s.order_index), 0);

            const { error } = await supabase
                .from('subjects')
                .insert({
                    name: formData.name.trim(),
                    slug,
                    order_index: maxOrder + 1
                });

            if (error) throw error;

            setFormData({ name: '', slug: '' });
            setIsAdding(false);
            loadSubjects();
        } catch (err: any) {
            setError(err.message);
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
                .from('subjects')
                .update({
                    name: formData.name.trim(),
                    slug
                })
                .eq('id', id);

            if (error) throw error;

            setEditingId(null);
            setFormData({ name: '', slug: '' });
            loadSubjects();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        setDeleteConfirm({ id, name });
    };

    const confirmDelete = async () => {
        if (!deleteConfirm) return;
        const { id, name } = deleteConfirm;
        setError('');

        try {
            // Check if subject has resources
            const { count } = await supabase
                .from('resources')
                .select('*', { count: 'exact', head: true })
                .eq('subject_id', id);

            if (count && count > 0) {
                setError(`Nie można usunąć przedmiotu "${name}" - ma przypisane zasoby (${count})`);
                return;
            }

            const { error } = await supabase
                .from('subjects')
                .delete()
                .eq('id', id);

            if (error) throw error;
            loadSubjects();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setDeleteConfirm(null);
        }
    };

    const handleMove = async (id: string, direction: 'up' | 'down') => {
        setError('');
        const index = subjects.findIndex(s => s.id === id);
        if (index === -1) return;
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === subjects.length - 1) return;

        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        const subject1 = subjects[index];
        const subject2 = subjects[swapIndex];

        try {
            await supabase
                .from('subjects')
                .update({ order_index: subject2.order_index })
                .eq('id', subject1.id);

            await supabase
                .from('subjects')
                .update({ order_index: subject1.order_index })
                .eq('id', subject2.id);

            loadSubjects();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const startEdit = (subject: Subject) => {
        setEditingId(subject.id);
        setFormData({ name: subject.name, slug: subject.slug });
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
                <h2 className="text-2xl font-bold text-gray-900">Zarządzanie Przedmiotami</h2>
                <button
                    onClick={() => setIsAdding(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
                >
                    <Plus size={20} />
                    Dodaj Przedmiot
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
                    <h3 className="font-semibold mb-3">Nowy Przedmiot</h3>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nazwa *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="np. Matematyka"
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
                                placeholder="np. matematyka"
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Zasoby</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Akcje</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {subjects.map((subject, index) => (
                            <tr key={subject.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => handleMove(subject.id, 'up')}
                                            disabled={index === 0}
                                            className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-30"
                                        >
                                            <ChevronUp size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleMove(subject.id, 'down')}
                                            disabled={index === subjects.length - 1}
                                            className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-30"
                                        >
                                            <ChevronDown size={16} />
                                        </button>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {editingId === subject.id ? (
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-2 py-1 border border-gray-300 rounded"
                                        />
                                    ) : (
                                        <span className="text-sm font-medium text-gray-900">{subject.name}</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    {editingId === subject.id ? (
                                        <input
                                            type="text"
                                            value={formData.slug}
                                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                            className="w-full px-2 py-1 border border-gray-300 rounded"
                                        />
                                    ) : (
                                        <span className="text-sm text-gray-500">{subject.slug}</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {subject.resources_count || 0}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {editingId === subject.id ? (
                                        <div className="flex gap-2 justify-end">
                                            <button
                                                onClick={() => handleEdit(subject.id)}
                                                className="text-green-600 hover:text-green-900"
                                            >
                                                <Save size={16} />
                                            </button>
                                            <button
                                                onClick={cancelEdit}
                                                className="text-gray-600 hover:text-gray-900"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2 justify-end">
                                            <button
                                                onClick={() => startEdit(subject)}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(subject.id, subject.name)}
                                                className="text-red-600 hover:text-red-900"
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
                onClose={() => setDeleteConfirm(null)}
                onConfirm={confirmDelete}
                title="Usuń przedmiot"
                message={deleteConfirm ? `Czy na pewno chcesz usunąć przedmiot "${deleteConfirm.name}"?` : ''}
                confirmText="Usuń"
                cancelText="Anuluj"
                variant="danger"
            />
        </div>
    );
}
