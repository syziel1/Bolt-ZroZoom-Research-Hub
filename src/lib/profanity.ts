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

// Escape special regex characters in a string
function escapeRegExp(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Pre-compile regex patterns for better performance
const PROFANITY_PATTERNS = PROFANITY_LIST.map(word => ({
    regex: new RegExp(`\\b${escapeRegExp(word)}\\b`, 'gi'),
    replacement: '*'.repeat(word.length)
}));

export function containsProfanity(text: string): boolean {
    if (!text) return false;

    return PROFANITY_PATTERNS.some(({ regex }) => {
        regex.lastIndex = 0; // Reset lastIndex for stateful regex
        return regex.test(text);
    });
}

export function filterProfanity(text: string): string {
    if (!text) return text;

    let filteredText = text;

    PROFANITY_PATTERNS.forEach(({ regex, replacement }) => {
        filteredText = filteredText.replace(regex, replacement);
    });

    return filteredText;
}
