// List of profane words to block
// This is a basic list and should be expanded as needed
const PROFANITY_LIST = [
    'kurwa',
    'chuj',
    'pierdol',
    'jebać',
    'jebac',
    'cipa',
    'kutas',
    'fiut',
    'skurwysyn',
    'suka',
    'dziwka',
    'szmata',
    'pizda',
    'zajeb',
    'wypierdalaj',
    'spierdalaj',
    'idiota',
    'debil',
    'kretyn',
    'pedał',
    'ciota'
];

export function containsProfanity(text: string): boolean {
    if (!text) return false;

    return PROFANITY_LIST.some(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        return regex.test(text);
    });
}

export function filterProfanity(text: string): string {
    if (!text) return text;

    let filteredText = text;

    PROFANITY_LIST.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        filteredText = filteredText.replace(regex, '*'.repeat(word.length));
    });

    return filteredText;
}
