/**
 * Generates a URL-friendly slug from a given name string.
 * Handles Polish diacritical characters and converts them to ASCII equivalents.
 * @param name - The input string to convert to a slug
 * @returns A lowercase, hyphenated string suitable for use in URLs
 */
export function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/ą/g, 'a')
        .replace(/ć/g, 'c')
        .replace(/ę/g, 'e')
        .replace(/ł/g, 'l')
        .replace(/ń/g, 'n')
        .replace(/ó/g, 'o')
        .replace(/ś/g, 's')
        .replace(/ź|ż/g, 'z')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}
