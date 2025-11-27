import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';

type ThemeProviderProps = {
    children: React.ReactNode;
    defaultTheme?: Theme;
    storageKey?: string;
};

type ThemeProviderState = {
    theme: Theme;
    setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
    theme: 'system',
    setTheme: () => null,
};

const ThemeContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
    children,
    defaultTheme = 'system',
    storageKey = 'vite-ui-theme',
}: ThemeProviderProps) {
    const [theme, setTheme] = useState<Theme>(
        () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
    );

    useEffect(() => {
        const root = window.document.documentElement;

        // Function to clean up classes
        const cleanClasses = () => root.classList.remove('light', 'dark');

        if (theme === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

            const applySystemTheme = () => {
                const systemTheme = mediaQuery.matches ? 'dark' : 'light';
                console.log('ThemeContext: System theme detected:', systemTheme, 'Matches dark:', mediaQuery.matches);
                cleanClasses();
                root.classList.add(systemTheme);
            };

            // Use requestAnimationFrame to ensure DOM is ready and prevent race conditions
            requestAnimationFrame(() => {
                applySystemTheme();
            });

            // Support for older browsers
            if (mediaQuery.addEventListener) {
                mediaQuery.addEventListener('change', applySystemTheme);
            } else {
                // @ts-ignore
                mediaQuery.addListener(applySystemTheme);
            }

            // Force re-check on window focus to handle system changes while tab was backgrounded
            window.addEventListener('focus', applySystemTheme);

            return () => {
                if (mediaQuery.removeEventListener) {
                    mediaQuery.removeEventListener('change', applySystemTheme);
                } else {
                    // @ts-ignore
                    mediaQuery.removeListener(applySystemTheme);
                }
                window.removeEventListener('focus', applySystemTheme);
            };
        }

        console.log('ThemeContext: Manual theme set:', theme);
        cleanClasses();
        root.classList.add(theme);
    }, [theme]);

    const value = {
        theme,
        setTheme: (theme: Theme) => {
            localStorage.setItem(storageKey, theme);
            setTheme(theme);
        },
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeContext);

    if (context === undefined)
        throw new Error('useTheme must be used within a ThemeProvider');

    return context;
};
