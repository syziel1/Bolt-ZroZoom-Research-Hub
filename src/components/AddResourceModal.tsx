import { Subject, Topic, Level } from '../lib/supabase';
import { ResourceForm } from './ResourceForm';

type AddResourceModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  subjects: Subject[];
  topics: Topic[];
  levels: Level[];
};

export function AddResourceModal({
  isOpen,
  onClose,
  onSuccess,
  subjects,
  topics,
  levels,
}: AddResourceModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <ResourceForm
          subjects={subjects}
          topics={topics}
          levels={levels}
          onSuccess={onSuccess}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}
