import { useNavigate } from 'react-router-dom';

type FooterProps = {
    className?: string;
    theme?: 'light' | 'dark';
};

export function Footer({ className = '', theme = 'light' }: FooterProps) {
    const navigate = useNavigate();
    const currentYear = new Date().getFullYear();

    const bgClass = theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50 border-t border-gray-200';
    const textClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
    const hoverClass = theme === 'dark' ? 'hover:text-white' : 'hover:text-gray-900';

    return (
        <footer className={`py-8 px-4 ${bgClass} ${textClass} ${className}`}>
            <div className="max-w-6xl mx-auto text-center">
                <p className="mb-2 text-sm">Szkoła Przyszłości z AI - Twoja baza wiedzy edukacyjnej</p>
                <div className="flex justify-center gap-4 mb-2 text-xs md:text-sm">
                    <button onClick={() => navigate('/o-nas')} className={`${hoverClass} transition-colors`}>O nas</button>
                    <button onClick={() => navigate('/pomoc')} className={`${hoverClass} transition-colors`}>Pomoc</button>
                    <button onClick={() => navigate('/polityka-prywatnosci')} className={`${hoverClass} transition-colors`}>Polityka Prywatności</button>
                </div>
                <p className="text-xs">&copy; {currentYear} Sylwester Zieliński. All rights reserved</p>
            </div>
        </footer>
    );
}
