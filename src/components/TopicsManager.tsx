import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Save, X } from 'lucide-react';
import { ConfirmationModal } from './ConfirmationModal';
import { useEntityManager } from '../hooks/useEntityManager';
import { useOrderManagement } from '../hooks/useOrderManagement';
import { EntityFormFields } from './shared/EntityFormFields';
import { EntityTable } from './shared/EntityTable';
import { OrderButtons } from './shared/OrderButtons';
import { ActionButtons } from './shared/ActionButtons';

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
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
    const [subjectsLoading, setSubjectsLoading] = useState(true);

    // Load subjects for the dropdown
    const loadSubjects = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('subjects')
                .select('id, name')
                .order('order_index');

            if (error) throw error;
            setSubjects(data || []);

            // Auto-select first subject if none selected
            if (data && data.length > 0 && !selectedSubjectId) {
                setSelectedSubjectId(data[0].id);
            }
        } catch (err: unknown) {
            console.error('Error loading subjects:', err);
        } finally {
            setSubjectsLoading(false);
        }
    }, [selectedSubjectId]);

    useEffect(() => {
        loadSubjects();
    }, [loadSubjects]);

    const {
        entities: topics,
        error,
        setError,
        formData,
        setFormData,
        editingId,
        isAdding,
        setIsAdding,
        deleteConfirm,
        setDeleteConfirm,
        handleAdd,
        handleEdit,
        handleDeleteClick,
        handleDeleteConfirm,
        startEdit,
        cancelEdit,
        loadEntities,
    } = useEntityManager<Topic>({
        tableName: 'topics',
        dependencyCheck: {
            table: 'resource_topics',
            column: 'topic_id',
            errorMessage: (name, count) => `Nie można usunąć tematu "${name}" - ma przypisane zasoby (${count})`,
        },
        filterBy: {
            column: 'subject_id',
            value: selectedSubjectId,
        },
        additionalFields: ['subject_id'],
    });

    const { handleMove } = useOrderManagement<Topic>({
        rpcFunctionName: 'swap_topics_order',
        idParam1Name: 'topic1_id',
        idParam2Name: 'topic2_id',
        entities: topics,
        onError: setError,
        onReload: loadEntities,
    });

    if (subjectsLoading) {
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
                    <EntityFormFields
                        formData={formData}
                        onChange={setFormData}
                        namePlaceholder="np. Algebra"
                        slugPlaceholder="np. algebra"
                    />
                    <div className="flex gap-2 mt-3">
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
            )}

            {selectedSubjectId && (
                <EntityTable
                    entities={topics}
                    columns={[
                        {
                            key: 'name',
                            label: 'Nazwa',
                            render: (entity, isEditing, formData, onFormChange) =>
                                isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => onFormChange({ ...formData, name: e.target.value })}
                                        className="w-full px-2 py-1 border border-gray-300 rounded"
                                    />
                                ) : (
                                    <span className="text-sm font-medium text-gray-900">{entity.name}</span>
                                ),
                        },
                        {
                            key: 'slug',
                            label: 'Slug',
                            render: (entity, isEditing, formData, onFormChange) =>
                                isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.slug}
                                        onChange={(e) => onFormChange({ ...formData, slug: e.target.value })}
                                        className="w-full px-2 py-1 border border-gray-300 rounded"
                                    />
                                ) : (
                                    <span className="text-sm text-gray-500">{entity.slug}</span>
                                ),
                        },
                    ]}
                    editingId={editingId}
                    formData={formData}
                    onFormChange={setFormData}
                    renderOrderButtons={(topic, index) => (
                        <OrderButtons
                            onMoveUp={() => handleMove(topic.id, 'up')}
                            onMoveDown={() => handleMove(topic.id, 'down')}
                            canMoveUp={index > 0}
                            canMoveDown={index < topics.length - 1}
                        />
                    )}
                    renderActionButtons={(topic) => (
                        <ActionButtons
                            mode={editingId === topic.id ? 'edit' : 'view'}
                            onEdit={() => startEdit(topic)}
                            onDelete={() => handleDeleteClick(topic.id, topic.name)}
                            onSave={() => handleEdit(topic.id)}
                            onCancel={cancelEdit}
                            editLabel="Edytuj temat"
                            deleteLabel="Usuń temat"
                        />
                    )}
                    emptyMessage="Brak tematów dla tego przedmiotu"
                />
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
