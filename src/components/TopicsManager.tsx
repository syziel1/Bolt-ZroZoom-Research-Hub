import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Edit, Trash2, ChevronUp, ChevronDown, Save, X } from 'lucide-react';

type Topic = {
    id: string;
    subject_id: string;
    name: string;
    slug: string;
    order_index: number;
};

type Subject = {
    id: string;
    name: string;
};

export function TopicsManager() {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({ name: '', slug: '', subject_id: '' });
    const [error, setError] = useState('');

    useEffect(() => {
        loadSubjects();
    }, []);

    useEffect(() => {
        if (selectedSubjectId) {
            loadTopics();
        }
    }, [selectedSubjectId]);

    const loadSubjects = async () => {
        try {
            const { data, error } = await supabase
                .from('subjects')
                .select('id, name')
                .order('order_index');

            if (error) throw error;
            setSubjects(data || []);
            if (data && data.length > 0 && !selectedSubjectId) {
                setSelectedSubjectId(data[0].id);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const loadTopics = async () => {
        if (!selectedSubjectId) return;

        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('topics')
                .select('*')
                .eq('subject_id', selectedSubjectId)
                .order('order_index');

            if (error) throw error;
            setTopics(data || []);
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
            const maxOrder = Math.max(...topics.map(t => t.order_index), -1);

            const { error } = await supabase
                .from('topics')
                .insert({
                    name: formData.name.trim(),
                    slug,
                    subject_id: selectedSubjectId,
                    order_index: maxOrder + 1
                });

            if (error) throw error;

            setFormData({ name: '', slug: '', subject_id: '' });
            setIsAdding(false);
            loadTopics();
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
                .from('topics')
                .update({
                    name: formData.name.trim(),
                    slug,
                    subject_id: formData.subject_id || selectedSubjectId
                })
                .eq('id', id);

            if (error) throw error;

            setEditingId(null);
            setFormData({ name: '', slug: '', subject_id: '' });
            loadTopics();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Czy na pewno chcesz usunąć temat "${name}"?`)) return;
        setError('');

        try {
            // Check if topic has resources
            const { count } = await supabase
                .from('resource_topics')
                .select('*', { count: 'exact', head: true })
                .eq('topic_id', id);

            if (count && count > 0) {
                setError(`Nie można usunąć tematu "${name}" - ma przypisane zasoby (${count})`);
                return;
            }

            const { error } = await supabase
                .from('topics')
                .delete()
                .eq('id', id);

            if (error) throw error;
            loadTopics();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleMove = async (id: string, direction: 'up' | 'down') => {
        setError('');
        const index = topics.findIndex(t => t.id === id);
        if (index === -1) return;
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === topics.length - 1) return;

        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        const topic1 = topics[index];
        const topic2 = topics[swapIndex];

        try {
            // Use RPC function for atomic swap to prevent race conditions
            const { error } = await supabase.rpc('swap_topics_order', {
                topic1_id: topic1.id,
                topic1_new_order: topic2.order_index,
                topic2_id: topic2.id,
                topic2_new_order: topic1.order_index
            });

            if (error) throw error;

            loadTopics();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const startEdit = (topic: Topic) => {
        setEditingId(topic.id);
        setFormData({ name: topic.name, slug: topic.slug, subject_id: topic.subject_id });
        setIsAdding(false);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setIsAdding(false);
        setFormData({ name: '', slug: '', subject_id: '' });
    };

    if (loading && subjects.length === 0) {
        return <div className="text-center py-8">Ładowanie...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Zarządzanie Tematami</h2>
                <button
                    onClick={() => setIsAdding(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
                    disabled={!selectedSubjectId}
                >
                    <Plus size={20} />
                    Dodaj Temat
                </button>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md">
                    {error}
                    <button onClick={() => setError('')} className="ml-2 underline">Zamknij</button>
                </div>
            )}

            <div className="bg-white p-4 rounded-lg shadow">
                <label className="block text-sm font-medium text-gray-700 mb-2">Wybierz Przedmiot</label>
                <select
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                    <option value="">-- Wybierz przedmiot --</option>
                    {subjects.map((subject) => (
                        <option key={subject.id} value={subject.id}>
                            {subject.name}
                        </option>
                    ))}
                </select>
            </div>

            {isAdding && selectedSubjectId && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="font-semibold mb-3">Nowy Temat</h3>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nazwa *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="np. Algebra"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Slug (opcjonalnie)
                            </label>
                            <input
                                type="text"
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="np. algebra"
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

            {selectedSubjectId && (
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
                            {topics.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                        Brak tematów dla tego przedmiotu
                                    </td>
                                </tr>
                            ) : (
                                topics.map((topic, index) => (
                                    <tr key={topic.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => handleMove(topic.id, 'up')}
                                                    disabled={index === 0}
                                                    className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-30"
                                                >
                                                    <ChevronUp size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleMove(topic.id, 'down')}
                                                    disabled={index === topics.length - 1}
                                                    className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-30"
                                                >
                                                    <ChevronDown size={16} />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {editingId === topic.id ? (
                                                <input
                                                    type="text"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    className="w-full px-2 py-1 border border-gray-300 rounded"
                                                />
                                            ) : (
                                                <span className="text-sm font-medium text-gray-900">{topic.name}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {editingId === topic.id ? (
                                                <input
                                                    type="text"
                                                    value={formData.slug}
                                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                                    className="w-full px-2 py-1 border border-gray-300 rounded"
                                                />
                                            ) : (
                                                <span className="text-sm text-gray-500">{topic.slug}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {editingId === topic.id ? (
                                                <div className="flex gap-2 justify-end">
                                                    <button
                                                        onClick={() => handleEdit(topic.id)}
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
                                                        onClick={() => startEdit(topic)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(topic.id, topic.name)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
