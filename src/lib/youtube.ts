/**
 * YouTube utility functions for video ID extraction and URL validation
 */

/**
 * Extract YouTube video ID from various URL formats
 * Supports:
 * - youtube.com/watch?v=VIDEO_ID
 * - youtu.be/VIDEO_ID
 * - youtube.com/embed/VIDEO_ID
 * - youtube.com/v/VIDEO_ID
 */
export function extractYouTubeVideoId(url: string): string | null {
    try {
        const urlObj = new URL(url);

        // youtube.com/watch?v=VIDEO_ID
        if (urlObj.hostname.includes('youtube.com') && urlObj.pathname === '/watch') {
            return urlObj.searchParams.get('v');
        }

        // youtu.be/VIDEO_ID
        if (urlObj.hostname === 'youtu.be') {
            return urlObj.pathname.slice(1); // Remove leading slash
        }

        // youtube.com/embed/VIDEO_ID or youtube.com/v/VIDEO_ID
        if (urlObj.hostname.includes('youtube.com')) {
            const match = urlObj.pathname.match(/\/(embed|v)\/([^/?]+)/);
            if (match) {
                return match[2];
            }
        }

        return null;
    } catch {
        return null;
    }
}

/**
 * Check if URL is a valid YouTube video link
 */
export function isYouTubeUrl(url: string): boolean {
    return extractYouTubeVideoId(url) !== null;
}

/**
 * Get YouTube embed URL from video ID
 */
export function getYouTubeEmbedUrl(videoId: string): string {
    return `https://www.youtube.com/embed/${videoId}`;
}
