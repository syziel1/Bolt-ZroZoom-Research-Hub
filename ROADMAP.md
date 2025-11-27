# Roadmap

**Mapa Drogowa – ZroZoom Hub**

Ten dokument opisuje plany rozwoju platformy ZroZoom Research Hub. Cele podzielone są na fazy, od zadań natychmiastowych po długoterminową wizję „Szkoły Przyszłości”.

🟢 **Faza 1: Stabilizacja, SEO i Content (Q4 2025 – w trakcie)**
**Cel:** Wypełnienie pustej aplikacji treścią, dopięcie techniczne MVP i ściągnięcie ruchu organicznego.
- [ ] **SEO & Meta (PRIORYTET):** Wdrożenie `react-helmet-async` (dynamiczne tytuły/opisy) i Open Graph.
- [ ] **Sitemap.xml:** Generowanie mapy strony dla Google.
- [ ] **Blog Edukacyjny:** Uruchomienie sekcji blogowej (CMS w Supabase + Markdown) dla Content Marketingu.
- [ ] **Konfiguracja Storage:** Uruchomienie bucketu `resource-thumbnails` i `avatars` w Supabase.
- [ ] **Seed Danych:** Import 50–100 quizów i kanałów YouTube.
- [ ] **Deployment:** Podpięcie własnej domeny (np. hub.zrozoom.pl) i konfiguracja HTTPS.
- [x] **Wyszukiwanie (MVP):** Implementacja wyszukiwania po stronie klienta (Fuse.js).
- [ ] **Dark Mode:** Wdrożenie trybu ciemnego (Tailwind).

🟡 **Faza 2: Społeczność i Grywalizacja (Q1 2026)**
**Cel:** Zachęcenie użytkowników do aktywności, powrotów i budowania profilu.
- [ ] **Profile Publiczne:** Edycja profilu (Avatar, Bio, Social Media).
- [ ] **Powiadomienia:** System notyfikacji (wewn. + email) o komentarzach i ocenach.
- [ ] **System Odznak (Badges):** Automatyczne przyznawanie odznak (np. "Debiutant", "Krytyk").
- [ ] **Leaderboard:** Rankingi "Top Kontrybutorów" (miesięczne i ogólne).
- [ ] **Poziomy Użytkownika:** Gamifikacja oparta o punkty reputacji (Nowicjusz -> Mentor).

🔵 **Faza 3: Skalowalność i AI (Q2 2026)**
**Cel:** Obsługa tysięcy zasobów i inteligentne wsparcie.
- [ ] **Server-Side Pagination:** Przejście z filtrowania w przeglądarce na paginację w Supabase.
- [ ] **Inteligentne Tagi:** AI sugerujące tematy na podstawie tytułu i opisu zasobu.
- [ ] **Wyszukiwanie Pełnotekstowe:** Wdrożenie Supabase Full Text Search.
- [ ] **AI Recommendations:** Sugerowanie materiałów na podstawie historii.

🟣 **Faza 4: Szkoła Przyszłości (Wizja Long‑term)**
**Cel:** Przekształcenie bazy linków w platformę edukacyjną.
- [ ] **Czat z Dokumentem (RAG):** Interakcja z materiałami PDF/Tekstowymi (kosztowne, wymaga wektorowej BD).
- [ ] **AI Streszczacz:** Generowanie podsumowań zasobów (z cache i limitami).
- [ ] **Ścieżki Nauki:** Tworzenie playlist edukacyjnych.
- [ ] **Moduł Mentorski:** Konsultacje z ekspertami.

**Status:** Dokument żywy. Ostatnia aktualizacja: Listopad 2025.
