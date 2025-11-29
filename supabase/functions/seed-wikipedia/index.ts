import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // 1. Initialize Supabase Client
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // 2. Get Request Data (optional limit or specific topic)
        const { topicId, limit = 1 } = await req.json().catch(() => ({}))

        // 3. Get or Create Bot User
        const getOrCreateBotUser = async () => {
            const BOT_EMAIL = 'bot@szkolaprzyszlosci.ai'

            const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
            const existingUser = users?.find(u => u.email === BOT_EMAIL)

            if (existingUser) return existingUser.id

            // Create new user
            const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
                email: BOT_EMAIL,
                password: crypto.randomUUID(),
                email_confirm: true,
                user_metadata: {
                    full_name: 'AI Bot',
                    nickname: 'AI Bot',
                    avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=ProfessorBot'
                }
            })

            if (createError) throw createError
            if (!newUser.user) throw new Error('Failed to create bot user')

            // Ensure profile exists (in case trigger didn't work or doesn't exist)
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: newUser.user.id,
                    nick: 'AI Bot',
                    name: 'AI Bot',
                    role: 'user'
                }, { onConflict: 'id' })

            if (profileError) console.error('Error creating bot profile:', profileError)

            return newUser.user.id
        }

        const botUserId = await getOrCreateBotUser()

        // Ensure bot profile exists even if user already existed (migration fix)
        await supabase.from('profiles').upsert({
            id: botUserId,
            nick: 'AI Bot',
            name: 'AI Bot',
            avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=ProfessorBot'
        }, { onConflict: 'id' })

        // 4. Fetch Topic(s) to Seed
        let topicsToSeed = []
        if (topicId) {
            const { data, error } = await supabase
                .from('topics')
                .select('*')
                .eq('id', topicId)
                .single()
            if (error) throw error
            topicsToSeed = [data]
        } else {
            // Fetch random topics (or those with few resources)
            // For simplicity, let's just pick random ones for now
            const { data, error } = await supabase
                .from('topics')
                .select('*')
                .limit(limit)

            if (error) throw error
            topicsToSeed = data
        }

        const results = []

        // Helper for delay
        const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

        // 5. Process Each Topic
        for (const topic of topicsToSeed) {
            // A. Search Wikipedia
            // Reduced limit to 3 to save AI tokens/requests
            const wikiUrl = `https://pl.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(topic.name)}&gsrlimit=3&prop=pageimages|extracts&pithumbsize=640&exintro&explaintext&exsentences=5&format=json&origin=*`
            const wikiRes = await fetch(wikiUrl)
            const wikiData = await wikiRes.json()

            if (!wikiData.query || !wikiData.query.pages) {
                results.push({ topic: topic.name, status: 'no_wiki_results' })
                continue
            }

            const pages = Object.values(wikiData.query.pages) as any[]

            for (const page of pages) {
                // Check if resource already exists
                const resourceUrl = `https://pl.wikipedia.org/?curid=${page.pageid}`
                const { data: existing } = await supabase
                    .from('resources')
                    .select('id')
                    .eq('url', resourceUrl)
                    .single()

                if (existing) {
                    results.push({ topic: topic.name, title: page.title, status: 'skipped_duplicate' })
                    continue // Skip duplicates
                }

                // B. AI Filtering & Enrichment
                const geminiApiKey = Deno.env.get('GEMINI_API_KEY')

                // DEBUG LOGGING
                console.log(`[DEBUG] Processing topic: ${topic.name}, Article: ${page.title}`)
                console.log(`[DEBUG] GEMINI_API_KEY present: ${!!geminiApiKey}`)

                if (!geminiApiKey) {
                    console.error('[ERROR] Missing GEMINI_API_KEY')
                    results.push({ topic: topic.name, title: page.title, status: 'skipped_ai_error', details: 'Missing API Key' })
                    continue
                }

                const prompt = `
                    Jesteś ekspertem edukacyjnym. Oceniasz przydatność artykułu z Wikipedii dla uczniów.
                    Temat: "${topic.name}"
                    Tytuł artykułu: "${page.title}"
                    Fragment: "${page.extract}"

                    1. Czy ten artykuł jest wartościowym zasobem edukacyjnym dla tego tematu? (TAK/NIE)
                    2. Jeśli TAK, napisz krótki, zachęcający opis (max 2 zdania) po polsku.
                    3. Określ sugerowany poziom (podstawowa, liceum, studia).
                    
                    Format odpowiedzi JSON:
                    {
                        "is_valuable": boolean,
                        "description": "string",
                        "level": "string"
                    }
                `

                try {
                    // Rate limiting: Wait 4 seconds before request (increased from 2s)
                    await sleep(4000);

                    let aiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: prompt }] }],
                            generationConfig: { response_mime_type: "application/json" }
                        })
                    })

                    // Handle 429 (Too Many Requests) with one retry
                    if (aiRes.status === 429) {
                        console.warn('[WARN] Rate limit hit (429). Waiting 10 seconds and retrying...')
                        await sleep(10000); // Increased wait to 10s
                        aiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                contents: [{ parts: [{ text: prompt }] }],
                                generationConfig: { response_mime_type: "application/json" }
                            })
                        })
                    }

                    if (!aiRes.ok) {
                        const errorText = await aiRes.text()
                        console.error(`[ERROR] Gemini API failed: ${aiRes.status} ${aiRes.statusText}`, errorText)
                        results.push({ topic: topic.name, title: page.title, status: 'skipped_ai_error', details: `API Error: ${aiRes.status}` })
                        continue
                    }

                    const aiData = await aiRes.json()
                    const aiContent = aiData.candidates?.[0]?.content?.parts?.[0]?.text

                    if (!aiContent) {
                        console.error('[ERROR] No content in Gemini response', aiData)
                        results.push({ topic: topic.name, title: page.title, status: 'skipped_ai_error', details: 'No content' })
                        continue
                    }

                    let aiAnalysis
                    try {
                        aiAnalysis = JSON.parse(aiContent)
                    } catch (e) {
                        console.error('[ERROR] AI JSON Parse Error', e, aiContent)
                        results.push({ topic: topic.name, title: page.title, status: 'skipped_ai_parse_error', details: 'JSON Parse Error' })
                        continue
                    }

                    if (!aiAnalysis.is_valuable) {
                        results.push({ topic: topic.name, title: page.title, status: 'skipped_low_quality' })
                        continue
                    }

                    // C. Insert into DB
                    // 1. Insert Resource
                    const { data: resource, error: resError } = await supabase
                        .from('resources')
                        .insert({
                            title: page.title,
                            url: resourceUrl,
                            type: 'article', // or 'wikipedia' if we have that type
                            description: aiAnalysis.description || page.extract,
                            thumbnail_url: page.thumbnail?.source,
                            subject_id: topic.subject_id,
                            contributor_id: botUserId,
                            ai_generated: true,
                            review_status: 'unreviewed'
                        })
                        .select()
                        .single()

                    if (resError) {
                        console.error('[ERROR] Insert Error', resError)
                        results.push({ topic: topic.name, title: page.title, status: 'error_insert', details: resError.message })
                        continue
                    }

                    // 2. Link Topic
                    await supabase
                        .from('resource_topics')
                        .insert({
                            resource_id: resource.id,
                            topic_id: topic.id
                        })

                    results.push({ topic: topic.name, title: page.title, status: 'added' })

                    // Stop after adding 1 good resource per topic
                    break

                } catch (err) {
                    console.error('[ERROR] Unexpected error in AI loop', err)
                    results.push({ topic: topic.name, title: page.title, status: 'skipped_ai_error', details: err.message })
                    continue
                }
            }
        }

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
