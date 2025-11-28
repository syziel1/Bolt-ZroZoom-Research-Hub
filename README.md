# Szkoła Przyszłości z AI

**Platforma zasobów edukacyjnych** - Twoja baza wiedzy dla Szkoły Przyszłości AI

## 📋 Spis treści

- [O projekcie](#-o-projekcie)
- [Funkcjonalności](#-funkcjonalności)
- [Stack technologiczny](#-stack-technologiczny)
- [Instalacja](#-instalacja)
- [Konfiguracja](#%EF%B8%8F-konfiguracja)
- [Uruchomienie](#-uruchomienie)
- [Struktura projektu](#-struktura-projektu)
- [Baza danych](#%EF%B8%8F-baza-danych)
- [Developer Tools](#-developer-tools)
- [Dokumentacja](#-dokumentacja)

## 🎯 O projekcie

Szkoła Przyszłości z AI to platforma do gromadzenia, organizowania i udostępniania materiałów edukacyjnych. Umożliwia:

- **Przeglądanie** - dostęp do zasobów edukacyjnych bez logowania (tryb gościa)
- **Dodawanie** - zalogowani użytkownicy mogą dodawać nowe materiały
- **Ocenianie** - system ocen użyteczności i poprawności materiałów
- **Komentowanie** - dyskusja pod każdym zasobem
- **Filtrowanie** - po przedmiotach, tematach i poziomach trudności

## ✨ Funkcjonalności

### Dla wszystkich użytkowników
- 📚 Przeglądanie zasobów edukacyjnych
- 🔍 Filtrowanie po przedmiotach, tematach, poziomach i języku
- 📊 Wyświetlanie statystyk i ocen materiałów
- 🌳 Hierarchiczne drzewo tematów
- 📑 Paginacja wyników wyszukiwania
- 🔍 Wyszukiwanie pełnotekstowe (klient)
- 🃏 Różne widoki kart (Hero, Lista, Siatka)
- 🔗 Routing z URL parametrami
- 🌓 Tryb ciemny (Dark Mode) z wykrywaniem ustawień systemowych (beta)

### Dla zalogowanych użytkowników
- ➕ Dodawanie nowych zasobów
- ⭐ Ocenianie materiałów (użyteczność, poprawność, trudność)
- 💬 Komentowanie zasobów
- 👤 Profil użytkownika z nickiem

### Dla administratorów
- ⚙️ Panel administracyjny
- 📝 Zarządzanie przedmiotami, tematami i poziomami
- 🔍 Moderacja treści
- 🌐 Integracja z Wikipedią (wyszukiwanie i dodawanie artykułów)

## 🛠 Stack technologiczny

### Frontend
- **React 18** - biblioteka UI
- **TypeScript** - typowanie statyczne
- **Vite** - narzędzie budowania
- **Tailwind CSS** - stylowanie
- **Lucide React** - ikony
- **React Router DOM** - routing i nawigacja
- **React Markdown** + **Katex** - renderowanie treści AI
- **Vitest** + **React Testing Library** - testy automatyczne

### Backend
- **Supabase** - Backend-as-a-Service
  - PostgreSQL - baza danych
  - Authentication - uwierzytelnianie
  - Row Level Security (RLS) - bezpieczeństwo
  - Real-time subscriptions - aktualizacje na żywo
- **Supabase Edge Functions** - serverless functions (Deno)

## 📦 Instalacja

### Wymagania
- Node.js 18+
- npm lub yarn
- Konto Supabase (darmowe)

### Kroki instalacji

1. **Sklonuj repozytorium**
```bash
git clone https://github.com/your-username/Szkola-Przyszlosci-AI.git
cd Szkola-Przyszlosci-AI
```

2. **Zainstaluj zależności**
```bash
npm install
```

3. **Skonfiguruj Supabase**
   - Utwórz projekt na [supabase.com](https://supabase.com)
   - Uruchom migracje SQL z katalogu `docs/` (jeśli dostępne)
   - Skonfiguruj RLS policies zgodnie z `technical.md`

4. **Skonfiguruj zmienne środowiskowe**
```bash
# Utwórz plik .env w głównym katalogu
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## ⚙️ Konfiguracja

### Zmienne środowiskowe

Utwórz plik `.env` w głównym katalogu projektu:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: Custom test user credentials for Developer Shortcut
# If not set, you must provide credentials manually
VITE_TEST_EMAIL=your-test-email@example.com
VITE_TEST_PASSWORD=your-test-password
```

> **Uwaga:** Plik `.env` jest ignorowany przez git. Nigdy nie commituj kluczy API!

### Konfiguracja Supabase

1. **Authentication**
   - Włącz Email/Password authentication
   - Skonfiguruj redirect URLs dla localhost

2. **Database**
   - Uruchom skrypty SQL z dokumentacji
   - Skonfiguruj RLS policies
   - Utwórz widoki (views) dla optymalizacji

3. **Storage** (opcjonalnie)
   - Skonfiguruj bucket dla miniatur zasobów

## 🚀 Uruchomienie

### Tryb deweloperski
```bash
npm run dev
```
Aplikacja będzie dostępna pod adresem `http://localhost:5173`

### Budowanie produkcyjne
```bash
npm run build
```

### Podgląd buildu produkcyjnego
```bash
npm run preview
```

### Linting
```bash
npm run lint
```

### Type checking
```bash
npm run typecheck
```

### Testy automatyczne
```bash
npm test
```

## 📁 Struktura projektu

```text
Szkola-Przyszlosci-AI/
├── src/
│   ├── components/          # Komponenty React
│   │   ├── AuthForm.tsx     # Formularz logowania/rejestracji
│   │   ├── Dashboard.tsx    # Główny widok (kontener)
│   │   ├── DashboardHeader.tsx # Nagłówek dashboardu
│   │   ├── DashboardGrid.tsx   # Siatka zasobów
│   │   ├── Sidebar.tsx      # Boczne menu z filtrami
│   │   └── setup.ts         # Setup Vitest
│   ├── App.tsx              # Główny komponent aplikacji
│   ├── main.tsx             # Entry point
│   └── index.css            # Globalne style
├── docs/                    # Dokumentacja
│   ├── specyfikacja_bazy_szkola_przyszlosci.md
│   └── prompt_codex_resource_thumbnails.md
├── technical.md             # Dokumentacja techniczna
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

## 🗄️ Baza danych

### Główne tabele

- **profiles** - profile użytkowników (nick, rola, reputacja)
- **subjects** - przedmioty (Matematyka, Fizyka, etc.)
- **topics** - tematy w strukturze drzewa (parent-child)
- **levels** - poziomy trudności (podstawa, rozszerzenie, etc.)
- **resources** - zasoby edukacyjne (linki, opisy)
- **resource_topics** - powiązania zasób-temat (many-to-many)
- **resource_levels** - powiązania zasób-poziom (many-to-many)
- **ratings** - oceny zasobów (użyteczność, poprawność, trudność)
- **comments** - komentarze do zasobów

### Widoki (Views)

- **v_resources_full** - zasoby z zagregowanymi ocenami i metadanymi
- **v_topics_tree** - hierarchiczna struktura tematów
- **v_subjects_basic** - podstawowe informacje o przedmiotach

### Row Level Security (RLS)

- **Public SELECT** - odczyt dla wszystkich (subjects, topics, levels, resources)
- **Authenticated INSERT** - dodawanie tylko dla zalogowanych
- **Owner UPDATE/DELETE** - modyfikacja tylko własnych zasobów
- **Admin** - pełny dostęp do zarządzania słownikami

Szczegóły w pliku [`technical.md`](./technical.md)

## 🔧 Developer Tools

### Developer Shortcut (tylko w dev mode)

W trybie deweloperskim dostępny jest przycisk "Auto-fill Test User" na formularzu logowania.

**Konfiguracja danych testowych:**
Dodaj do pliku `.env`:
```env
VITE_TEST_EMAIL=your-test-email@example.com
VITE_TEST_PASSWORD=your-test-password
```

> **Uwaga:** Ta funkcja jest widoczna tylko gdy `import.meta.env.DEV === true`. Nigdy nie commituj pliku `.env` do repozytorium!

### Responsive Design

Aplikacja jest w pełni responsywna:
- **Mobile** - sidebar jako overlay
- **Tablet** - 1 kolumna kart zasobów
- **Desktop** - 2 kolumny kart zasobów

## 📚 Dokumentacja

### Pliki dokumentacji

- [`README.md`](./README.md) - Ten plik, ogólny przegląd projektu
- [`technical.md`](./technical.md) - Szczegółowa dokumentacja techniczna
- [`docs/specyfikacja_bazy_szkola_przyszlosci.md`](./docs/specyfikacja_bazy_szkola_przyszlosci.md) - Specyfikacja bazy danych
- [`docs/prompt_codex_resource_thumbnails.md`](./docs/prompt_codex_resource_thumbnails.md) - Dokumentacja miniatur
- [`Changelog.md`](./Changelog.md) - Historia zmian
- [`ROADMAP.md`](./ROADMAP.md) - Plan rozwoju
- [`LICENSE`](./LICENSE) - Licencja MIT

### Komponenty

#### AuthForm
Formularz logowania i rejestracji z integracją Supabase Auth.

#### Dashboard
Główny widok aplikacji z:
- Statystykami (liczba zasobów, przedmiotów, tematów)
- Sekcją "Ostatnio dodane"
- Listą wszystkich zasobów z filtrowaniem i paginacją

#### Sidebar
Boczne menu z filtrami:
- Wybór przedmiotu
- Drzewo tematów (hierarchiczne)
- Poziomy trudności

#### ResourceCard
Karta pojedynczego zasobu dostępna w trzech wariantach (Hero, List, Default), wyświetlająca:
- Tytuł i opis
- Przedmiot
- Tematy (max 3 widoczne)
- Poziomy trudności
- Oceny (średnia użyteczności i poprawności)
- Link do zasobu

## 🤝 Wkład w projekt

Projekt jest otwarty na współpracę! Jeśli chcesz dodać nową funkcjonalność lub naprawić błąd:

1. Fork repozytorium
2. Utwórz branch dla swojej funkcjonalności (`git checkout -b feature/AmazingFeature`)
3. Commit zmian (`git commit -m 'Add some AmazingFeature'`)
4. Push do brancha (`git push origin feature/AmazingFeature`)
5. Otwórz Pull Request

## 📝 Licencja

Ten projekt jest prywatny. Wszelkie prawa zastrzeżone.

## 👥 Autorzy

- Sylwester Zieliński

## 🐛 Zgłaszanie błędów

Jeśli znajdziesz błąd, otwórz Issue na GitHubie z:
- Opisem problemu
- Krokami do reprodukcji
- Oczekiwanym zachowaniem
- Screenshotami (jeśli dotyczy)

## 📞 Kontakt

W razie pytań skontaktuj się przez Issues na GitHubie.

---

**Wersja:** 1.0.0  
**Ostatnia aktualizacja:** 2025-11-25
