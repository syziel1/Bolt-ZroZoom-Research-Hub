// Setup:
// 1. Pobierz klucz API z Google Cloud Console (YouTube Data API v3)
// 2. Ustaw zmienną środowiskową w Supabase: YOUTUBE_API_KEY
// 3. Deploy: supabase functions deploy search-youtube --no-verify-jwt

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper to parse ISO 8601 duration (PT1H2M10S) to HH:MM:SS or MM:SS
function parseDuration(duration: string): string {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return '00:00';

  const hours = (match[1] || '').replace('H', '');
  const minutes = (match[2] || '').replace('M', '');
  const seconds = (match[3] || '').replace('S', '');

  const h = parseInt(hours || '0');
  const m = parseInt(minutes || '0');
  const s = parseInt(seconds || '0');

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  } else {
    return `${m}:${s.toString().padStart(2, '0')}`;
  }
}

serve(async (req) => {
  // 1. Obsługa CORS (dla zapytań z przeglądarki)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 2. Pobranie zapytania od użytkownika
    const { query } = await req.json()
    const apiKey = Deno.env.get('YOUTUBE_API_KEY')

    if (!query) {
      throw new Error('Brak frazy wyszukiwania')
    }
    if (!apiKey) {
      throw new Error('Konfiguracja serwera: Brak klucza API')
    }

    // 3. Zapytanie do YouTube Data API
    // A. Search -> list of IDs
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=10&q=${encodeURIComponent(query)}&key=${apiKey}`
    const searchResponse = await fetch(searchUrl)
    const searchData = await searchResponse.json()

    if (!searchResponse.ok) {
      throw new Error(`YouTube Search API Error: ${searchData.error?.message || 'Unknown error'}`)
    }

    if (!searchData.items || searchData.items.length === 0) {
      return new Response(JSON.stringify({ results: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');

    // B. Videos details (for duration)
    const videosUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoIds}&key=${apiKey}`
    const videosResponse = await fetch(videosUrl)
    const videosData = await videosResponse.json()

    if (!videosResponse.ok) {
      throw new Error(`YouTube Videos API Error: ${videosData.error?.message || 'Unknown error'}`)
    }

    // 4. Mapowanie wyników na format naszej aplikacji
    const results = videosData.items.map((item: any) => {
      const duration = parseDuration(item.contentDetails.duration);
      return {
        youtubeId: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
        channelTitle: item.snippet.channelTitle,
        duration: duration,
        url: `https://www.youtube.com/watch?v=${item.id}`
      };
    })

    // 5. Zwrot danych do Frontendu
    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})