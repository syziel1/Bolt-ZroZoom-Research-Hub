# Changelog

All notable changes to this project will be documented in this file.
The project follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.2.0] - 2025-11-28
### Added
- **Bezpieczeństwo**: System ostrzegania przed linkami zewnętrznymi (whitelist).
- **Moderacja**: Automatyczny filtr wulgaryzmów w komentarzach i zasobach.
- **Legal**: Strona "Zasady korzystania z serwisu" (`/zasady`).
- **UX**: Aktywne linki i znaczniki czasowe (seek) w opisach wideo.
- **UI**: Powiększona miniatura w szczegółach zasobu.

## [2.1.0] - 2025-11-28
### Added
- **System Pomocy**: Nowe przewodniki dla Dashboardu i Formularza Zasobów.
- **Kontekstowa Pomoc**: Przyciski `[?]` w nagłówku i formularzach kierujące do odpowiednich sekcji.
- **AI Branding**: Ikonka gwiazdki AI w nagłówku aplikacji.

### Changed
- **Dashboard Header**: Ulepszona responsywność przycisków (ukrywanie tekstu na mniejszych ekranach).
- **Theme Toggle**: Zmieniono na pojedynczy, kompaktowy przycisk cykliczny.
- **Resource Form**: Przycisk pomocy otwiera się w nowej karcie (ochrona danych).

## [2.0.1] - 2025-11-28
**Added**
- **Filter Chips**: Interaktywne "chipsy" filtrów w nagłówku dashboardu
  - Wyświetlanie aktywnych filtrów (wyszukiwanie, przedmiot, temat, poziom, język) jako usuwalne chipy
  - Przycisk X na każdym chipie umożliwiający szybkie usunięcie filtru
  - Dynamiczny nagłówek: "Wszystkie zasoby" vs "Wyniki filtrowania:"
- **Blog Posts in Search**: Dodano wyświetlanie artykułów z bloga w wynikach wyszukiwania
  - Sekcja "Artykuły z Bloga" pojawia się pod zasobami gdy znaleziono pasujące posty
  - Grid z postami (responsywny: 1/2/3 kolumny)
  - Hover effects i animacje

**Changed**
- **Sorting Position**: Sortowanie zawsze widoczne niezależnie od stanu filtrów

## [2.0.0] - 2025-11-28
**Added**
- **AI Chat Enhancements**: Major upgrade to AI Assistant functionality.
  - **User Context**: AI now knows user's name and language for personalized responses.
  - **Enhanced System Prompt**: Detailed instructions from `system-prompt.md` for better answer quality.
  - **Debug Logging**: Server-side logging for diagnosing issues.
  
**Changed**
- **AI Model Upgrade**: Switched to `gemini-2.5-pro` for higher quality responses.

**Fixed**
- **Error Handling**: Better error messages for API quota and configuration issues.

## [1.9.0] - 2025-11-28
**Added**
- **User Home Page**: Personalized landing page for logged-in users.
- **Statistics**: User statistics (favorites, ratings, added resources) with navigation to filtered Dashboard.
- **Recently Opened**: Carousel of recently viewed resources with auto-scroll and persistence.

## [1.8.0] - 2025-11-28
**Added**
- **Wikipedia Integration**: Search and add articles from Polish Wikipedia.
- **UI**: Wikipedia search button in Sidebar.

## [1.7.0] - 2025-11-27
**Added**
- **Dark Mode**: Full dark mode support with system preference detection and manual toggle.
- **UI**: Theme toggle in Dashboard Header and Sidebar.

**Changed**
- **Landing Page**: Replaced "Latest Resources" with "Top Rated Resources" (sorted by `avg_usefulness`).
- **Styling**: Updated scrollbars to match dark mode theme.

## [1.6.1] - 2025-11-27
**Added**
- **Footer Component**: Reusable footer with theme support (light/dark).

**Changed**
- **UI Consistency**: Standardized footer across all pages (Landing Page, Dashboard, Help Center, static pages).

## [1.6.0] - 2025-11-27
**Added**
- **Help Center**: New `/pomoc` route with sidebar navigation.
- **Help Content**: Markdown-based user guide and FAQ.

## [1.5.0] - 2025-11-27
**Added**
- **Automated Testing**: Setup Vitest + React Testing Library.
- **UI**: Clear button ("X") in search inputs.
- **Components**: `TopicTree` component for hierarchical navigation.

**Changed**
- **Refactor**: Split `Dashboard.tsx` into smaller components (`DashboardHeader`, `DashboardGrid`) and hooks (`useDashboardData`, `useDashboardFilters`).

## [1.4.0] - 2025-11-27
**Added**
- **AI Tutor**: Interactive chat assistant powered by Google Gemini (Edge Function).
- **Edge Functions**: Integration with Supabase Edge Functions (`chat-with-ai`).
- **Rich Text Support**: Markdown and LaTeX rendering for AI responses (`react-markdown`, `rehype-katex`).
- **Video Search**: Integrated YouTube video search (`search-youtube` Edge Function).
- **Metadata Analysis**: AI-powered metadata suggestions (`analyze-content` Edge Function) - "Wypełnij z AI" button.
- **Favorites**: User favorites system (`user_favorites` table).
- **UI**: Floating AI Assistant button and chat interface.

## [1.3.0] - 2025-11-26
**Added**
- React Router DOM integration with declarative routing.
- Client-side search functionality (filters by title and description).
- URL-based navigation with query parameters (`?q=search`).
- Protected routes and automatic redirects.
- Markdown pages for About and Privacy Policy.

## [1.2.0] - 2025-11-26
**Added**
- Pagination in Dashboard (client-side).
- Card Variants: Hero (large), List (compact), and Default.
- Language filtering support.
- Enhanced `ResourceCard` with thumbnail support and new variants.

## [1.1.0] - 2025-11-25
**Added**
- Landing Page: public home with hero section, stats, and subject tiles.
- Guest Mode: browse the database without logging in.
- Admin Panel: GUI for managing subjects, topics, and levels.
- Topic Tree: hierarchical display of topics in the sidebar.
- Developer Shortcut: quick login button in dev mode.

**Changed**
- Application routing: default view is now Landing Page instead of login form.
- `ResourceDetailModal`: added role-based access (edit only for author or admin).

## [1.0.0] - 2025-11-24 (MVP)
**Added**
- Core: Supabase integration (auth, database).
- Dashboard: main view with client-side filtering by subject, topic, and level.
- Resources: adding links (YouTube, articles) with automatic author attribution.
- Community: rating system (1-5 stars) and comments.
- Security: Row Level Security (RLS) in the database.
- Architecture: SQL views (`v_resources_full`) for read optimization.

## [0.1.0] - 2025-11-20
**Added**
- Project initialization with Vite + React + TypeScript + Tailwind.
- Database schema design (Entity Relationship Diagram).
