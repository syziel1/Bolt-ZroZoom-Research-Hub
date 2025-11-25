import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { generateSlug } from '../lib/utils';

export type BaseEntity = {
    id: string;
    name: string;
    slug: string;
    order_index: number;
    [key: string]: unknown;
};

export type FormData = {
    name: string;
    slug: string;
    [key: string]: string;
};

export type DeleteConfirm = {
    id: string;
    name: string;
};

export type EntityManagerConfig = {
    tableName: string;
    dependencyCheck?: {
        table: string;
        column: string;
        errorMessage: (name: string, count: number) => string;
    };
    additionalFields?: string[];
    filterBy?: {
        column: string;
        value: string | null;
    };
    slugValidation?: boolean;
};

export function useEntityManager<T extends BaseEntity>(config: EntityManagerConfig) {
    const [entities, setEntities] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState<FormData>({ name: '', slug: '' });
    const [error, setError] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirm | null>(null);

    const loadEntities = useCallback(async () => {
        // Don't load if we need a filter value and it's not set
        if (config.filterBy && !config.filterBy.value) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            let query = supabase
                .from(config.tableName)
                .select('*')
                .order('order_index');

            // Apply filter if specified
            if (config.filterBy && config.filterBy.value) {
                query = query.eq(config.filterBy.column, config.filterBy.value);
            }

            const { data, error } = await query;

            if (error) throw error;
            setEntities((data as T[]) || []);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [config.tableName, config.filterBy?.column, config.filterBy?.value]);

    useEffect(() => {
        loadEntities();
    }, [loadEntities]);

    const handleAdd = async () => {
        setError('');
        if (!formData.name.trim()) {
            setError('Nazwa jest wymagana');
            return;
        }

        // Validate custom slug if provided and validation is enabled
        if (config.slugValidation && formData.slug) {
            if (!/^[a-z0-9-]+$/.test(formData.slug)) {
                setError('Slug może zawierać tylko małe litery, cyfry i myślniki');
                return;
            }
        }

        try {
            const slug = formData.slug ? generateSlug(formData.slug) : generateSlug(formData.name);
            const maxOrder = Math.max(...entities.map(e => e.order_index), -1);

            const insertData: Record<string, unknown> = {
                name: formData.name.trim(),
                slug,
                order_index: maxOrder + 1,
            };

            // Add filter column if specified
            if (config.filterBy && config.filterBy.value) {
                insertData[config.filterBy.column] = config.filterBy.value;
            }

            // Add any additional fields from formData
            if (config.additionalFields) {
                config.additionalFields.forEach(field => {
                    if (formData[field]) {
                        insertData[field] = formData[field];
                    }
                });
            }

            const { error } = await supabase
                .from(config.tableName)
                .insert(insertData);

            if (error) throw error;

            const resetData: FormData = { name: '', slug: '' };
            if (config.additionalFields) {
                config.additionalFields.forEach(field => {
                    resetData[field] = '';
                });
            }
            setFormData(resetData);
            setIsAdding(false);
            loadEntities();
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

            const updateData: Record<string, unknown> = {
                name: formData.name.trim(),
                slug,
            };

            // Add any additional fields from formData
            if (config.additionalFields) {
                config.additionalFields.forEach(field => {
                    if (formData[field]) {
                        updateData[field] = formData[field];
                    }
                });
            }

            // Add filter column if specified and present in formData
            if (config.filterBy && formData[config.filterBy.column]) {
                updateData[config.filterBy.column] = formData[config.filterBy.column];
            }

            const { error } = await supabase
                .from(config.tableName)
                .update(updateData)
                .eq('id', id);

            if (error) throw error;

            setEditingId(null);
            const resetData: FormData = { name: '', slug: '' };
            if (config.additionalFields) {
                config.additionalFields.forEach(field => {
                    resetData[field] = '';
                });
            }
            setFormData(resetData);
            loadEntities();
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

        try {
            // Check for dependencies if configured
            if (config.dependencyCheck) {
                const { count, error: countError } = await supabase
                    .from(config.dependencyCheck.table)
                    .select('*', { count: 'exact', head: true })
                    .eq(config.dependencyCheck.column, id);

                if (countError) {
                    setError(`Błąd sprawdzania powiązanych zasobów: ${countError.message}`);
                    return;
                }

                if (count && count > 0) {
                    setError(config.dependencyCheck.errorMessage(name, count));
                    return;
                }
            }

            const { error: deleteError } = await supabase
                .from(config.tableName)
                .delete()
                .eq('id', id);

            if (deleteError) {
                setError(`Błąd usuwania: ${deleteError.message}`);
                return;
            }
            loadEntities();
        } catch (err: unknown) {
            setError(`Nieoczekiwany błąd: ${err instanceof Error ? err.message : 'Nieznany błąd'}`);
        }
    };

    const startEdit = (entity: T) => {
        setEditingId(entity.id);
        const newFormData: FormData = {
            name: entity.name,
            slug: entity.slug,
        };

        // Add any additional fields
        if (config.additionalFields) {
            config.additionalFields.forEach(field => {
                newFormData[field] = (entity[field] as string) || '';
            });
        }

        // Add filter column if specified
        if (config.filterBy) {
            newFormData[config.filterBy.column] = (entity[config.filterBy.column] as string) || '';
        }

        setFormData(newFormData);
        setIsAdding(false);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setIsAdding(false);
        const resetData: FormData = { name: '', slug: '' };
        if (config.additionalFields) {
            config.additionalFields.forEach(field => {
                resetData[field] = '';
            });
        }
        setFormData(resetData);
    };

    return {
        entities,
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
    };
}
