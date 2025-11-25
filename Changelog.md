# Changelog

All notable changes to this project will be documented in this file.
The project follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
**Added**
- ThumbnailUploader component for drag & drop image uploads.
- `uploadResourceThumbnail` logic in the service layer.
- Image display handling in `ResourceCard`.

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
