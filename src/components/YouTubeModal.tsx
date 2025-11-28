import { X } from 'lucide-react';
import { getYouTubeEmbedUrl } from '../lib/youtube';

type YouTubeModalProps = {
    videoId: string;
    isOpen: boolean;
    onClose: () => void;
};

export function YouTubeModal({ videoId, isOpen, onClose }: YouTubeModalProps) {
    if (!isOpen) return null;
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={handleBackdropClick}
        >
            <div className="relative w-full max-w-5xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 bg-white/90 dark:bg-slate-900/90 rounded-full hover:bg-white dark:hover:bg-slate-800 transition-colors shadow-lg"
                    title="Zamknij"
                >
                    <X size={24} className="text-gray-700 dark:text-gray-300" />
                </button>

                {/* Video container with 16:9 aspect ratio */}
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                        className="absolute top-0 left-0 w-full h-full"
                        src={getYouTubeEmbedUrl(videoId)}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                    />
                </div>
            </div>
        </div>
    );
}
