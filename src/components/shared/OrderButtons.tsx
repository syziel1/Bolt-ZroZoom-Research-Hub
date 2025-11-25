import { ChevronUp, ChevronDown } from 'lucide-react';

type OrderButtonsProps = {
    onMoveUp: () => void;
    onMoveDown: () => void;
    canMoveUp: boolean;
    canMoveDown: boolean;
};

export function OrderButtons({ onMoveUp, onMoveDown, canMoveUp, canMoveDown }: OrderButtonsProps) {
    return (
        <div className="flex gap-1">
            <button
                onClick={onMoveUp}
                disabled={!canMoveUp}
                className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-30"
                aria-label="Przesuń w górę"
            >
                <ChevronUp size={16} />
            </button>
            <button
                onClick={onMoveDown}
                disabled={!canMoveDown}
                className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-30"
                aria-label="Przesuń w dół"
            >
                <ChevronDown size={16} />
            </button>
        </div>
    );
}
