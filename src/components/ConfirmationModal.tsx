import { useEffect, useRef, useCallback } from 'react';
import { AlertTriangle, X } from 'lucide-react';

type ConfirmationModalProps = {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
    variant?: 'danger' | 'warning' | 'info';
};

export function ConfirmationModal({
    isOpen,
    title,
    message,
    confirmLabel = 'Potwierdź',
    cancelLabel = 'Anuluj',
    onConfirm,
    onCancel,
    variant = 'danger'
}: ConfirmationModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);
    const confirmButtonRef = useRef<HTMLButtonElement>(null);
    const cancelButtonRef = useRef<HTMLButtonElement>(null);

    // Handle keyboard navigation
    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (!isOpen) return;

        switch (event.key) {
            case 'Escape':
                event.preventDefault();
                onCancel();
                break;
            case 'Tab':
                // Trap focus within modal
                if (event.shiftKey) {
                    if (document.activeElement === cancelButtonRef.current) {
                        event.preventDefault();
                        confirmButtonRef.current?.focus();
                    }
                } else {
                    if (document.activeElement === confirmButtonRef.current) {
                        event.preventDefault();
                        cancelButtonRef.current?.focus();
                    }
                }
                break;
        }
    }, [isOpen, onCancel]);

    // Set up keyboard event listener and focus management
    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            // Focus the cancel button by default (safer action)
            cancelButtonRef.current?.focus();
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen, handleKeyDown]);

    if (!isOpen) return null;

    const variantStyles = {
        danger: {
            icon: 'text-red-600',
            button: 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
        },
        warning: {
            icon: 'text-yellow-600',
            button: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
        },
        info: {
            icon: 'text-blue-600',
            button: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
        }
    };

    const styles = variantStyles[variant];

    return (
        <div
            className="fixed inset-0 z-50 overflow-y-auto"
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
        >
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                aria-hidden="true"
                onClick={onCancel}
            />

            {/* Modal container */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div
                    ref={modalRef}
                    className="relative transform overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:w-full sm:max-w-lg"
                    role="document"
                >
                    {/* Close button */}
                    <button
                        type="button"
                        className="absolute right-4 top-4 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded-md"
                        onClick={onCancel}
                        aria-label="Zamknij"
                    >
                        <X size={20} />
                    </button>

                    {/* Modal content */}
                    <div className="bg-white px-4 pb-4 pt-5 sm:p-6">
                        <div className="sm:flex sm:items-start">
                            {/* Icon */}
                            <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 sm:mx-0 sm:h-10 sm:w-10 ${styles.icon}`}>
                                <AlertTriangle size={24} aria-hidden="true" />
                            </div>

                            {/* Text content */}
                            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                <h3
                                    className="text-lg font-semibold leading-6 text-gray-900"
                                    id="modal-title"
                                >
                                    {title}
                                </h3>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500">
                                        {message}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 gap-2">
                        <button
                            ref={confirmButtonRef}
                            type="button"
                            className={`inline-flex w-full justify-center rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto ${styles.button}`}
                            onClick={onConfirm}
                        >
                            {confirmLabel}
                        </button>
                        <button
                            ref={cancelButtonRef}
                            type="button"
                            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 sm:mt-0 sm:w-auto"
                            onClick={onCancel}
                        >
                            {cancelLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
