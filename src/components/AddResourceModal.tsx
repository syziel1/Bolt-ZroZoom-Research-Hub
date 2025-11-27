import { Subject, Topic, Level, Resource } from '../lib/supabase';
import { ResourceForm } from './ResourceForm';

type AddResourceModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  subjects: Subject[];
  topics: Topic[];
  levels: Level[];
  initialData?: Resource | null;
  prefillData?: Partial<Resource> | null;
};

export function AddResourceModal({
  isOpen,
  onClose,
  onSuccess,
  subjects,
  topics,
  levels,
  initialData,
  prefillData,
}: AddResourceModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-slate-700">
        <ResourceForm
          subjects={subjects}
          topics={topics}
          levels={levels}
          onSuccess={onSuccess}
          onCancel={onClose}
          initialData={initialData}
          prefillData={prefillData}
        />
      </div>
    </div>
  );
}
