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

    const lowerText = text.toLowerCase();
    return PROFANITY_LIST.some(word => lowerText.includes(word));
}

export function filterProfanity(text: string): string {
    if (!text) return text;

    let filteredText = text;
    const lowerText = text.toLowerCase();

    PROFANITY_LIST.forEach(word => {
        if (lowerText.includes(word)) {
            const regex = new RegExp(word, 'gi');
            filteredText = filteredText.replace(regex, '*'.repeat(word.length));
        }
    });

    return filteredText;
}
