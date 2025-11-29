type RatingSliderProps = {
    label: string;
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
};

export function RatingSlider({ label, value, onChange, min = 1, max = 5 }: RatingSliderProps) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {label}: {value}
            </label>
            <input
                type="range"
                min={min}
                max={max}
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value))}
                className="w-full accent-blue-600"
            />
        </div>
    );
}
