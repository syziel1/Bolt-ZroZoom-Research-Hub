import { Edit, Trash2, Save, X } from 'lucide-react';

type ActionButtonsProps = {
    mode: 'view' | 'edit';
    onEdit: () => void;
    onDelete: () => void;
    onSave: () => void;
    onCancel: () => void;
    editLabel?: string;
    deleteLabel?: string;
    saveLabel?: string;
    cancelLabel?: string;
};

export function ActionButtons({
    mode,
    onEdit,
    onDelete,
    onSave,
    onCancel,
    editLabel = 'Edytuj',
    deleteLabel = 'Usuń',
    saveLabel = 'Zapisz',
    cancelLabel = 'Anuluj',
}: ActionButtonsProps) {
    if (mode === 'edit') {
        return (
            <div className="flex gap-2 justify-end">
                <button
                    onClick={onSave}
                    className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
                    aria-label={saveLabel}
                >
                    <Save size={16} />
                </button>
                <button
                    onClick={onCancel}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                    aria-label={cancelLabel}
                >
                    <X size={16} />
                </button>
            </div>
        );
    }

    return (
        <div className="flex gap-2 justify-end">
            <button
                onClick={onEdit}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                aria-label={editLabel}
            >
                <Edit size={16} />
            </button>
            <button
                onClick={onDelete}
                className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                aria-label={deleteLabel}
            >
                <Trash2 size={16} />
            </button>
        </div>
    );
}
