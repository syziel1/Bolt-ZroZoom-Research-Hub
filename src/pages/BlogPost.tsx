import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, Calendar, User, Clock } from 'lucide-react';
import { blogPosts } from '../content/blog/posts';
import { Footer } from '../components/Footer';

export function BlogPost() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);

    const post = blogPosts.find((p) => p.slug === slug);

    useEffect(() => {
        if (!post) {
            setLoading(false);
            return;
        }

        post.content()
            .then((module) => {
                const text = module.default;
                setContent(text);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Failed to load blog post:', err);
                setLoading(false);
            });
    }, [post]);

    if (!post) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Nie znaleziono artykułu</h1>
                    <button
                        onClick={() => navigate('/blog')}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                        Wróć do listy artykułów
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col">
            <article className="flex-1">
                {/* Hero Section */}
                <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
                    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
                        <button
                            onClick={() => navigate('/blog')}
                            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-8 transition-colors"
                        >
                            <ArrowLeft size={20} />
                            Wróć do bloga
                        </button>

                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6">
                            <div className="flex items-center gap-1.5">
                                <Calendar size={16} />
                                <span>{post.date}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <User size={16} />
                                <span>{post.author}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Clock size={16} />
                                <span>5 min czytania</span>
                            </div>
                        </div>

                        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6 leading-tight">
                            {post.title}
                        </h1>

                        {post.coverImage && (
                            <div className="rounded-xl overflow-hidden shadow-lg mb-8">
                                <img
                                    src={post.coverImage}
                                    alt={post.title}
                                    className="w-full h-auto max-h-[500px] object-cover"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="max-w-3xl mx-auto px-4 py-12">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <div className="prose dark:prose-invert prose-lg max-w-none prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-img:rounded-xl">
                            <ReactMarkdown>{content}</ReactMarkdown>
                        </div>
                    )}
                </div>
            </article>

            <Footer />
        </div>
    );
}
