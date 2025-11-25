import { Plus, Save, X } from 'lucide-react';
import { ConfirmationModal } from './ConfirmationModal';
import { useEntityManager } from '../hooks/useEntityManager';
import { useOrderManagement } from '../hooks/useOrderManagement';
import { EntityFormFields } from './shared/EntityFormFields';
import { EntityTable } from './shared/EntityTable';
import { OrderButtons } from './shared/OrderButtons';
import { ActionButtons } from './shared/ActionButtons';

type Subject = {
    id: string;
    name: string;
    slug: string;
    order_index: number;
    resources_count?: number;
};

export function SubjectsManager() {
    const {
        entities: subjects,
        loading,
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
    } = useEntityManager<Subject>({
        tableName: 'subjects',
        dependencyCheck: {
            table: 'resources',
            column: 'subject_id',
            errorMessage: (name, count) => `Nie można usunąć przedmiotu "${name}" - ma przypisane zasoby (${count})`,
        },
        slugValidation: true,
    });

    const { handleMove } = useOrderManagement<Subject>({
        rpcFunctionName: 'swap_subjects_order',
        idParam1Name: 'subject1_id',
        idParam2Name: 'subject2_id',
        entities: subjects,
        onError: setError,
        onReload: loadEntities,
    });

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
                    <EntityFormFields
                        formData={formData}
                        onChange={setFormData}
                        namePlaceholder="np. Matematyka"
                        slugPlaceholder="np. matematyka"
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

            <EntityTable
                entities={subjects}
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
                    {
                        key: 'resources_count',
                        label: 'Zasoby',
                        className: 'whitespace-nowrap',
                        render: (entity) => (
                            <span className="text-sm text-gray-500">
                                {(entity as Subject).resources_count || 0}
                            </span>
                        ),
                    },
                ]}
                editingId={editingId}
                formData={formData}
                onFormChange={setFormData}
                renderOrderButtons={(subject, index) => (
                    <OrderButtons
                        onMoveUp={() => handleMove(subject.id, 'up')}
                        onMoveDown={() => handleMove(subject.id, 'down')}
                        canMoveUp={index > 0}
                        canMoveDown={index < subjects.length - 1}
                    />
                )}
                renderActionButtons={(subject) => (
                    <ActionButtons
                        mode={editingId === subject.id ? 'edit' : 'view'}
                        onEdit={() => startEdit(subject)}
                        onDelete={() => handleDeleteClick(subject.id, subject.name)}
                        onSave={() => handleEdit(subject.id)}
                        onCancel={cancelEdit}
                        editLabel="Edytuj przedmiot"
                        deleteLabel="Usuń przedmiot"
                    />
                )}
                emptyMessage="Brak przedmiotów"
            />

            <ConfirmationModal
                isOpen={deleteConfirm !== null}
                title="Usuń przedmiot"
                message={deleteConfirm ? `Czy na pewno chcesz usunąć przedmiot "${deleteConfirm.name}"?` : ''}
                confirmLabel="Usuń"
                cancelLabel="Anuluj"
                onConfirm={handleDeleteConfirm}
                onCancel={() => setDeleteConfirm(null)}
                variant="danger"
            />
        </div>
    );
}
