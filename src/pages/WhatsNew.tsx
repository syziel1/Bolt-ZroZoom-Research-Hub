import React from 'react';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import changelog from '../../Changelog.md?raw';

export function WhatsNew() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-gray-100 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors"
                >
                    <ArrowLeft size={20} />
                    Powrót
                </button>

                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 md:p-10">
                    <article className="prose dark:prose-invert max-w-none prose-headings:text-blue-600 dark:prose-headings:text-blue-400 prose-a:text-blue-600 dark:prose-a:text-blue-400">
                        <ReactMarkdown>{changelog}</ReactMarkdown>
                    </article>
                </div>
            </div>
        </div>
    );
}
