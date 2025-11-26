# technical.md — Szkoła Przyszłości (Lean Version)

Minimalna dokumentacja techniczna dla repozytorium.

---

## 1. Architektura
- **Backend / DB:** Supabase (PostgreSQL + Auth + RLS)
- **Frontend:** Next.js / React (np. bolt.new) — czytelne API przez supabase-js
- **Routing:** React Router DOM — deklaratywne routy, protected routes
- **Publiczne odczytywanie:** materiały, tematy, poziomy, przedmioty
- **Modyfikacje:** tylko zalogowani użytkownicy (z RLS)

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
- thumbnail_path (text, nullable)
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

Dokument gotowy do umieszczenia w głównym repozytorium jako `technical.md`. 

