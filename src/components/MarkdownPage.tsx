import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

type MarkdownPageProps = {
    fileName: string;
    onBack: () => void;
};

export function MarkdownPage({ fileName, onBack }: MarkdownPageProps) {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/content/${fileName}`)
            .then((res) => res.text())
            .then((text) => {
                setContent(text);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Failed to load markdown:', err);
                setContent('# Błąd\nNie udało się załadować treści.');
                setLoading(false);
            });
    }, [fileName]);

    // Simple markdown parser for basic formatting
    const renderMarkdown = (text: string) => {
        const lines = text.split('\n');
        return lines.map((line, index) => {
            // Headers
            if (line.startsWith('# ')) {
                return <h1 key={index} className="text-3xl font-bold text-gray-900 mb-6 mt-8">{line.slice(2)}</h1>;
            }
            if (line.startsWith('## ')) {
                return <h2 key={index} className="text-2xl font-bold text-gray-800 mb-4 mt-6">{line.slice(3)}</h2>;
            }
            if (line.startsWith('### ')) {
                return <h3 key={index} className="text-xl font-bold text-gray-800 mb-3 mt-4">{line.slice(4)}</h3>;
            }

            // Lists
            if (line.startsWith('* ') || line.startsWith('- ')) {
                // Handle bold text in list items
                const content = line.slice(2);
                const parts = content.split('**');
                return (
                    <li key={index} className="ml-6 list-disc mb-2 text-gray-700">
                        {parts.map((part, i) =>
                            i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                        )}
                    </li>
                );
            }

            // Numbered lists
            if (/^\d+\.\s/.test(line)) {
                const content = line.replace(/^\d+\.\s/, '');
                return (
                    <li key={index} className="ml-6 list-decimal mb-2 text-gray-700">
                        {content}
                    </li>
                )
            }

            // Empty lines
            if (line.trim() === '') {
                return <div key={index} className="h-4"></div>;
            }

            // Paragraphs with bold support
            const parts = line.split('**');
            return (
                <p key={index} className="text-gray-700 mb-2 leading-relaxed">
                    {parts.map((part, i) =>
                        i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                    )}
                </p>
            );
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
                >
                    <ArrowLeft size={20} />
                    Powrót
                </button>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="prose max-w-none">
                        {renderMarkdown(content)}
                    </div>
                )}
            </div>
        </div>
    );
}
