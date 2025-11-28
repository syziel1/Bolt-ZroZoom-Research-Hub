export const TRUSTED_DOMAINS = [
    'wikipedia.org',
    'geogebra.org',
    'khanacademy.org',
    'youtube.com',
    'youtu.be',
    'gemini.google.com',
    'openai.com',
    'microsoft.com',
    'google.com',
    'gov.pl',
    'cke.gov.pl'
];

export function isTrustedDomain(url: string): boolean {
    try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname.toLowerCase();

        return TRUSTED_DOMAINS.some(domain =>
            hostname === domain || hostname.endsWith('.' + domain)
        );
    } catch {
        return false;
    }
}
