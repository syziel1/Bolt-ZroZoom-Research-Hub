# Roadmap

**Mapa Drogowa – Szkoła Przyszłości z AI**

Ten dokument opisuje plany rozwoju platformy Szkoła Przyszłości z AI. Cele podzielone są na fazy, od zadań natychmiastowych po długoterminową wizję „Szkoły Przyszłości”.

🟢 **Faza 1: Stabilizacja, SEO i Content (Q4 2025 – w trakcie)**
**Cel:** Wypełnienie pustej aplikacji treścią, dopięcie techniczne MVP i ściągnięcie ruchu organicznego.
- [x] **SEO & Meta (PRIORYTET):** Wdrożenie `react-helmet-async` (dynamiczne tytuły/opisy) i Open Graph.
- [ ] **Sitemap.xml:** Generowanie mapy strony dla Google.
- [ ] **Blog Edukacyjny:** Uruchomienie sekcji blogowej (CMS w Supabase + Markdown) dla Content Marketingu.
- [x] **Konfiguracja Storage:** Uruchomienie bucketu `resource-thumbnails` w Supabase.
- [ ] **Seed Danych:** Import 50–100 quizów i kanałów YouTube.
- [/] **Deployment:** Podpięcie własnej domeny `szkolaprzyszlosciai.pl` (Instrukcja w `docs/DEPLOYMENT.md`).
- [x] **Wyszukiwanie (MVP):** Implementacja wyszukiwania po stronie klienta (Fuse.js).
- [x] **Dark Mode:** Wdrożenie trybu ciemnego (Tailwind).
- [ ] **Refaktoryzacja (Dług Techniczny):**
  - [ ] Dekompozycja `Dashboard.tsx` (wydzielenie modali i logiki filtrów).
  - [ ] Nowe formularze: Wdrożenie `React Hook Form` + `Zod` w `ResourceForm.tsx`.
  - [ ] **Centralizacja Typów:** Generowanie typów TS z bazy danych (Supabase CLI).

🟡 **Faza 2: Społeczność i Grywalizacja (Q1 2026)**
**Cel:** Zachęcenie użytkowników do aktywności, powrotów i budowania profilu.
- [ ] **Profile Publiczne:** Edycja profilu (Avatar, Bio, Social Media) + bucket `avatars`.
- [ ] **Powiadomienia:** System notyfikacji (wewn. + email) o komentarzach i ocenach.
- [ ] **System Odznak (Badges):** Automatyczne przyznawanie odznak (np. "Debiutant", "Krytyk").
- [ ] **Leaderboard:** Rankingi "Top Kontrybutorów" (miesięczne i ogólne).
- [ ] **Poziomy Użytkownika:** Gamifikacja oparta o punkty reputacji (Nowicjusz -> Mentor).
- [ ] **Internacjonalizacja (i18n):** Wydzielenie hardcodowanych tekstów do plików tłumaczeń.

🔵 **Faza 3: Skalowalność i AI (Q2 2026)**
**Cel:** Obsługa tysięcy zasobów i inteligentne wsparcie.
- [ ] **Server-Side Pagination & Optymalizacja:** Przeniesienie filtrowania do Supabase (zamiast pobierania wszystkich danych).
- [ ] **Inteligentne Tagi:** AI sugerujące tematy na podstawie tytułu i opisu zasobu.
- [ ] **Wyszukiwanie Pełnotekstowe:** Wdrożenie Supabase Full Text Search.
- [ ] **AI Recommendations:** Sugerowanie materiałów na podstawie historii.

🟣 **Faza 4: Szkoła Przyszłości (Wizja Long‑term)**
**Cel:** Przekształcenie bazy linków w platformę edukacyjną.
- [ ] **Czat z Dokumentem (RAG):** Interakcja z materiałami PDF/Tekstowymi (kosztowne, wymaga wektorowej BD).
- [ ] **AI Streszczacz:** Generowanie podsumowań zasobów (z cache i limitami).
- [ ] **Ścieżki Nauki:** Tworzenie playlist edukacyjnych.
- [ ] **Moduł Mentorski:** Konsultacje z ekspertami.

**Status:** Dokument żywy. Ostatnia aktualizacja: 28 Listopada 2025.
