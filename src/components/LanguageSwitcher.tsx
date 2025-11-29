import { Globe } from 'lucide-react';
import { useLanguage, Language } from '../context/LanguageContext';

export function LanguageSwitcher() {
    const { language, setLanguage, t } = useLanguage();

    const toggleLanguage = () => {
        const newLang: Language = language === 'pl' ? 'en' : 'pl';
        setLanguage(newLang);
    };

    const getLabel = () => {
        return language === 'pl' ? 'PL' : 'EN';
    };

    return (
        <button
            onClick={toggleLanguage}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300 transition-colors flex items-center gap-1"
            title={t('language.switch')}
            aria-label={t('language.switch')}
        >
            <Globe size={20} />
            <span className="text-xs font-medium">{getLabel()}</span>
        </button>
    );
}
