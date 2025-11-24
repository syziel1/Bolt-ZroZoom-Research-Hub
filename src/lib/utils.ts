/** Mapping of Polish diacritical characters to their ASCII equivalents */
const POLISH_CHAR_MAP: Record<string, string> = {
    'ą': 'a',
    'ć': 'c',
    'ę': 'e',
    'ł': 'l',
    'ń': 'n',
    'ó': 'o',
    'ś': 's',
    'ź': 'z',
    'ż': 'z',
};

/**
 * Generates a URL-friendly slug from a string.
 * Converts Polish diacritical characters to their ASCII equivalents,
 * replaces non-alphanumeric characters with hyphens, and removes leading/trailing hyphens.
 */
export function generateSlug(name: string): string {
    if (!name) {
        return '';
    }

    const polishCharsRegex = new RegExp(Object.keys(POLISH_CHAR_MAP).join('|'), 'g');

    return name
        .toLowerCase()
        .replace(polishCharsRegex, (char) => POLISH_CHAR_MAP[char] || char)
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}
