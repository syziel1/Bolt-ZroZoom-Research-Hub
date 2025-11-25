import { FormData } from '../../hooks/useEntityManager';

type EntityFormFieldsProps = {
    formData: FormData;
    onChange: (data: FormData) => void;
    namePlaceholder?: string;
    slugPlaceholder?: string;
};

export function EntityFormFields({ formData, onChange, namePlaceholder, slugPlaceholder }: EntityFormFieldsProps) {
    return (
        <div className="space-y-3">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nazwa *</label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => onChange({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder={namePlaceholder || 'np. Nazwa'}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slug (opcjonalnie - wygeneruje się automatycznie)
                </label>
                <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => onChange({ ...formData, slug: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder={slugPlaceholder || 'np. nazwa'}
                />
            </div>
        </div>
    );
}
