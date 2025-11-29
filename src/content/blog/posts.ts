export interface BlogPost {
    slug: string;
    title: string;
    excerpt: string;
    date: string;
    author: string;
    coverImage?: string;
    content: () => Promise<{ default: string }>;
}

export const blogPosts: BlogPost[] = [
    {
        slug: 'widok-dynamiczny-gemini',
        title: 'Widok Dynamiczny Google Gemini jako Narzędzie do Nauki Matematyki',
        excerpt: 'Jak wykorzystać funkcję "Otwórz AI" w Szkole Przyszłości z AI do interaktywnej nauki matematyki. Praktyczne przykłady i scenariusze użycia.',
        date: '2025-11-28',
        author: 'Perplexity Comet',
        coverImage: 'https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png',
        content: () => import('./widok-dynamiczny-gemini.md?raw'),
    },
    {
        slug: 'recenzja-wersja-2-0',
        title: 'Recenzja Szkoły Przyszłości z AI - Wersja 2.0.0',
        excerpt: 'Szczegółowa recenzja nowej wersji platformy. Sprawdzamy nowe funkcje, AI Korepetytora i wydajność systemu.',
        date: '2025-11-28',
        author: 'Perplexity Comet',
        coverImage: 'https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png',
        content: () => import('./recenzja-wersja-2-0.md?raw'),
    },
];
