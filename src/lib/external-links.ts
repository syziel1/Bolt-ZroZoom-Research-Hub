import { logger } from './logger';

export const TRUSTED_DOMAINS = [
    'cke.gov.pl',
    'commons.wikimedia.org',
    'creativecommons.org',
    'en.wikipedia.org',
    'gemini.google.com',
    'geogebra.org',
    'google.com',
    'gov.pl',
    'khanacademy.org',
    'microsoft.com',
    'openai.com',
    'pl.wikipedia.org',
    'wikipedia.org',
    'youtu.be',
    'youtube.com'
];

export function isTrustedDomain(url: string): boolean {
    try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname.toLowerCase();

        return TRUSTED_DOMAINS.some(domain =>
            hostname === domain || hostname.endsWith('.' + domain)
        );
    } catch {
        // Log for debugging - only log a sanitized version to avoid exposing sensitive URL parameters
        logger.warn('isTrustedDomain: Invalid URL format provided');
        return false;
    }
}
