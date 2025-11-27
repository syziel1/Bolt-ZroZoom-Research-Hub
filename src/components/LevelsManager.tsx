import { Plus, Save, X } from 'lucide-react';
import { ConfirmationModal } from './ConfirmationModal';
import { useEntityManager } from '../hooks/useEntityManager';
import { useOrderManagement } from '../hooks/useOrderManagement';
import { EntityFormFields } from './shared/EntityFormFields';
import { EntityTable } from './shared/EntityTable';
import { OrderButtons } from './shared/OrderButtons';
import { ActionButtons } from './shared/ActionButtons';

type Level = {
    id: string;
    name: string;
    slug: string;
    order_index: number;
};

export function LevelsManager() {
    const {
        entities: levels,
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
    } = useEntityManager<Level>({
        tableName: 'levels',
        dependencyCheck: {
            table: 'resource_levels',
            column: 'level_id',
            errorMessage: (name, count) => `Nie można usunąć poziomu "${name}" - ma przypisane zasoby (${count})`,
        },
        slugValidation: true,
    });

    const { handleMove } = useOrderManagement<Level>({
        rpcFunctionName: 'swap_levels_order',
        idParam1Name: 'level1_id',
        idParam2Name: 'level2_id',
        entities: levels,
        onError: setError,
        onReload: loadEntities,
    });

    if (loading) {
        return <div className="text-center py-8">Ładowanie...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Zarządzanie Poziomami</h2>
                <button
                    onClick={() => setIsAdding(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
                >
                    <Plus size={20} />
                    Dodaj Poziom
                </button>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md border border-red-100 dark:border-red-800">
                    {error}
                    <button onClick={() => setError('')} className="ml-2 underline">Zamknij</button>
                </div>
            )}

            {isAdding && (
                <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700">
                    <h3 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">Nowy Poziom</h3>
                    <EntityFormFields
                        formData={formData}
                        onChange={setFormData}
                        namePlaceholder="np. Podstawowy"
                        slugPlaceholder="np. podstawowy"
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
                            className="bg-gray-300 dark:bg-slate-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-400 dark:hover:bg-slate-500 flex items-center gap-2"
                        >
                            <X size={16} />
                            Anuluj
                        </button>
                    </div>
                </div>
            )}

            <EntityTable
                entities={levels}
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
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{entity.name}</span>
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
                                <span className="text-sm text-gray-500 dark:text-gray-400">{entity.slug}</span>
                            ),
                    },
                ]}
                editingId={editingId}
                formData={formData}
                onFormChange={setFormData}
                renderOrderButtons={(level, index) => (
                    <OrderButtons
                        onMoveUp={() => handleMove(level.id, 'up')}
                        onMoveDown={() => handleMove(level.id, 'down')}
                        canMoveUp={index > 0}
                        canMoveDown={index < levels.length - 1}
                    />
                )}
                renderActionButtons={(level) => (
                    <ActionButtons
                        mode={editingId === level.id ? 'edit' : 'view'}
                        onEdit={() => startEdit(level)}
                        onDelete={() => handleDeleteClick(level.id, level.name)}
                        onSave={() => handleEdit(level.id)}
                        onCancel={cancelEdit}
                        editLabel="Edytuj poziom"
                        deleteLabel="Usuń poziom"
                    />
                )}
                emptyMessage="Brak poziomów"
            />

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
