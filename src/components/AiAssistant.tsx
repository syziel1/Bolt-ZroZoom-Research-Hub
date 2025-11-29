import { useState, useEffect, useRef } from 'react';
import { Bot, Send, X, Sparkles, RotateCcw } from 'lucide-react';
import { supabase, Resource, Subject } from '../lib/supabase';
import { logger } from '../lib/logger';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

type Message = {
    role: 'user' | 'assistant';
    content: string;
};

type AiAssistantProps = {
    initialQuery?: string;
    isOpen?: boolean;
    onToggle?: (isOpen: boolean) => void;
    // Context props
    selectedSubject?: Subject | null;
    selectedTopics?: string[];
    selectedLevels?: string[];
    selectedLanguages?: string[];
    currentResource?: Resource | null;
};

export function AiAssistant({
    initialQuery,
    isOpen: propIsOpen,
    onToggle,
    selectedSubject,
    selectedTopics = [],
    selectedLevels = [],
    currentResource
}: AiAssistantProps) {
    const [internalIsOpen, setInternalIsOpen] = useState(false);
    const isOpen = propIsOpen !== undefined ? propIsOpen : internalIsOpen;

    const initialMessage: Message = { role: 'assistant', content: 'Cześć! Jestem AI Korepetytorem. W czym mogę pomóc?' };
    const [messages, setMessages] = useState<Message[]>([initialMessage]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const initialQuerySent = useRef<string>('');

    // Handle initial query (e.g. "Explain [search term]")
    useEffect(() => {
        if (initialQuery && isOpen && initialQuery !== initialQuerySent.current) {
            initialQuerySent.current = initialQuery;
            handleSend(initialQuery);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialQuery, isOpen]);

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleToggle = (newState: boolean) => {
        if (onToggle) {
            onToggle(newState);
        } else {
            setInternalIsOpen(newState);
        }
    };

    const handleClearChat = () => {
        setMessages([initialMessage]);
        setInput('');
        scrollToBottom();
    };

    const handleSend = async (text: string = input) => {
        if (!text.trim()) return;

        const userMessage: Message = { role: 'user', content: text };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Build context information (only if present)
            const contextParts: string[] = [];

            if (currentResource) {
                contextParts.push(`📚 Zasób: "${currentResource.title}"`);
            }

            if (selectedSubject) {
                contextParts.push(`📖 Przedmiot: ${selectedSubject.subject_name}`);
            }

            if (selectedTopics.length > 0) {
                contextParts.push(`🎯 Tematy: ${selectedTopics.join(', ')}`);
            }

            if (selectedLevels.length > 0) {
                contextParts.push(`📊 Poziomy: ${selectedLevels.join(', ')}`);
            }

            // Build message content with optional context
            let messageContent = text;
            if (contextParts.length > 0 && messages.length === 1) {
                // Add context only to first user message
                messageContent = `${text}\n\n[Kontekst: ${contextParts.join(' | ')}]`;
            }

            // Prepare messages for API (last 6 to save tokens)
            const recentMessages = [...messages, { role: 'user', content: messageContent }].slice(-6);

            logger.log('[AI Assistant] Sending request to chat-with-ai function');

            const { data, error } = await supabase.functions.invoke('chat-with-ai', {
                body: { messages: recentMessages }
            });

            logger.log('[AI Assistant] Response received:', { data, error });

            if (error) {
                logger.error('[AI Assistant] Supabase function error:', error);
                throw error;
            }

            if (data.error) {
                logger.error('[AI Assistant] API error in response:', data.error);
                throw new Error(data.error);
            }

            if (!data.content) {
                logger.error('[AI Assistant] No content in response:', data);
                throw new Error('Brak odpowiedzi od AI');
            }

            logger.log('[AI Assistant] AI response content:', data.content);

            const aiMessage: Message = { role: 'assistant', content: data.content };
            setMessages(prev => [...prev, aiMessage]);

        } catch (error) {
            logger.error('[AI Assistant] Chat error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `Przepraszam, wystąpił błąd połączenia.\n\n**Szczegóły błędu:**\n${error instanceof Error ? error.message : 'Nieznany błąd'}\n\nSpróbuj ponownie później.`
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => handleToggle(true)}
                className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 z-50 flex items-center gap-2"
                title="Zapytaj AI Korepetytora"
            >
                <Sparkles size={24} />
                <span className="font-medium hidden md:inline">AI Korepetytor</span>
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 z-50 flex flex-col h-[80vh] max-h-[700px]">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                    <div className="bg-white/20 p-1.5 rounded-full">
                        <Bot size={20} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold">AI Korepetytor</h3>
                            <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded text-white font-medium">BETA</span>
                        </div>
                        <p className="text-xs text-purple-100">Zawsze gotowy do pomocy</p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={handleClearChat}
                        className="hover:bg-white/10 p-2 rounded-full transition"
                        title="Nowy czat"
                    >
                        <RotateCcw size={18} />
                    </button>
                    <button
                        onClick={() => handleToggle(false)}
                        className="hover:bg-white/10 p-2 rounded-full transition"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-slate-900">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${msg.role === 'user'
                                ? 'bg-blue-600 text-white rounded-br-none'
                                : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-slate-700 rounded-bl-none shadow-sm'
                                }`}
                        >
                            {msg.role === 'assistant' ? (
                                <ReactMarkdown
                                    remarkPlugins={[remarkMath]}
                                    rehypePlugins={[rehypeKatex]}
                                    components={{
                                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                        ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                                        ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                                        li: ({ children }) => <li className="ml-2">{children}</li>,
                                        code: ({ node, ...props }) => {
                                            const isInline = !node?.position || node.position.start.line === node.position.end.line;
                                            return isInline
                                                ? <code className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 px-1 py-0.5 rounded text-xs" {...props} />
                                                : <code className="block bg-gray-100 dark:bg-slate-900 p-2 rounded my-2 text-xs overflow-x-auto text-gray-800 dark:text-gray-200" {...props} />;
                                        },
                                        strong: ({ children }) => <strong className="font-bold text-gray-900 dark:text-gray-100">{children}</strong>,
                                        em: ({ children }) => <em className="italic">{children}</em>,
                                        h1: ({ children }) => <h1 className="text-lg font-bold mb-2 text-gray-900 dark:text-gray-100">{children}</h1>,
                                        h2: ({ children }) => <h2 className="text-base font-bold mb-2 text-gray-900 dark:text-gray-100">{children}</h2>,
                                        h3: ({ children }) => <h3 className="text-sm font-bold mb-1 text-gray-900 dark:text-gray-100">{children}</h3>,
                                    }}
                                >
                                    {msg.content}
                                </ReactMarkdown>
                            ) : (
                                msg.content
                            )}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-2">
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSend();
                    }}
                    className="flex gap-2"
                >
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Zapytaj o cokolwiek..."
                        className="flex-1 px-4 py-2 border border-gray-200 dark:border-slate-600 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send size={20} />
                    </button>
                </form>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center mt-2">
                    AI (wersja Beta) może generować niedokładne informacje. Weryfikuj ważne dane.
                </p>
            </div>
        </div>
    );
}
