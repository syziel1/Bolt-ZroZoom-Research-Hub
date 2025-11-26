import { useState, useEffect, useCallback } from 'react';
import { supabase, TopicNode } from '../lib/supabase';
import { buildTopicTree } from '../utils/topicTree';
import { Plus, Edit2, Trash2, Save, X, ChevronDown, ChevronRight } from 'lucide-react';
import { ConfirmationModal } from './ConfirmationModal';

type Subject = {
    id: string;
    name: string;
};

type TopicFormData = {
    name: string;
    slug: string;
    parent_topic_id: string | null;
};

type TopicItemProps = {
    node: TopicNode;
    level: number;
    subjectId: string;
    onEdit: (topic: TopicNode) => void;
    onDelete: (id: string, name: string) => void;
    onAddChild: (parentId: string) => void;
    onReload: () => void;
};

function TopicItem({ node, level, subjectId, onEdit, onDelete, onAddChild, onReload }: TopicItemProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const hasChildren = node.children && node.children.length > 0;

    return (
        <div className="select-none">
            <div
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-colors"
                style={{ marginLeft: `${level * 24}px` }}
            >
                <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                    {hasChildren && (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                            aria-label={isExpanded ? `Zwiń ${node.name}` : `Rozwiń ${node.name}`}
                        >
                            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900">{node.name}</div>
                    <div className="text-xs text-gray-500">{node.slug}</div>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={() => onAddChild(node.id)}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                        title="Dodaj podtemat"
                    >
                        <Plus size={16} />
                    </button>
                    <button
                        onClick={() => onEdit(node)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="Edytuj temat"
                    >
                        <Edit2 size={16} />
                    </button>
                    <button
                        onClick={() => onDelete(node.id, node.name)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Usuń temat"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {hasChildren && isExpanded && (
                <div className="mt-1">
                    {node.children.map((child) => (
                        <TopicItem
                            key={child.id}
                            node={child}
                            level={level + 1}
                            subjectId={subjectId}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onAddChild={onAddChild}
                            onReload={onReload}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export function TopicTreeManager() {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
    const [topics, setTopics] = useState<TopicNode[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<TopicFormData>({
        name: '',
        slug: '',
        parent_topic_id: null,
    });

    const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

    const loadSubjects = useCallback(async () => {
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
        } catch (err: unknown) {
            console.error('Error loading subjects:', err);
            setError('Błąd ładowania przedmiotów');
        } finally {
            setLoading(false);
        }
    }, [selectedSubjectId]);

    const loadTopics = useCallback(async () => {
        if (!selectedSubjectId) return;

        try {
            const { data, error } = await supabase
                .from('topics')
                .select('*')
                .eq('subject_id', selectedSubjectId)
                .order('order_index');

            if (error) throw error;

            const tree = buildTopicTree(data || []);
            setTopics(tree);
        } catch (err: unknown) {
            console.error('Error loading topics:', err);
            setError('Błąd ładowania tematów');
        }
    }, [selectedSubjectId]);

    // Load subjects
    useEffect(() => {
        loadSubjects();
    }, [loadSubjects]);

    // Load topics when subject changes
    useEffect(() => {
        if (selectedSubjectId) {
            loadTopics();
        } else {
            setTopics([]);
        }
    }, [selectedSubjectId, loadTopics]);

    const handleAdd = async () => {
        if (!formData.name.trim() || !formData.slug.trim()) {
            setError('Nazwa i slug są wymagane');
            return;
        }

        try {
            // Get max order_index for siblings
            let maxOrderIndex = 0;
            const { data: siblings } = await supabase
                .from('topics')
                .select('order_index')
                .eq('subject_id', selectedSubjectId)
                .eq('parent_topic_id', formData.parent_topic_id || null)
                .order('order_index', { ascending: false })
                .limit(1);

            if (siblings && siblings.length > 0 && siblings[0].order_index !== null) {
                maxOrderIndex = siblings[0].order_index;
            }

            const { error } = await supabase.from('topics').insert({
                subject_id: selectedSubjectId,
                name: formData.name,
                slug: formData.slug,
                parent_topic_id: formData.parent_topic_id,
                order_index: maxOrderIndex + 1,
            });

            if (error) throw error;

            setFormData({ name: '', slug: '', parent_topic_id: null });
            setIsAdding(false);
            loadTopics();
        } catch (err: unknown) {
            console.error('Error adding topic:', err);
            setError('Błąd dodawania tematu');
        }
    };

    const handleEdit = async () => {
        if (!editingId || !formData.name.trim() || !formData.slug.trim()) {
            setError('Nazwa i slug są wymagane');
            return;
        }

        try {
            const { error } = await supabase
                .from('topics')
                .update({
                    name: formData.name,
                    slug: formData.slug,
                })
                .eq('id', editingId);

            if (error) throw error;

            setFormData({ name: '', slug: '', parent_topic_id: null });
            setEditingId(null);
            loadTopics();
        } catch (err: unknown) {
            console.error('Error updating topic:', err);
            setError('Błąd aktualizacji tematu');
        }
    };

    const handleDeleteClick = (id: string, name: string) => {
        setDeleteConfirm({ id, name });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteConfirm) return;

        try {
            // Check if topic has resources
            const { data: resourceTopics, error: checkError } = await supabase
                .from('resource_topics')
                .select('id')
                .eq('topic_id', deleteConfirm.id);

            if (checkError) throw checkError;

            if (resourceTopics && resourceTopics.length > 0) {
                setError(`Nie można usunąć tematu "${deleteConfirm.name}" - ma przypisane zasoby (${resourceTopics.length})`);
                setDeleteConfirm(null);
                return;
            }

            // Check if topic has children
            const { data: children, error: childrenError } = await supabase
                .from('topics')
                .select('id')
                .eq('parent_topic_id', deleteConfirm.id);

            if (childrenError) throw childrenError;

            if (children && children.length > 0) {
                setError(`Nie można usunąć tematu "${deleteConfirm.name}" - ma podtematy (${children.length})`);
                setDeleteConfirm(null);
                return;
            }

            const { error } = await supabase
                .from('topics')
                .delete()
                .eq('id', deleteConfirm.id);

            if (error) throw error;

            setDeleteConfirm(null);
            loadTopics();
        } catch (err: unknown) {
            console.error('Error deleting topic:', err);
            setError('Błąd usuwania tematu');
            setDeleteConfirm(null);
        }
    };

    const startEdit = (topic: TopicNode) => {
        setEditingId(topic.id);
        setFormData({
            name: topic.name,
            slug: topic.slug,
            parent_topic_id: topic.parent_topic_id,
        });
        setIsAdding(false);
    };

    const startAddChild = (parentId: string) => {
        setIsAdding(true);
        setEditingId(null);
        setFormData({
            name: '',
            slug: '',
            parent_topic_id: parentId,
        });
    };

    const cancelForm = () => {
        setIsAdding(false);
        setEditingId(null);
        setFormData({ name: '', slug: '', parent_topic_id: null });
    };

    if (loading) {
        return <div className="text-center py-8">Ładowanie...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Zarządzanie Tematami</h2>
                <button
                    onClick={() => {
                        setIsAdding(true);
                        setEditingId(null);
                        setFormData({ name: '', slug: '', parent_topic_id: null });
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2 transition-colors"
                    disabled={!selectedSubjectId}
                >
                    <Plus size={20} />
                    Dodaj Temat Główny
                </button>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md flex justify-between items-center">
                    <span>{error}</span>
                    <button onClick={() => setError('')} className="text-red-800 hover:text-red-900 font-medium">
                        Zamknij
                    </button>
                </div>
            )}

            <div className="bg-white p-4 rounded-lg shadow">
                <label className="block text-sm font-medium text-gray-700 mb-2">Wybierz Przedmiot</label>
                <select
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="">-- Wybierz przedmiot --</option>
                    {subjects.map((subject) => (
                        <option key={subject.id} value={subject.id}>
                            {subject.name}
                        </option>
                    ))}
                </select>
            </div>

            {(isAdding || editingId) && (
                <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                    <h3 className="font-semibold mb-3 text-blue-900">
                        {editingId ? 'Edytuj Temat' : formData.parent_topic_id ? 'Nowy Podtemat' : 'Nowy Temat Główny'}
                    </h3>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nazwa</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="np. Algebra"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                            <input
                                type="text"
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                placeholder="np. algebra"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div className="flex gap-2 pt-2">
                            <button
                                onClick={editingId ? handleEdit : handleAdd}
                                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2 transition-colors"
                            >
                                <Save size={16} />
                                Zapisz
                            </button>
                            <button
                                onClick={cancelForm}
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 flex items-center gap-2 transition-colors"
                            >
                                <X size={16} />
                                Anuluj
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {selectedSubjectId && (
                <div className="bg-white p-4 rounded-lg shadow">
                    {topics.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            Brak tematów dla tego przedmiotu. Dodaj pierwszy temat.
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {topics.map((topic) => (
                                <TopicItem
                                    key={topic.id}
                                    node={topic}
                                    level={0}
                                    subjectId={selectedSubjectId}
                                    onEdit={startEdit}
                                    onDelete={handleDeleteClick}
                                    onAddChild={startAddChild}
                                    onReload={loadTopics}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            <ConfirmationModal
                isOpen={deleteConfirm !== null}
                title="Usuń temat"
                message={deleteConfirm ? `Czy na pewno chcesz usunąć temat "${deleteConfirm.name}"?` : ''}
                confirmLabel="Usuń"
                cancelLabel="Anuluj"
                onConfirm={handleDeleteConfirm}
                onCancel={() => setDeleteConfirm(null)}
                variant="danger"
            />
        </div>
    );
}
