# Roadmap

**Mapa Drogowa – ZroZoom Hub**

Ten dokument opisuje plany rozwoju platformy ZroZoom Research Hub. Cele podzielone są na fazy, od zadań natychmiastowych po długoterminową wizję „Szkoły Przyszłości”.

🟢 **Faza 1: Stabilizacja i Content (Q4 2025 – w trakcie)**
**Cel:** Wypełnienie pustej aplikacji treścią i dopięcie techniczne MVP.
- [ ] **Konfiguracja Storage:** Uruchomienie bucketu `resource-thumbnails` w Supabase i polityk RLS (umożliwienie uploadu miniatur).
- [ ] **Seed Danych:** Import 50–100 quizów z Matzoo.pl oraz wybranych kanałów YouTube (automatyzacja przez AI/SQL).
- [ ] **SEO & Meta:** Dodanie dynamicznych tytułów stron i opisów dla lepszego indeksowania w Google.
- [ ] **Deployment:** Podpięcie własnej domeny (np. hub.zrozoom.pl) i konfiguracja HTTPS.

🟡 **Faza 2: Społeczność i Grywalizacja (Q1 2026)**
**Cel:** Zachęcenie użytkowników do aktywności i powrotów.
- [ ] **Profile Publiczne:** Strona profilu użytkownika z listą dodanych zasobów i odznak.
- [ ] **System Reputacji:** Naliczanie punktów za dodanie zasobu (+10) i otrzymanie „łapki w górę” (+1).
- [ ] **Leaderboard:** Ranking najbardziej pomocnych współpracowników (Top Contributors).
- [ ] **Powiadomienia:** Email lub dzwoneczek w aplikacji, gdy ktoś skomentuje Twój zasób.

🔵 **Faza 3: Skalowalność i AI (Q2 2026)**
**Cel:** Obsługa tysięcy zasobów i inteligentne wsparcie.
- [ ] **Server-Side Pagination:** Przejście z filtrowania w przeglądarce na paginację w Supabase (gdy przekroczymy 1000 zasobów).
- [ ] **Wyszukiwanie Pełnotekstowe:** Wdrożenie Supabase Full Text Search (szukanie w opisach i tytułach).
- [ ] **AI Recommendations:** Sugerowanie materiałów na podstawie historii przeglądania („Obejrzałeś to wideo, sprawdź ten quiz”).
- [ ] **Automatyczna Klasyfikacja:** AI analizujące treść linku i sugerujące Przedmiot/Temat przy dodawaniu.

🟣 **Faza 4: Szkoła Przyszłości (Wizja Long‑term)**
**Cel:** Przekształcenie bazy linków w platformę edukacyjną.
- [ ] **Ścieżki Nauki (Learning Paths):** Możliwość tworzenia playlisty (playlists) (np. „Przygotowanie do matury z matematyki w 30 dni”).
- [ ] **Moduł Mentorski:** Możliwość umawiania konsultacji z ekspertami.
- [ ] **Integracja z LMS:** Eksport ocen i postępów.

**Status:** Dokument żywy. Ostatnia aktualizacja: Listopad 2025.
