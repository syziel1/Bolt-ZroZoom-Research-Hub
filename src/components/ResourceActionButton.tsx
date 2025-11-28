import { Play, ExternalLink, BookOpen, Sparkles, Calculator } from 'lucide-react';
import { detectPlatform, getPlatformInfo } from '../lib/platforms';
import { extractYouTubeVideoId } from '../lib/youtube';

type ResourceActionButtonProps = {
    url: string;
    variant?: 'default' | 'large';
    onYouTubePlay?: (videoId: string) => void;
};

const platformIcons = {
    youtube: Play,
    wikipedia: BookOpen,
    gemini: Sparkles,
    geogebra: Calculator,
    other: ExternalLink,
};

export function ResourceActionButton({ url, variant = 'default', onYouTubePlay }: ResourceActionButtonProps) {
    const platform = detectPlatform(url);
    const platformInfo = getPlatformInfo(platform);
    const Icon = platformIcons[platform];

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();

        if (platform === 'youtube' && onYouTubePlay) {
            const videoId = extractYouTubeVideoId(url);
            if (videoId) {
                onYouTubePlay(videoId);
                return;
            }
        }

        // For non-YouTube or if YouTube modal handler not provided, open in new tab
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const sizeClasses = variant === 'large'
        ? 'px-4 py-2 text-base'
        : 'px-3 py-1.5 text-sm';

    const iconSize = variant === 'large' ? 18 : 16;

    return (
        <button
            onClick={handleClick}
            className={`flex items-center gap-2 ${platformInfo.color} text-white rounded-lg ${platformInfo.hoverColor} transition-colors font-medium ${sizeClasses}`}
        >
            <Icon size={iconSize} className={platform === 'youtube' ? 'fill-current' : ''} />
            {platformInfo.label}
            {platform !== 'youtube' && <ExternalLink size={14} />}
        </button>
    );
}
