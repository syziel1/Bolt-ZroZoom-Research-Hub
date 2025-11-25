# Prompt for Codex Agent — Resource Thumbnails Integration

## 🎯 Cel zadania
Zaimplementować obsługę miniatur materiałów edukacyjnych w aplikacji Szkoła Przyszłości — upload, zapis ścieżki w bazie Supabase i wyświetlanie.

## 🔧 Stack
- Next.js + React
- Supabase JS client
- Bucket: `resource-thumbnails`
- Folder: `public/`
- Kolumna w `resources`: `thumbnail_path text`

## 🧩 Co ma zrobić agent Codex

### 1. Dodać komponent uploadu miniatury
- Obsługa **uploadu pliku** oraz **wklejania ze schowka** (event `onPaste`).
- Akceptowane typy plików: `image/png`, `image/jpeg`, `image/webp`.
- Maks. rozmiar: 2 MB.

### 2. Wysyłanie pliku do Supabase
- Ścieżka pliku: `public/${resourceId}.webp` lub `${resourceId}.png` (w zależności od formatu).
- Kod supersimplified:
  ```ts
  const { data, error } = await supabase.storage
    .from('resource-thumbnails')
    .upload(`public/${resourceId}.${ext}`, file, { upsert: true });
  ```
- Użyć `upsert: true`.

### 3. Aktualizacja wpisu w tabeli `resources`
- Po sukcesie uploadu wykonać Supabase update:
  ```ts
  await supabase
    .from('resources')
    .update({ thumbnail_path: `public/${resourceId}.${ext}` })
    .eq('id', resourceId);
  ```

### 4. Wyświetlanie miniatur
- W komponentach listy materiałów (`ResourceCard`, `ResourcesGrid`) dodać:
  - jeśli `thumbnail_path` jest — pobierać przez signed URL lub bezpośrednio (bucket publiczny):
    ```ts
    const imageUrl = `${supabaseUrl}/storage/v1/object/public/resource-thumbnails/${thumbnail_path}`;
    ```
  - jeśli brak — fallback placeholder.

### 5. Obsługa Drag & Drop (opcjonalnie)
Dodać wsparcie dla przeciągania obrazka na komponent.

### 6. Walidacja
- Format pliku
- Rozmiar
- Obsłużyć błędy Supabase (upload/update)

### 7. UX
- Loader w trakcie uploadu
- Toasty: success/error
- Podgląd miniatury po uploadzie

## 🗂️ Pliki do stworzenia/zmodyfikowania
1. `components/ThumbnailUploader.tsx`
2. `components/ResourceForm.tsx` — integracja z formularzem dodawania/edycji zasobu
3. `lib/storage.ts` — helpery Supabase Storage
4. `types/resource.ts` — dodać `thumbnail_path`
5. `components/ResourceCard.tsx` — wyświetlanie miniatury

## 📌 Oczekiwany rezultat
- Pełny kod frontendu obsługujący upload miniatur
- Komponent wielokrotnego użytku `ThumbnailUploader`
- Integracja z bazą i storage
- Działające wyświetlanie miniatur w gridzie materiałów

