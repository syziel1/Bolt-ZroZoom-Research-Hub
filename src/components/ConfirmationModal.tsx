import { useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';

type ConfirmationModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning';
};

export function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Potwierdź',
    cancelText = 'Anuluj',
    variant = 'danger',
}: ConfirmationModalProps) {
    const confirmButtonRef = useRef<HTMLButtonElement>(null);
    const cancelButtonRef = useRef<HTMLButtonElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            // Focus the cancel button when modal opens (safer default)
            cancelButtonRef.current?.focus();
            
            // Trap focus within modal
            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Escape') {
                    onClose();
                    return;
                }
                
                if (e.key === 'Tab') {
                    const focusableElements = modalRef.current?.querySelectorAll(
                        'button:not([disabled])'
                    );
                    if (!focusableElements || focusableElements.length === 0) return;

                    const firstElement = focusableElements[0] as HTMLElement;
                    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

                    if (e.shiftKey) {
                        if (document.activeElement === firstElement) {
                            e.preventDefault();
                            lastElement.focus();
                        }
                    } else {
                        if (document.activeElement === lastElement) {
                            e.preventDefault();
                            firstElement.focus();
                        }
                    }
                }
            };

            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirmation-modal-title"
            aria-describedby="confirmation-modal-description"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div
                ref={modalRef}
                className="bg-white rounded-lg max-w-md w-full shadow-xl"
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                            variant === 'danger' ? 'bg-red-100' : 'bg-yellow-100'
                        }`}>
                            <AlertTriangle
                                size={20}
                                className={variant === 'danger' ? 'text-red-600' : 'text-yellow-600'}
                                aria-hidden="true"
                            />
                        </div>
                        <h2
                            id="confirmation-modal-title"
                            className="text-lg font-semibold text-gray-900"
                        >
                            {title}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 p-1 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Zamknij"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="px-6 py-4">
                    <p
                        id="confirmation-modal-description"
                        className="text-gray-600"
                    >
                        {message}
                    </p>
                </div>

                <div className="flex gap-3 px-6 py-4 bg-gray-50 rounded-b-lg justify-end">
                    <button
                        ref={cancelButtonRef}
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {cancelText}
                    </button>
                    <button
                        ref={confirmButtonRef}
                        onClick={handleConfirm}
                        className={`px-4 py-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                            variant === 'danger'
                                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                                : 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
                        }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
