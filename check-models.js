// check-models.js
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error('❌ BŁĄD: Brak klucza API. Ustaw zmienną środowiskową GEMINI_API_KEY.');
    process.exit(1);
}

console.log('🔄 Pobieranie listy dostępnych modeli...');

async function listModels() {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.models) {
            console.log('✅ Dostępne modele (wspierające generateContent):');
            console.log('---------------------------------------------------');
            const contentModels = data.models.filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent'));

            if (contentModels.length === 0) {
                console.log('Brak modeli wspierających generowanie treści.');
            }

            contentModels.forEach(m => {
                console.log(`- ${m.name.replace('models/', '')}`);
            });
            console.log('---------------------------------------------------');
            console.log('Wybierz jeden z powyższych i podaj mi jego nazwę.');
        } else {
            console.error('❌ Błąd pobierania listy:', data);
        }
    } catch (error) {
        console.error('❌ Błąd połączenia:', error.message);
    }
}

listModels();
