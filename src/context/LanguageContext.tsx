import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';

export type Language = 'pl' | 'en';

type TranslationValue = string | { [key: string]: TranslationValue };
type Translations = Record<string, TranslationValue>;

type LanguageContextType = {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
    isLoading: boolean;
};

const initialContext: LanguageContextType = {
    language: 'pl',
    setLanguage: () => null,
    t: (key: string) => key,
    isLoading: true,
};

const LanguageContext = createContext<LanguageContextType>(initialContext);

const STORAGE_KEY = 'app-language';

type LanguageProviderProps = {
    children: ReactNode;
    defaultLanguage?: Language;
};

export function LanguageProvider({ children, defaultLanguage = 'pl' }: LanguageProviderProps) {
    const [language, setLanguageState] = useState<Language>(() => {
        const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
        return stored || defaultLanguage;
    });
    const [translations, setTranslations] = useState<Translations>({});
    const [isLoading, setIsLoading] = useState(true);
    const translationsCache = useRef<Map<Language, Translations>>(new Map());

    const loadTranslations = useCallback(async (lang: Language) => {
        // Check cache first
        const cached = translationsCache.current.get(lang);
        if (cached) {
            setTranslations(cached);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`/locales/${lang}.json`);
            if (!response.ok) {
                throw new Error(`Failed to load translations for ${lang}`);
            }
            const data = await response.json();
            // Cache the loaded translations
            translationsCache.current.set(lang, data);
            setTranslations(data);
        } catch (error) {
            console.error('Failed to load translations:', error);
            setTranslations({});
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadTranslations(language);
    }, [language, loadTranslations]);

    const setLanguage = useCallback((lang: Language) => {
        localStorage.setItem(STORAGE_KEY, lang);
        setLanguageState(lang);
    }, []);

    const t = useCallback((key: string): string => {
        const keys = key.split('.');
        if (keys.length === 0) {
            return key;
        }

        let result: TranslationValue | undefined = translations;
        for (const k of keys) {
            if (result && typeof result === 'object' && k in result) {
                result = result[k];
            } else {
                return key;
            }
        }

        return typeof result === 'string' ? result : key;
    }, [translations]);

    const value: LanguageContextType = {
        language,
        setLanguage,
        t,
        isLoading,
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLanguage(): LanguageContextType {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTranslation() {
    const { t, isLoading } = useLanguage();
    return { t, isLoading };
}
