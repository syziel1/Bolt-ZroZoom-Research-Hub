---
description: Kompletna procedura wdrażania funkcji: QA, bezpieczeństwo (RLS), typy DB, i18n, SEO, aktualizacja dokumentacji, changelog i roadmapa
---

# Workflow: New Feature Implementation

Wykonaj poniższe kroki po zakończeniu kodowania nowej funkcjonalności, aby zapewnić spójność i jakość projektu.

## 1. Weryfikacja Jakości i Typów (QA)
- [ ] **Generowanie typów:** Jeśli zmieniłeś bazę danych, uruchom komendę do wygenerowania typów TypeScript (zgodnie z `technical.md`), aby frontend był zsynchronizowany z DB.
- [ ] **Linting i Typy:** Uruchom `npm run lint` oraz `npm run typecheck`. Nie ignoruj żadnych ostrzeżeń.
- [ ] **Testy automatyczne:** Uruchom `npm test`. Upewnij się, że nowa funkcja jest pokryta testami (jednostkowymi lub integracyjnymi).
- [ ] **Build:** Uruchom `npm run build`, aby wykluczyć błędy kompilacji produkcyjnej.

## 2. Bezpieczeństwo i Backend
- [ ] **RLS Policies:** Jeśli dodałeś/zmieniłeś tabele, sprawdź w `supabase/migrations/` czy polityki Row Level Security są poprawne (użytkownik nie może widzieć/edytować cudzych danych).
- [ ] **Zmienne środowiskowe:** Jeśli dodałeś nowe klucze API lub flagi funkcji:
    - [ ] Dodaj je do `.env.example`.
    - [ ] Zaktualizuj sekcję konfiguracji w `technical.md` lub `README.md`.
- [ ] **Edge Functions:** Jeśli wdrożyłeś nową funkcję backendową, zdeployuj ją i zweryfikuj jej działanie na produkcji.

## 3. Frontend i UX
- [ ] **Responsywność:** Sprawdź działanie funkcji na urządzeniach mobilnych (RWD).
- [ ] **Internacjonalizacja (i18n):** Upewnij się, że nowe teksty w interfejsie nie są wpisane na sztywno ("hardcoded"), lecz przygotowane pod przyszłe tłumaczenia (zgodnie z Roadmapą).
- [ ] **SEO:** Jeśli dodałeś nową podstronę publiczną, upewnij się, że zawiera komponent `<SEO />` z odpowiednim tytułem i opisem.

## 4. Dokumentacja i Wiedza
- [ ] **Dokumentacja techniczna:** Zaktualizuj `technical.md` o zmiany w architekturze, strukturze bazy lub nowe zależności.
- [ ] **Pomoc dla użytkownika:** Jeśli funkcja zmienia sposób działania aplikacji, zaktualizuj `src/content/help/guide.md` lub `faq.md`.
- [ ] **Roadmapa:** Zaktualizuj status zadania w `ROADMAP.md` (np. oznacz jako wykonane `[x]`).

## 5. Publikacja i Marketing
- [ ] **Changelog:** Dodaj wpis w `Changelog.md` (sekcja `[Unreleased]` lub nowa wersja).
- [ ] **Wersjonowanie:** Podbij wersję w `package.json` (zgodnie z zasadami w `.agent/rules/main.md`).
- [ ] **Blog/Social Media:** (Opcjonalnie) Przygotuj krótki tekst promujący nową funkcję dla społeczności.

## 6. Czyszczenie (Cleanup)
- [ ] Usuń tymczasowe `console.log` i zakomentowany kod.
- [ ] Usuń nieużywane importy.