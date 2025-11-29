import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    const cycleTheme = () => {
        if (theme === 'light') setTheme('dark');
        else if (theme === 'dark') setTheme('system');
        else setTheme('light');
    };

    const getIcon = () => {
        switch (theme) {
            case 'light': return <Sun size={20} />;
            case 'dark': return <Moon size={20} />;
            case 'system': return <Monitor size={20} />;
        }
    };

    const getLabel = () => {
        switch (theme) {
            case 'light': return 'Jasny motyw';
            case 'dark': return 'Ciemny motyw';
            case 'system': return 'Systemowy';
        }
    };

    return (
        <button
            onClick={cycleTheme}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300 transition-colors"
            title={`Zmień motyw (Obecny: ${getLabel()})`}
        >
            {getIcon()}
        </button>
    );
}
