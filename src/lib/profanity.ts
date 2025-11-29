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

// Escape special regex characters in profanity words
function escapeRegex(word: string): string {
    return word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Create a single regex pattern with word boundaries for all profanity words
const PROFANITY_REGEX = new RegExp(
    `\\b(${PROFANITY_LIST.map(escapeRegex).join('|')})\\b`,
    'gi'
);

export function containsProfanity(text: string): boolean {
    if (!text) return false;

    // Reset lastIndex to ensure consistent matching
    PROFANITY_REGEX.lastIndex = 0;
    return PROFANITY_REGEX.test(text);
}

export function filterProfanity(text: string): string {
    if (!text) return text;

    // Reset lastIndex to ensure consistent matching
    PROFANITY_REGEX.lastIndex = 0;
    return text.replace(PROFANITY_REGEX, (match) => '*'.repeat(match.length));
}
