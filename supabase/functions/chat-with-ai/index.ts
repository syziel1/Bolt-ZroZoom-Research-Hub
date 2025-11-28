import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenerativeAI } from "npm:@google/generative-ai@0.1.3"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// System prompt - matches content from system-prompt.md
const SYSTEM_PROMPT = `# System Prompt - AI Korepetytor

## Rola
Jesteś AI Korepetytorem - pomocnym asystentem edukacyjnym dla polskich uczniów.

## Zasady odpowiadania

### Długość odpowiedzi
- **Bądź zwięzły** - odpowiadaj jak najkrócej, ale kompletnie
- Maksymalnie 3-4 akapity dla wyjaśnień
- Dla obliczeń: pokazuj tylko kluczowe kroki
- Jeśli uczeń poprosi o więcej szczegółów, wtedy rozwiń

### Styl komunikacji
- Używaj prostego, zrozumiałego języka
- Pisz po polsku
- Formatuj odpowiedzi używając Markdown:
  - **Pogrubienie** dla ważnych pojęć
  - \`kod\` dla wzorów i definicji
  - Listy punktowane dla etapów rozwiązania
  - LaTeX ($...$) dla wzorów matematycznych

### Struktura odpowiedzi
1. **Krótka odpowiedź** (1 zdanie)
2. **Wyjaśnienie** (2-3 zdania)
3. **Przykład** (tylko jeśli konieczny)

### Przykład dobrej odpowiedzi

**Pytanie:** Co to jest fotosynteza?

**Dobra odpowiedź:**
Fotosynteza to proces, w którym rośliny zamieniają światło słoneczne na energię chemiczną.

**Jak przebiega:**
- **Światło** + woda + dwutlenek węgla → glukoza + tlen
- Wzór: $6CO_2 + 6H_2O \\rightarrow C_6H_{12}O_6 + 6O_2$

Zachodzi głównie w liściach, w zielonych organellach zwanych chloroplastami.

### Czego unikać
- ❌ Długich wstępów
- ❌ Zbędnych definicji encyklopedycznych
- ❌ Powtarzania oczywistości
- ❌ Nadmiernego rozbudowania

### Interakcja
- Zachęcaj do zadawania pytań uzupełniających
- Jeśli pytanie jest niejasne, poproś o doprecyzowanie
- Nie rozwiązuj zadań domowych bez edukacyjnego wyjaśnienia`;

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { messages, userContext } = await req.json()
        const geminiKey = Deno.env.get('GEMINI_API_KEY')

        if (!geminiKey) {
            throw new Error('Brak klucza API Gemini (GEMINI_API_KEY)')
        }

        // Estimate token count (rough: 1 token ≈ 4 chars)
        const estimateTokens = (text: string) => Math.ceil(text.length / 4);

        // Limit history to ~4000 tokens to avoid overload
        const MAX_HISTORY_TOKENS = 4000;
        let totalTokens = 0;
        const limitedMessages = [];

        // Take messages from newest to oldest until we hit token limit
        for (let i = messages.length - 1; i >= 0; i--) {
            const msgTokens = estimateTokens(messages[i].content);
            // Only break if we already have at least one message
            if (totalTokens + msgTokens > MAX_HISTORY_TOKENS && limitedMessages.length > 0) {
                break;
            }
            limitedMessages.unshift(messages[i]);
            totalTokens += msgTokens;
        }

        // Ensure we always have at least the last message
        if (limitedMessages.length === 0 && messages.length > 0) {
            limitedMessages.push(messages[messages.length - 1]);
        }

        const genAI = new GoogleGenerativeAI(geminiKey);

        // Build enhanced system prompt with user context
        let enhancedPrompt = SYSTEM_PROMPT;
        if (userContext) {
            const contextParts = [];
            if (userContext.userName) contextParts.push(`Rozmawiam z: ${userContext.userName}`);
            if (userContext.language) contextParts.push(`Język: ${userContext.language}`);
            if (contextParts.length > 0) {
                enhancedPrompt += `\n\n[KONTEKST UŻYTKOWNIKA: ${contextParts.join(', ')}]`;
            }
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-pro",
            systemInstruction: enhancedPrompt
        });

        // Convert limited messages to SDK format
        const history = limitedMessages.slice(0, -1).map((msg: { role: string; content: string }) => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        }));

        const lastMessage = limitedMessages[limitedMessages.length - 1].content;

        console.log('[DEBUG] Sending to Gemini:', {
            historyLength: history.length,
            lastMessageLength: lastMessage?.length || 0,
            totalMessages: limitedMessages.length
        });

        const chat = model.startChat({
            history: history,
            generationConfig: {
                maxOutputTokens: 2048,
                temperature: 0.7,
            },
        });

        const result = await chat.sendMessage(lastMessage);
        const response = await result.response;
        const text = response.text();

        console.log('[DEBUG] Gemini API response:', {
            hasText: !!text,
            textLength: text?.length || 0
        });

        return new Response(JSON.stringify({ content: text }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

    } catch (error) {
        console.error('Chat-with-AI Error:', error)

        // Provide user-friendly error messages
        let errorMsg = 'Wystąpił nieoczekiwany błąd.';
        if (error.message?.includes('quota')) {
            errorMsg = 'Przekroczono limit API (quota). Spróbuj za chwilę.';
        } else if (error.message?.includes('API key')) {
            errorMsg = 'Błąd konfiguracji klucza API.';
        } else if (error.message) {
            errorMsg = error.message;
        }

        return new Response(JSON.stringify({ error: errorMsg }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})
