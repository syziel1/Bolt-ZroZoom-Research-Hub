/**
 * Generates a URL-friendly slug from a name.
 * Converts Polish characters to ASCII equivalents and replaces
 * non-alphanumeric characters with hyphens.
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
