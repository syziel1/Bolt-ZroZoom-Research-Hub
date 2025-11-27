import { useState, useEffect, useRef } from 'react';
import { Bot, Send, X, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
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
};

export function AiAssistant({ initialQuery, isOpen: propIsOpen, onToggle }: AiAssistantProps) {
    const [internalIsOpen, setInternalIsOpen] = useState(false);
    const isOpen = propIsOpen !== undefined ? propIsOpen : internalIsOpen;

    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Cześć! Jestem Twoim AI Korepetytorem. W czym mogę Ci dzisiaj pomóc? Możesz pytać o dowolne zagadnienie szkolne!' }
    ]);
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
    }, [initialQuery, isOpen]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

    const handleSend = async (text: string = input) => {
        if (!text.trim()) return;

        const userMessage: Message = { role: 'user', content: text };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Prepare context for the AI (last 10 messages to keep context but save tokens)
            const contextMessages = [...messages, userMessage].slice(-10);

            console.log('[AI Assistant] Sending request to chat-with-ai function');
            console.log('[AI Assistant] Context messages:', contextMessages);

            const { data, error } = await supabase.functions.invoke('chat-with-ai', {
                body: { messages: contextMessages }
            });

            console.log('[AI Assistant] Response received:', { data, error });

            if (error) {
                console.error('[AI Assistant] Supabase function error:', error);
                throw error;
            }

            if (data.error) {
                console.error('[AI Assistant] API error in response:', data.error);
                throw new Error(data.error);
            }

            if (!data.content) {
                console.error('[AI Assistant] No content in response:', data);
                throw new Error('Brak odpowiedzi od AI');
            }

            console.log('[AI Assistant] AI response content:', data.content);

            const aiMessage: Message = { role: 'assistant', content: data.content };
            setMessages(prev => [...prev, aiMessage]);

        } catch (error) {
            console.error('[AI Assistant] Chat error:', error);
            console.error('[AI Assistant] Error details:', {
                message: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined,
                raw: error
            });
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `Przepraszam, wystąpił błąd połączenia.\n\n**Szczegóły błędu:**\n${error instanceof Error ? error.message : 'Nieznany błąd'}\n\nSpróbuj ponownie później lub sprawdź konsolę deweloperską (F12).`
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
        <div className="fixed bottom-6 right-6 w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 flex flex-col overflow-hidden max-h-[600px] h-[80vh]">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                    <div className="bg-white/20 p-1.5 rounded-full">
                        <Bot size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold">AI Korepetytor</h3>
                        <p className="text-xs text-purple-100">Zawsze gotowy do pomocy</p>
                    </div>
                </div>
                <button
                    onClick={() => handleToggle(false)}
                    className="text-white/80 hover:text-white hover:bg-white/10 p-1 rounded-full transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${msg.role === 'user'
                                ? 'bg-blue-600 text-white rounded-br-none'
                                : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
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
                                                ? <code className="bg-purple-100 text-purple-800 px-1 py-0.5 rounded text-xs" {...props} />
                                                : <code className="block bg-gray-100 p-2 rounded my-2 text-xs overflow-x-auto" {...props} />;
                                        },
                                        strong: ({ children }) => <strong className="font-bold text-gray-900">{children}</strong>,
                                        em: ({ children }) => <em className="italic">{children}</em>,
                                        h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                                        h2: ({ children }) => <h2 className="text-base font-bold mb-2">{children}</h2>,
                                        h3: ({ children }) => <h3 className="text-sm font-bold mb-1">{children}</h3>,
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
                        <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-2">
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-100">
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
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
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
            </div>
        </div>
    );
}
