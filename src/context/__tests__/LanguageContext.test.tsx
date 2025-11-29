import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageProvider, useLanguage, useTranslation } from '../LanguageContext';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock fetch for translation loading
const mockTranslations = {
    pl: {
        common: { loading: 'Ładowanie...' },
        nav: { login: 'Zaloguj się' },
        language: { switch: 'Zmień język', pl: 'Polski', en: 'English' },
        deep: { nested: { key: { value: 'Głęboko zagnieżdżony' } } }
    },
    en: {
        common: { loading: 'Loading...' },
        nav: { login: 'Log in' },
        language: { switch: 'Change language', pl: 'Polski', en: 'English' },
        deep: { nested: { key: { value: 'Deeply nested' } } }
    }
};

let fetchCallCount = 0;

beforeEach(() => {
    localStorage.clear();
    fetchCallCount = 0;
    vi.stubGlobal('fetch', vi.fn((url: string) => {
        fetchCallCount++;
        const lang = url.includes('pl.json') ? 'pl' : 'en';
        return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockTranslations[lang])
        });
    }));
});

afterEach(() => {
    vi.unstubAllGlobals();
});
function TestComponent() {
    const { language, setLanguage } = useLanguage();
    const { t, isLoading } = useTranslation();

    if (isLoading) {
        return <div>Loading translations...</div>;
    }

    return (
        <div>
            <span data-testid="current-lang">{language}</span>
            <span data-testid="translated-text">{t('nav.login')}</span>
            <button onClick={() => setLanguage(language === 'pl' ? 'en' : 'pl')}>
                Switch
            </button>
        </div>
    );
}

describe('LanguageContext', () => {
    it('provides default language as Polish', async () => {
        render(
            <LanguageProvider>
                <TestComponent />
            </LanguageProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('current-lang')).toHaveTextContent('pl');
        });
    });

    it('loads translations and provides t function', async () => {
        render(
            <LanguageProvider>
                <TestComponent />
            </LanguageProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('translated-text')).toHaveTextContent('Zaloguj się');
        });
    });

    it('switches language when setLanguage is called', async () => {
        const user = userEvent.setup();

        render(
            <LanguageProvider>
                <TestComponent />
            </LanguageProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('translated-text')).toHaveTextContent('Zaloguj się');
        });

        await act(async () => {
            await user.click(screen.getByText('Switch'));
        });

        await waitFor(() => {
            expect(screen.getByTestId('current-lang')).toHaveTextContent('en');
            expect(screen.getByTestId('translated-text')).toHaveTextContent('Log in');
        });
    });

    it('persists language preference in localStorage', async () => {
        const user = userEvent.setup();

        render(
            <LanguageProvider>
                <TestComponent />
            </LanguageProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('current-lang')).toHaveTextContent('pl');
        });

        await act(async () => {
            await user.click(screen.getByText('Switch'));
        });

        await waitFor(() => {
            expect(localStorage.getItem('app-language')).toBe('en');
        });
    });

    it('uses stored language preference on init', async () => {
        localStorage.setItem('app-language', 'en');

        render(
            <LanguageProvider>
                <TestComponent />
            </LanguageProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('current-lang')).toHaveTextContent('en');
        });
    });

    it('returns key when translation is not found', async () => {
        function UnknownKeyComponent() {
            const { t, isLoading } = useTranslation();
            if (isLoading) return <div>Loading...</div>;
            return <span data-testid="unknown">{t('unknown.key')}</span>;
        }

        render(
            <LanguageProvider>
                <UnknownKeyComponent />
            </LanguageProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('unknown')).toHaveTextContent('unknown.key');
        });
    });

    it('supports deeply nested translation keys', async () => {
        function DeepKeyComponent() {
            const { t, isLoading } = useTranslation();
            if (isLoading) return <div>Loading...</div>;
            return <span data-testid="deep">{t('deep.nested.key.value')}</span>;
        }

        render(
            <LanguageProvider>
                <DeepKeyComponent />
            </LanguageProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('deep')).toHaveTextContent('Głęboko zagnieżdżony');
        });
    });

    it('caches translations to avoid redundant fetches', async () => {
        const user = userEvent.setup();

        render(
            <LanguageProvider>
                <TestComponent />
            </LanguageProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('current-lang')).toHaveTextContent('pl');
        });

        const initialFetchCount = fetchCallCount;

        // Switch to English
        await act(async () => {
            await user.click(screen.getByText('Switch'));
        });

        await waitFor(() => {
            expect(screen.getByTestId('current-lang')).toHaveTextContent('en');
        });

        // Switch back to Polish (should use cache)
        await act(async () => {
            await user.click(screen.getByText('Switch'));
        });

        await waitFor(() => {
            expect(screen.getByTestId('current-lang')).toHaveTextContent('pl');
        });

        // Should have only made 2 fetches total (pl + en), not 3
        expect(fetchCallCount).toBe(initialFetchCount + 1);
    });
});
