# technical.md — Szkoła Przyszłości (Lean Version)

Minimalna dokumentacja techniczna dla repozytorium.

---

## 1. Architektura
- **Backend / DB:** Supabase (PostgreSQL + Auth + RLS)
- **Frontend:** Next.js / React (np. bolt.new) — czytelne API przez supabase-js
- **Routing:** React Router DOM — deklaratywne routy, protected routes
- **Publiczne odczytywanie:** materiały, tematy, poziomy, przedmioty
- **Modyfikacje:** tylko zalogowani użytkownicy (z RLS)
- **AI:** Supabase Edge Functions + Google Gemini API

---

## 2. Struktura bazy danych (skrót)

### profiles
- id (uuid, PK)
- nick
- name
- role
- reputation_score
- timestamps

### subjects
- id (uuid)
- name
- slug
- order_index
- timestamps

### topics
- id (uuid)
- subject_id → subjects.id
- name, slug
- parent_topic_id → topics.id (nullable)
- order_index
- timestamps

### levels
- id
- name
- slug
- order_index
- timestamps

### resources
- id
- title
- author
- url
- type
- subject_id → subjects.id
- contributor_id → profiles.id
- embedded (bool)
- description
- language
- ai_generated (bool)
- thumbnail_path (text, nullable) - dla uploadu
- thumbnail_url (text, nullable) - dla linków zewnętrznych
- review_required (bool)
- review_status (text)
- timestamps

### resource_topics
- resource_id → resources.id
- topic_id → topics.id

### resource_levels
- resource_id
- level_id

### ratings
- resource_id
- author_id
- rating_usefulness
- rating_correctness
- difficulty_match
- timestamps

### comments
- resource_id
- author_id
- content
- parent_comment_id (nullable)
- timestamps

### user_favorites
- id
- user_id → profiles.id
- resource_id → resources.id
- created_at

### Automatyzacja (Triggers)
- **increment_reputation_on_resource_add**: Automatycznie dodaje +10 punktów reputacji autorowi po dodaniu nowego zasobu.

---

## 3. Polityki RLS (skrót)

### Public SELECT
- subjects, topics, levels → pełny dostęp odczytu
- resources → SELECT dla wszystkich

### INSERT — tylko WITH CHECK
- użytkownik może dodać rekord tylko z własnym `author_id` / `contributor_id`

### UPDATE / DELETE
- użytkownik modyfikuje **wyłącznie własne** materiały, oceny i komentarze

### Admin / service_role
- pełny dostęp do subjects, topics, levels (zarządzanie słownikami)

### Optymalizacja
- wszystkie `auth.uid()` i `auth.role()` zapisane jako:
  ```sql
  (select auth.uid())
  (select auth.role())
  ```
- widoki używają `SQL SECURITY INVOKER`

---

## 4. Widoki (skrót)

### v_resources_full
- resources + subject + contributor + agregaty ocen

### v_topics_tree
- pełna struktura tematów (drzewo)

### v_subjects_basic
- id + name + slug + order_index

---

## 5. Standardy projektu
- UUID jako PK
- slug używany w URL-ach i filtrach
- order_index → kontrola kolejności wyświetlania
- tabele łącznikowe (resource_topics / resource_levels) zamiast wielokrotnych FK

---

## 6. Minimalna konfiguracja aplikacji
- zmienne środowiskowe:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- po stronie backendu / SSR:
  - Service Role Key **tylko** do migracji, nie do klienta

---

## 7. TODO (MVP)
- Endpoint / frontend do dodawania materiałów
- UI do filtrowania: subject + topic + level + type
- Cache średnich ocen po stronie widoku lub materialized view

---

## 8. TODO (Po MVP)
- system reputacji użytkowników
- backendowy workflow: ekspert → review → approve/reject
- leaderboard współpracowników
- log aktywności (kto dodał, kto zrecenzował)

---

## 9. Edge Functions & AI

### chat-with-ai
- **Runtime:** Deno
- **Model:** Google Gemini 2.5 Flash
- **Funkcja:** Edukacyjny asystent AI (AI Tutor)
- **Input:** Historia czatu (JSON)
- **Output:** Streaming text / Markdown + LaTeX
- **Security:** Weryfikacja klucza API po stronie serwera (Edge)

### analyze-content
- **Runtime:** Deno
- **Model:** Google Gemini 2.5 Flash
- **Funkcja:** Automatyczna analiza treści (tytuł, opis, URL) i sugestia metadanych (przedmiot, temat, poziom)
- **Input:** `{ title, description, url }`
- **Output:** JSON z sugestiami
- **Env:** `GEMINI_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`

### search-youtube
- **Runtime:** Deno
- **API:** YouTube Data API v3
- **Funkcja:** Wyszukiwanie filmów i pobieranie metadanych (czas trwania)
- **Input:** Query string
- **Output:** Znormalizowana lista wideo (JSON)
- **Env:** `YOUTUBE_API_KEY`

---

Dokument gotowy do umieszczenia w głównym repozytorium jako `technical.md`.

---

## 10. UI & Theming

### Dark Mode
- **Implementacja:** `ThemeContext` + Tailwind CSS `darkMode: 'class'`
- **Storage:** `localStorage` (klucz: `vite-ui-theme`)
- **Tryby:** `light`, `dark`, `system` (auto-wykrywanie do dopracowania i testowania)

### Style
- **Tailwind:** Globalne style w `index.css` dla scrollbarów i podstawowych elementów.
- **Komponenty:** Wszystkie komponenty wspierają klasy `dark:` dla spójnego wyglądu.
