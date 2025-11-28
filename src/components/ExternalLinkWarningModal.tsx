import { ExternalLink, AlertTriangle, X } from 'lucide-react';

type ExternalLinkWarningModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    url: string;
};

export function ExternalLinkWarningModal({ isOpen, onClose, onConfirm, url }: ExternalLinkWarningModalProps) {
    if (!isOpen) return null;

    const domain = new URL(url).hostname;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-lg max-w-md w-full shadow-2xl border border-gray-200 dark:border-slate-700 animate-in fade-in zoom-in duration-200">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3 text-amber-500">
                            <AlertTriangle size={24} />
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                Link zewnętrzny
                            </h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Próbujesz otworzyć link prowadzący do zewnętrznej strony:
                    </p>

                    <div className="bg-gray-50 dark:bg-slate-900 p-3 rounded-lg mb-6 border border-gray-100 dark:border-slate-700 break-all">
                        <span className="font-mono text-sm text-blue-600 dark:text-blue-400">
                            {domain}
                        </span>
                    </div>

                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                        Nie odpowiadamy za treści znajdujące się na stronach zewnętrznych. Czy chcesz kontynuować?
                    </p>

                    <div className="flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors font-medium text-sm"
                        >
                            Anuluj
                        </button>
                        <button
                            onClick={onConfirm}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm flex items-center gap-2"
                        >
                            <span>Otwórz stronę</span>
                            <ExternalLink size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
