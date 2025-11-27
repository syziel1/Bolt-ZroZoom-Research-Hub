// verify-gemini.js
// Uruchom ten skrypt, aby przetestować swój klucz API Gemini.
// Użycie: 
// 1. Otwórz terminal
// 2. Ustaw zmienną środowiskową (Windows PowerShell): $env:GEMINI_API_KEY="twoj-klucz"
// 3. Uruchom: node verify-gemini.js

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error('❌ BŁĄD: Brak klucza API. Ustaw zmienną środowiskową GEMINI_API_KEY.');
    console.log('Przykład (PowerShell): $env:GEMINI_API_KEY="AIzaSy..."');
    process.exit(1);
}

const prompt = `
  Jesteś asystentem edukacyjnym. Przeanalizuj to: "Kurs Pythona dla początkujących".
  Zwróć TYLKO JSON: {"subject": "Informatyka", "topics": ["Python", "Programowanie"], "level": "Podstawowy", "language": "pl"}
`;

console.log('🔄 Wysyłanie zapytania do Gemini API...');

async function testGemini() {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Błąd API (Status ${response.status}): ${errorText}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        console.log('✅ SUKCES! Gemini odpowiedziało:');
        console.log('---------------------------------------------------');
        console.log(text);
        console.log('---------------------------------------------------');
        console.log('Twój klucz działa poprawnie. Możesz go teraz dodać do Supabase.');

    } catch (error) {
        console.error('❌ BŁĄD:', error.message);
    }
}

testGemini();
