import { AdminPanel } from '../AdminPanel';
import { X } from 'lucide-react';

type AdminPanelModalProps = {
    isOpen: boolean;
    onClose: () => void;
    userRole: string;
    onDataChange: () => void;
};

export function AdminPanelModal({ isOpen, onClose, userRole, onDataChange }: AdminPanelModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-lg max-w-7xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200 dark:border-slate-700 flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Panel Administracyjny</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        <X size={24} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                    <AdminPanel userRole={userRole} requireAdmin={true} onDataChange={onDataChange} />
                </div>
            </div>
        </div>
    );
}
