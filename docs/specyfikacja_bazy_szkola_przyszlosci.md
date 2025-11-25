# Specyfikacja bazy danych Szkoła Przyszłości

## 1. Cel bazy danych

Celem bazy danych jest gromadzenie, katalogowanie i ocenianie materiałów edukacyjnych (własnych oraz zewnętrznych linków), z możliwością filtrowania po przedmiocie, dziale, poziomie, typie materiału oraz późniejszego rozbudowania o społecznościowy ranking współpracowników.

---

## 2. Główne założenia projektowe

- Baza w PostgreSQL (Supabase), nastawiona na:
  - łatwe filtrowanie i wyszukiwanie materiałów,
  - późniejsze dodanie funkcji społecznościowych (oceny, komentarze, reputacja użytkowników),
  - możliwość rozszerzania schematu bez łamania istniejących danych.
- Identyfikatory główne: UUID.
- W większości tabel: `created_at`, `updated_at` dla śledzenia zmian.

---

## 3. Tabele

### 3.1. Tabela `profiles`

**Cel:** informacje o użytkownikach systemu (w tym współpracownikach i autorach materiałów).

**Pola:**

- `id` (uuid, PK) – powiązane z `auth.users` (Supabase).
- `nick` (text) – krótka nazwa wyświetlana.
- `name` (text) – pełne imię i nazwisko (opcjonalne do wyświetlania).
- `role` (text) – rola użytkownika, np. `admin`, `teacher`, `student`, `expert`, `guest`.
- `reputation_score` (numeric, default 0) – suma/punkt wyjściowy do systemu reputacji.
- `created_at` (timestamp with time zone, default now()).
- `updated_at` (timestamp with time zone).

**Uwagi projektowe:**

- Tabela może być rozszerzona o dodatkowe informacje (bio, link do LinkedIn itp.).
- RLS: domyślnie użytkownik widzi swój profil oraz publiczne pola innych.

---

### 3.2. Tabela `subjects`

**Cel:** lista przedmiotów (dyscyplin), do których przypisujemy materiały.

**Pola:**

- `id` (uuid, PK).
- `name` (text) – nazwa przedmiotu, np. „Matematyka”, „Fizyka”, „AI”, „Chemia”, „Informatyka”.
- `slug` (text, unikalne) – techniczna wersja nazwy, np. `matematyka`, `fizyka`.
- `order_index` (integer) – kolejność wyświetlania w interfejsie.
- `created_at` (timestamp with time zone, default now()).
- `updated_at` (timestamp with time zone).

**Uwagi projektowe:**

- Slug ułatwia budowanie czytelnych URL-i i filtrowania.

---

### 3.3. Tabela `topics`

**Cel:** hierarchiczna struktura tematów/działów w ramach przedmiotów.

**Pola:**

- `id` (uuid, PK).
- `subject_id` (uuid, FK → `subjects.id`) – przedmiot, którego dotyczy temat.
- `name` (text) – nazwa tematu, np. „Ciągi”, „Logarytmy”, „Fale elektromagnetyczne”.
- `slug` (text) – techniczny identyfikator tematu, np. `ciagi`, `logarytmy`.
- `parent_topic_id` (uuid, FK → `topics.id`, nullable) – pozwala budować drzewo (dział → poddział).
- `order_index` (integer) – kolejność wyświetlania tematów w ramach przedmiotu.
- `created_at` (timestamp with time zone, default now()).
- `updated_at` (timestamp with time zone).

**Uwagi projektowe:**

- Możliwe jest dwa poziomy (dział/poddział) lub więcej – struktura jest elastyczna.
- Można później dodać pole `description`, jeśli potrzebne.

---

### 3.4. Tabela `levels`

**Cel:** poziomy edukacyjne (np. szkoła podstawowa, liceum – podstawa, liceum – rozszerzenie).

Na etapie MVP przyjmujemy wspólną listę poziomów dla wszystkich przedmiotów.

**Pola:**

- `id` (uuid, PK).
- `name` (text) – np. „SP 7–8”, „Liceum – podstawa”, „Matura – rozszerzenie”, „Studia I stopnia”, „Dorośli – przekwalifikowanie”.
- `slug` (text, unikalne) – np. `sp_7_8`, `liceum_podstawa`, `matura_rozszerzenie`.
- `order_index` (integer) – kolejność wyświetlania.
- `created_at` (timestamp with time zone, default now()).
- `updated_at` (timestamp with time zone).

**Uwagi projektowe:**

- Ewentualne powiązanie poziomu z konkretnym przedmiotem można wprowadzić później (np. tabela łącznikowa `level_subject`).

---

### 3.5. Tabela `resources`

**Cel:** przechowywanie informacji o materiałach edukacyjnych (linki + metadane).

**Pola (MVP):**

- `id` (uuid, PK).
- `title` (text) – tytuł materiału.
- `author` (text) – autor materiału (np. Ty, inny nauczyciel, kanał YouTube, organizacja).
- `url` (text) – link do materiału (zewnętrzny lub wewnętrzny).
- `type` (text) – typ materiału, np. `video`, `quiz`, `article`, `pdf`, `presentation`, `simulation`, `tool`.
- `subject_id` (uuid, FK → `subjects.id`) – główny przedmiot, którego dotyczy materiał.
- `contributor_id` (uuid, FK → `profiles.id`) – kto dodał materiał do bazy.
- `embedded` (boolean) – czy materiał może być osadzony (np. w iframe) w aplikacji (`true`/`false`).
- `description` (text) – krótki opis materiału.
- `language` (text) – np. `pl`, `en`.
- `ai_generated` (boolean, default false) – czy materiał został w całości lub części wygenerowany przez AI.
- `review_required` (boolean, default false) – czy materiał wymaga przeglądu przez eksperta.
- `review_status` (text, default `unreviewed`) – status weryfikacji przez eksperta: `unreviewed`, `in_review`, `approved`, `rejected`.
- `created_at` (timestamp with time zone, default now()).
- `updated_at` (timestamp with time zone).

**Uwagi projektowe:**

- Szczegółowe przypisanie do tematów i poziomów odbywa się przez tabele łącznikowe `resource_topics` i `resource_levels`.
- W przyszłości można dodać pola takie jak `duration_min` (czas trwania) lub `source_type` (`own`, `curated`).

---

### 3.6. Tabela łącznikowa `resource_topics`

**Cel:** powiązanie materiału z jednym lub wieloma tematami.

**Pola:**

- `id` (uuid, PK) – opcjonalnie, można również stosować złożony PK.
- `resource_id` (uuid, FK → `resources.id`).
- `topic_id` (uuid, FK → `topics.id`).
- `created_at` (timestamp with time zone, default now()).

**Uwagi projektowe:**

- Jeden materiał może należeć do wielu tematów (np. „Powtórka z funkcji i ciągów”).

---

### 3.7. Tabela łącznikowa `resource_levels`

**Cel:** powiązanie materiału z jednym lub wieloma poziomami edukacyjnymi.

**Pola:**

- `id` (uuid, PK) – opcjonalnie, można również stosować złożony PK.
- `resource_id` (uuid, FK → `resources.id`).
- `level_id` (uuid, FK → `levels.id`).
- `created_at` (timestamp with time zone, default now()).

**Uwagi projektowe:**

- Jeden materiał może być odpowiedni dla kilku poziomów (np. „Powtórka z procentów” – SP 7–8 + liceum podstawa).

---

### 3.8. Tabela `ratings`

**Cel:** przechowywanie ocen materiałów przez użytkowników – z rozbiciem na użyteczność, poprawność i dopasowanie do poziomu.

**Pola:**

- `id` (uuid, PK).
- `resource_id` (uuid, FK → `resources.id`).
- `author_id` (uuid, FK → `profiles.id`) – użytkownik oceniający.
- `rating_usefulness` (integer, np. 1–5) – jak bardzo materiał był użyteczny.
- `rating_correctness` (integer, np. 1–5) – ocena poprawności merytorycznej.
- `difficulty_match` (integer, np. 1–5) – dopasowanie trudności do deklarowanego poziomu (np. 1 = zdecydowanie za łatwe, 3 = w sam raz, 5 = zdecydowanie za trudne).
- `created_at` (timestamp with time zone, default now()).

**Założenia:**

- Jeden użytkownik może dodać **maksymalnie jedną ocenę na materiał** (constraint unikalności `(resource_id, author_id)`).
- Średnie oceny i statystyki mogą być przechowywane w widokach lub dodatkowych polach (np. w `resources`).

---

### 3.9. Tabela `comments`

**Cel:** przechowywanie komentarzy tekstowych do materiałów (dyskusja, uwagi, sugestie).

**Pola:**

- `id` (uuid, PK).
- `resource_id` (uuid, FK → `resources.id`).
- `author_id` (uuid, FK → `profiles.id`).
- `content` (text) – treść komentarza.
- `parent_comment_id` (uuid, FK → `comments.id`, nullable) – pozwala tworzyć odpowiedzi w wątkach.
- `created_at` (timestamp with time zone, default now()).
- `updated_at` (timestamp with time zone).

**Uwagi projektowe:**

- Tabela `comments` jest niezależna od `ratings` – ocena może mieć krótki komentarz, a dyskusja może toczyć się osobno.

---

## 4. Dalsze rozszerzenia (opcjonalne, nie w MVP)

- Tabela `user_credentials` – informacje o wykształceniu, zawodzie, certyfikatach (dla rankingu ekspertów).
- Materializowane widoki dla:
  - średnich ocen materiałów,
  - wskaźników reputacji użytkowników.
- Dodatkowe słowniki (np. typy materiałów jako osobna tabela zamiast tekstu).

---

## 5. Polityki bezpieczeństwa (RLS) i uwagi wydajnościowe

### 5.1. RLS – główne założenia

- Baza jest publicznie odczytywalna (anon SELECT) dla materiałów, tematów, poziomów i przedmiotów.
- Operacje modyfikacji wymagają zalogowania.
- Każdy użytkownik może edytować i usuwać **wyłącznie swoje** materiały, oceny i komentarze.
- Administratorzy i rola `service_role` mają pełne uprawnienia do zarządzania słownikami (`subjects`, `topics`, `levels`).

### 5.2. Polityki INSERT – zgodnie z zasadą PostgreSQL

- INSERT może używać **wyłącznie ****WITH CHECK**, bez sekcji `USING`.
- Polityki zostały zaktualizowane wg zaleceń Supabase.

### 5.3. Optymalizacja wydajności RLS

- Wszystkie wystąpienia `auth.uid()` i `auth.role()` zostały zastąpione rekomendowaną formą:
  ```sql
  (select auth.uid())
  (select auth.role())
  ```
- Dzięki temu funkcje uwierzytelniające nie są wywoływane dla każdego wiersza (rozwiązanie warningu `auth_rls_initplan`).

### 5.4. Widoki

- Wszystkie widoki (`v_resources_full`, `v_topics_tree`, `v_subjects_basic`) korzystają z `SQL SECURITY INVOKER`, co usuwa błąd lintera o niepoprawnym bezpieczeństwie.

---

## 6. Podsumowanie

Powyższy schemat zapewnia:

- solidną bazę pod katalogowanie i filtrowanie materiałów edukacyjnych,
- oddzielenie warstwy treści (resources) od struktury programu (subjects, topics, levels),
- możliwość dokładnej oceny materiałów (użyteczność, poprawność, dopasowanie trudności),
- osobne, elastyczne komentowanie,
- dobrą bazę pod przyszły system reputacji i rankingu współpracowników.

Na tej specyfikacji można oprzeć kolejne kroki: przygotowanie migracji SQL w Supabase oraz projektowanie interfejsu w bolt.new.

