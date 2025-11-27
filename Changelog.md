# Changelog

All notable changes to this project will be documented in this file.
The project follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
**Added**
- ThumbnailUploader component for drag & drop image uploads.
- `uploadResourceThumbnail` logic in the service layer.
- Image display handling in `ResourceCard`.

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
