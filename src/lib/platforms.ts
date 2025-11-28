/**
 * Platform detection utilities for resource URLs
 */

export type Platform = 'youtube' | 'wikipedia' | 'gemini' | 'geogebra' | 'other';

export interface PlatformInfo {
    platform: Platform;
    label: string;
    color: string;
    hoverColor: string;
}

/**
 * Check if URL is YouTube
 */
export function isYouTubeUrl(url: string): boolean {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname.includes('youtube.com') || urlObj.hostname === 'youtu.be';
    } catch {
        return false;
    }
}

/**
 * Check if URL is Wikipedia
 */
export function isWikipediaUrl(url: string): boolean {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname.includes('wikipedia.org');
    } catch {
        return false;
    }
}

/**
 * Check if URL is Google Gemini
 */
export function isGeminiUrl(url: string): boolean {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname.includes('gemini.google.com') ||
            urlObj.hostname.includes('aistudio.google.com');
    } catch {
        return false;
    }
}

/**
 * Check if URL is GeoGebra
 */
export function isGeoGebraUrl(url: string): boolean {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname.includes('geogebra.org');
    } catch {
        return false;
    }
}

/**
 * Detect platform from URL
 */
export function detectPlatform(url: string): Platform {
    if (isYouTubeUrl(url)) return 'youtube';
    if (isWikipediaUrl(url)) return 'wikipedia';
    if (isGeminiUrl(url)) return 'gemini';
    if (isGeoGebraUrl(url)) return 'geogebra';
    return 'other';
}

/**
 * Get platform information (styling, labels)
 */
export function getPlatformInfo(platform: Platform): PlatformInfo {
    const platformMap: Record<Platform, PlatformInfo> = {
        youtube: {
            platform: 'youtube',
            label: 'Odtwórz',
            color: 'bg-red-600',
            hoverColor: 'hover:bg-red-700',
        },
        wikipedia: {
            platform: 'wikipedia',
            label: 'Czytaj',
            color: 'bg-gray-700',
            hoverColor: 'hover:bg-gray-800',
        },
        gemini: {
            platform: 'gemini',
            label: 'Otwórz AI',
            color: 'bg-purple-600',
            hoverColor: 'hover:bg-purple-700',
        },
        geogebra: {
            platform: 'geogebra',
            label: 'Uruchom',
            color: 'bg-blue-700',
            hoverColor: 'hover:bg-blue-800',
        },
        other: {
            platform: 'other',
            label: 'Otwórz',
            color: 'bg-blue-600',
            hoverColor: 'hover:bg-blue-700',
        },
    };

    return platformMap[platform];
}
