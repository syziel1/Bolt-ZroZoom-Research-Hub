import { ReactNode } from 'react';
import { BaseEntity, FormData } from '../../hooks/useEntityManager';

type Column = {
    key: string;
    label: string;
    className?: string;
    render?: (entity: BaseEntity, isEditing: boolean, formData: FormData, onFormChange: (data: FormData) => void) => ReactNode;
};

type EntityTableProps<T extends BaseEntity> = {
    entities: T[];
    columns: Column[];
    editingId: string | null;
    formData: FormData;
    onFormChange: (data: FormData) => void;
    renderOrderButtons: (entity: T, index: number) => ReactNode;
    renderActionButtons: (entity: T) => ReactNode;
    emptyMessage?: string;
};

export function EntityTable<T extends BaseEntity>({
    entities,
    columns,
    editingId,
    formData,
    onFormChange,
    renderOrderButtons,
    renderActionButtons,
    emptyMessage = 'Brak elementów',
}: EntityTableProps<T>) {
    const totalColumns = 2 + columns.length; // order + columns + actions

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Kolejność
                        </th>
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase ${col.className || ''}`}
                            >
                                {col.label}
                            </th>
                        ))}
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                            Akcje
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {entities.length === 0 ? (
                        <tr>
                            <td colSpan={totalColumns} className="px-6 py-8 text-center text-gray-500">
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        entities.map((entity, index) => {
                            const isEditing = editingId === entity.id;
                            return (
                                <tr key={entity.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {renderOrderButtons(entity, index)}
                                    </td>
                                    {columns.map((col) => (
                                        <td key={col.key} className={`px-6 py-4 ${col.className || ''}`}>
                                            {col.render ? (
                                                col.render(entity, isEditing, formData, onFormChange)
                                            ) : isEditing ? (
                                                <input
                                                    type="text"
                                                    value={(formData[col.key] as string) || ''}
                                                    onChange={(e) =>
                                                        onFormChange({ ...formData, [col.key]: e.target.value })
                                                    }
                                                    className="w-full px-2 py-1 border border-gray-300 rounded"
                                                />
                                            ) : (
                                                <span className="text-sm text-gray-900">
                                                    {String(entity[col.key] || '')}
                                                </span>
                                            )}
                                        </td>
                                    ))}
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {renderActionButtons(entity)}
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
}
