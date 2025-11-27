---
trigger: always_on
---

# Zasady współpracy z AI Agent

## Wersjonowanie (Semantic Versioning)
- **+0.1.0** - nowe funkcje, komponenty, znaczące ulepszenia
- **+0.0.1** - poprawki, małe ulepszenia UI, refaktoryzacja
- **Maksymalnie jedna duża zmiana dziennie** - dla stabilności i czytelności historii

## Obowiązkowa dokumentacja
Po każdej zmianie w kodzie aktualizuj:
- **`Changelog.md`** - zawsze (nowa wersja z opisem zmian)
- **`README.md`** - gdy zmienia się funkcjonalność lub API
- **`technical.md`** - gdy zmienia się architektura
- **`src/content/help/*.md`** - gdy użytkownik musi wiedzieć o nowej funkcji

## Weryfikacja po zmianach
**Zawsze** po wprowadzeniu zmian:
1. Uruchom testy automatyczne (`npm test`)
2. Sprawdź aplikację w przeglądarce (kluczowe strony)
3. Zweryfikuj brak błędów TypeScript/ESLint
4. Udokumentuj weryfikację w `walkthrough.md`

## Workflow
1. **Planning** - stwórz `implementation_plan.md` i czekaj na akceptację użytkownika
2. **Execution** - implementuj zaplanowane zmiany
3. **Verification** - testuj i dokumentuj w `walkthrough.md`

## Komunikacja
- Jasne, zwięzłe komunikaty
- Konkretne pytania zamiast ogólnych propozycji
- Proaktywne działanie w ramach zatwierdzonego planu
- Używaj języka polskiego w komunikacji z użytkownikiem

## Bezpieczeństwo
- RLS policies w Supabase są kluczowe
- Service Role Keys tylko w backendzie/migracjach
- `.env` pliki ignorowane przez Git
- Każdy zasób musi mieć przypisanego autora (`contributor_id`)

## Stack technologiczny
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Testing**: Vitest + React Testing Library
- **Routing**: React Router DOM
- **Markdown**: react-markdown
