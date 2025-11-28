import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, Book, HelpCircle, LayoutDashboard } from 'lucide-react';
import { Footer } from '../components/Footer';
import faqContent from '../content/help/faq.md?raw';
import guideContent from '../content/help/guide.md?raw';
import dashboardGuideContent from '../content/help/dashboard-guide.md?raw';

const TOPICS = [
    { id: 'guide', title: 'Przewodnik Użytkownika', icon: Book, content: guideContent },
    { id: 'dashboard', title: 'Panel Zasobów', icon: LayoutDashboard, content: dashboardGuideContent },
    { id: 'faq', title: 'Często Zadawane Pytania', icon: HelpCircle, content: faqContent },
];

export function HelpPage() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [content, setContent] = useState('');

    const activeTopic = TOPICS.find(t => t.id === slug) || TOPICS[0];

    useEffect(() => {
        if (!slug) {
            navigate(`/pomoc/${TOPICS[0].id}`, { replace: true });
            return;
        }
        setContent(activeTopic.content);
    }, [slug, navigate, activeTopic]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-4 py-4">
                <div className="max-w-7xl mx-auto flex items-center gap-4">
                    <Link to="/" className="text-gray-500 hover:text-gray-700 transition-colors">
                        <ArrowLeft size={24} />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Centrum Pomocy</h1>
                </div>
            </header>

            <div className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 flex flex-col md:flex-row gap-8">
                {/* Sidebar */}
                <aside className="w-full md:w-64 flex-shrink-0">
                    <nav className="space-y-2">
                        {TOPICS.map((topic) => (
                            <Link
                                key={topic.id}
                                to={`/pomoc/${topic.id}`}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTopic.id === topic.id
                                    ? 'bg-blue-50 text-blue-700 font-medium'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                <topic.icon size={20} />
                                {topic.title}
                            </Link>
                        ))}
                    </nav>
                </aside>

                {/* Content */}
                <main className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
                    <article className="prose prose-blue max-w-none">
                        <ReactMarkdown>{content}</ReactMarkdown>
                    </article>
                </main>
            </div>
            <Footer className="border-t border-gray-200 bg-white" />
        </div>
    );
}
