import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenerativeAI } from "npm:@google/generative-ai@0.1.3"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { title, description, url } = await req.json()
        const geminiKey = Deno.env.get('GEMINI_API_KEY')

        if (!geminiKey) {
            throw new Error('Brak klucza API Gemini (GEMINI_API_KEY)')
        }

        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
      Jesteś asystentem edukacyjnym. Przeanalizuj poniższy zasób i zasugeruj metadane.
      
      Tytuł: ${title}
      Opis: ${description}
      URL: ${url}

      Zwróć TYLKO obiekt JSON w następującym formacie (bez markdowna, bez \`\`\`json):
      {
        "subject": "Nazwa przedmiotu (np. Matematyka, Fizyka, Informatyka, Biologia, Historia, Język polski, Język angielski)",
        "topics": ["Lista", "konkretnych", "tematów", "związanych", "z", "zasobem"],
        "level": "Sugerowany poziom (np. Szkoła podstawowa, Liceum, Studia, Dla każdego)",
        "language": "Kod języka (pl, en, de, etc.)"
      }
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up potential markdown code blocks if the model ignores instructions
        const jsonStr = text.replace(/```json\n?|\n?```/g, '').trim()
        const suggestions = JSON.parse(jsonStr)

        return new Response(JSON.stringify(suggestions), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

    } catch (error) {
        console.error('Error:', error)
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})
