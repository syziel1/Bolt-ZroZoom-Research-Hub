# Instrukcja Deploymentu (Netlify)

Aplikacja jest już opublikowana na Netlify, ale celem jest uniezależnienie się od Bolt.new i podpięcie własnego repozytorium GitHub.

## 1. Frontend (Netlify)

### Krok 1: Przygotowanie Repozytorium
Upewnij się, że plik `public/_redirects` istnieje w repozytorium (został właśnie dodany). Jest on kluczowy dla działania routingu w aplikacji React (SPA).

### Krok 2: Podpięcie GitHub do Netlify
1. Zaloguj się na [app.netlify.com](https://app.netlify.com).
2. Kliknij **"Add new site"** -> **"Import an existing project"**.
3. Wybierz **GitHub**.
4. Autoryzuj Netlify i wybierz repozytorium `Bolt-ZroZoom-Research-Hub`.
5. **Build Settings** (powinny wykryć się automatycznie):
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
6. **Environment variables**:
   Kliknij "Add environment variables" i dodaj te z pliku `.env`:
   - `VITE_SUPABASE_URL`: Twój URL projektu Supabase
   - `VITE_SUPABASE_ANON_KEY`: Twój klucz anonimowy Supabase
7. Kliknij **"Deploy site"**.

### Krok 3: Konfiguracja Domeny (home.pl)
Masz już domenę `szkolaprzyszlosciai.pl` na home.pl. Aby skierować ją na Netlify:

1. W panelu Netlify wejdź w **Domain management**.
2. Kliknij **"Add a domain"** i wpisz `szkolaprzyszlosciai.pl`.
3. Netlify poprosi o weryfikację.
4. **Konfiguracja DNS na home.pl**:
   Zaloguj się do panelu home.pl i edytuj rekordy DNS dla swojej domeny.
   
   Masz dwie opcje (Netlify zaleca opcję A, ale B też działa):

   **Opcja A: Rekordy A (Dla domeny głównej)**
   Utwórz rekord A wskazujący na Load Balancer Netlify:
   - Host: `@` (lub puste)
   - Typ: `A`
   - Wartość: `75.2.60.5`

   **Opcja B: Serwery DNS (Zalecane przez Netlify)**
   Zmień delegację domeny (DNS) na serwery Netlify:
   - `dns1.p01.nsone.net`
   - `dns2.p01.nsone.net`
   - `dns3.p01.nsone.net`
   - `dns4.p01.nsone.net`
   *(Sprawdź w panelu Netlify, czy podali dokładnie te same adresy)*.

5. Po propagacji DNS (może trwać do 24h, zwykle 1h), Netlify automatycznie wygeneruje certyfikat SSL (Let's Encrypt).

## 2. Backend (Supabase)

### Auth Redirect URLs
Aby logowanie Google/Email działało na nowej domenie:
1. Wejdź w panel Supabase -> **Authentication** -> **URL Configuration**.
2. **Site URL**: Zmień na `https://szkolaprzyszlosciai.pl`
3. **Redirect URLs**: Dodaj:
   - `https://szkolaprzyszlosciai.pl/**`

## 3. Edge Functions (Bez zmian)

Funkcje backendowe (AI, Search) nadal działają na Supabase i nie wymagają przenoszenia na Netlify.
```bash
npx supabase functions deploy search-youtube --no-verify-jwt
# ... itd
```
