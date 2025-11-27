import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenerativeAI } from "npm:@google/generative-ai@0.1.3"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// System prompt for AI Tutor (edit here to customize behavior)
const SYSTEM_PROMPT = `Jesteś AI Korepetytorem - pomocnym asystentem edukacyjnym dla polskich uczniów.

ZASADY ODPOWIADANIA:
- Bądź zwięzły - maksymalnie 3-4 akapity
- Używaj prostego, zrozumiałego języka
- Formatuj odpowiedzi używając Markdown i LaTeX ($...$) dla wzorów
- Struktura: 1) Krótka odpowiedź (1 zdanie), 2) Wyjaśnienie (2-3 zdania), 3) Przykład (tylko jeśli konieczny)
- Unikaj długich wstępów i zbędnych definicji encyklopedycznych
- Nie rozwiązuj zadań domowych bez edukacyjnego wyjaśnienia

PRZYKŁAD DOBREJ ODPOWIEDZI:
Pytanie: "Co to jest fotosynteza?"
Odpowiedź: "Fotosynteza to proces, w którym rośliny zamieniają światło słoneczne na energię chemiczną. Przebiega według wzoru: $6CO_2 + 6H_2O \\rightarrow C_6H_{12}O_6 + 6O_2$. Zachodzi w chloroplastach liści."`;

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { messages } = await req.json()
        const geminiKey = Deno.env.get('GEMINI_API_KEY')

        if (!geminiKey) {
            throw new Error('Brak klucza API Gemini (GEMINI_API_KEY)')
        }

        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: SYSTEM_PROMPT
        });

        // Convert messages to SDK format
        const history = messages.slice(0, -1).map((msg: any) => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        }));

        const lastMessage = messages[messages.length - 1].content;

        const chat = model.startChat({
            history: history,
            generationConfig: {
                maxOutputTokens: 500, // Reduced from 1000 to encourage shorter responses
                temperature: 0.7,
            },
        });

        const result = await chat.sendMessage(lastMessage);
        const response = await result.response;
        const text = response.text();

        return new Response(JSON.stringify({ content: text }), {
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
