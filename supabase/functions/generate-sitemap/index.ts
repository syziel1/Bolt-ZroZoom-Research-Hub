import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? ''
        )

        const baseUrl = 'https://szkolaprzyszlosciai.pl'
        const staticRoutes = [
            '',
            '/auth',
            '/zasoby',
            '/pomoc',
            '/o-nas',
            '/polityka-prywatnosci'
        ]

        // 1. Pobierz przedmioty
        interface Subject {
            slug: string;
        }
        const { data: subjects, error: subjectsError } = await supabaseClient
            .from('subjects')
            .select('slug')
            .order('order_index')

        if (subjectsError) throw subjectsError

        // 2. Pobierz tematy (z relacją do przedmiotów)
        interface Topic {
            slug: string;
            subject: { slug: string } | null;
        }
        const { data: topics, error: topicsError } = await supabaseClient
            .from('topics')
            .select('slug, subject:subjects(slug)')
            .order('order_index')

        if (topicsError) throw topicsError

        // 3. Generuj XML
        let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`

        // Static routes
        staticRoutes.forEach(route => {
            sitemap += `
  <url>
    <loc>${baseUrl}${route}</loc>
    <changefreq>weekly</changefreq>
    <priority>${route === '' ? '1.0' : '0.8'}</priority>
  </url>`
        })

        // Subject routes
        subjects?.forEach((subject: Subject) => {
            sitemap += `
  <url>
    <loc>${baseUrl}/zasoby/${subject.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`
        })

        // Topic routes
        topics?.forEach((topic: Topic) => {
            if (topic.subject?.slug) {
                sitemap += `
  <url>
    <loc>${baseUrl}/zasoby/${topic.subject.slug}/${topic.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
            }
        })

        sitemap += `
</urlset>`

        return new Response(sitemap, {
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/xml',
                'Cache-Control': 'public, max-age=3600' // Cache na 1h
            },
        })

    } catch (error: unknown) {
        console.error(error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return new Response(JSON.stringify({ error: errorMessage }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        })
    }
})
