import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { query } = await req.json()

        if (!query) {
            throw new Error('Brak frazy wyszukiwania')
        }

        // Wikipedia Action API (Polish)
        // opensearch is simpler but query+pageimages gives us thumbnails
        const wikiUrl = `https://pl.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=10&prop=pageimages|extracts&pithumbsize=320&exintro&explaintext&exsentences=3&format=json&origin=*`

        const response = await fetch(wikiUrl)
        const data = await response.json()

        if (!data.query || !data.query.pages) {
            return new Response(JSON.stringify({ results: [] }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        const pages = Object.values(data.query.pages)

        interface WikiPage {
            pageid: number;
            title: string;
            extract: string;
            thumbnail?: { source: string };
        }

        const results = (pages as WikiPage[]).map((page) => ({
            pageId: page.pageid,
            title: page.title,
            description: page.extract,
            thumbnailUrl: page.thumbnail?.source || null,
            url: `https://pl.wikipedia.org/?curid=${page.pageid}`
        }))

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
