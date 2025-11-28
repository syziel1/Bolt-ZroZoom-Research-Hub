import { useNavigate } from 'react-router-dom';

type FooterProps = {
    className?: string;
    theme?: 'light' | 'dark';
};

export function Footer({ className = '', theme }: FooterProps) {
    const navigate = useNavigate();
    const currentYear = new Date().getFullYear();

    const isDarkForced = theme === 'dark';

    const footerClasses = isDarkForced
        ? "bg-slate-900 border-slate-700 text-gray-400"
        : "bg-gray-50 dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400";

    const linkClasses = isDarkForced
        ? "hover:text-gray-100 transition-colors"
        : "hover:text-gray-900 dark:hover:text-gray-100 transition-colors";

    return (
        <footer className={`py-8 px-4 border-t ${footerClasses} ${className}`}>
            <div className="max-w-6xl mx-auto text-center">
                <p className="mb-2 text-sm">Szkoła Przyszłości z AI - Twoja baza wiedzy edukacyjnej</p>
                <div className="flex justify-center gap-4 mb-2 text-xs md:text-sm">
                    <button onClick={() => navigate('/o-nas')} className={linkClasses}>O nas</button>
                    <button onClick={() => navigate('/pomoc')} className={linkClasses}>Pomoc</button>
                    <button onClick={() => navigate('/polityka-prywatnosci')} className={linkClasses}>Polityka Prywatności</button>
                </div>
                <p className="text-xs">&copy; {currentYear} Sylwester Zieliński. All rights reserved</p>
            </div>
        </footer>
    );
}
