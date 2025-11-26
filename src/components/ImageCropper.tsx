import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X, Check, RotateCw } from 'lucide-react';

type Area = {
    x: number;
    y: number;
    width: number;
    height: number;
};

type ImageCropperProps = {
    imageSrc: string;
    onCropComplete: (croppedImageBlob: Blob) => void;
    onCancel: () => void;
    aspectRatio?: number;
};

// Helper function to create a cropped image
async function getCroppedImg(imageSrc: string, pixelCrop: Area, rotation = 0): Promise<Blob> {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('No 2d context');
    }

    const maxSize = Math.max(image.width, image.height);
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

    canvas.width = safeArea;
    canvas.height = safeArea;

    ctx.translate(safeArea / 2, safeArea / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-safeArea / 2, -safeArea / 2);

    ctx.drawImage(
        image,
        safeArea / 2 - image.width * 0.5,
        safeArea / 2 - image.height * 0.5
    );

    const data = ctx.getImageData(0, 0, safeArea, safeArea);

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.putImageData(
        data,
        0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x,
        0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y
    );

    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob) {
                resolve(blob);
            } else {
                reject(new Error('Canvas is empty'));
            }
        }, 'image/webp', 0.9);
    });
}

function createImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = 'anonymous'; // Allow CORS for images from external sources
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.src = url;
    });
}

export function ImageCropper({ imageSrc, onCropComplete, onCancel, aspectRatio = 16 / 9 }: ImageCropperProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

    const onCropChange = (location: { x: number; y: number }) => {
        setCrop(location);
    };

    const onCropAreaChange = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleCropComplete = async () => {
        if (!croppedAreaPixels) return;

        try {
            const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
            onCropComplete(croppedBlob);
        } catch (e) {
            console.error('Error cropping image:', e);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col z-50">
            <div className="flex items-center justify-between p-4 bg-gray-900 text-white">
                <h3 className="text-lg font-semibold">Wykadruj obraz</h3>
                <div className="flex items-center gap-4">
                    <button
                        onClick={onCancel}
                        className="p-2 hover:bg-gray-800 rounded-md transition-colors"
                        title="Anuluj"
                    >
                        <X size={24} />
                    </button>
                </div>
            </div>

            <div className="flex-1 relative">
                <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    rotation={rotation}
                    aspect={aspectRatio}
                    onCropChange={onCropChange}
                    onCropComplete={onCropAreaChange}
                    onZoomChange={setZoom}
                    onRotationChange={setRotation}
                />
            </div>

            <div className="bg-gray-900 text-white p-4 space-y-4">
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Powiększenie</label>
                        <span className="text-sm text-gray-400">{Math.round(zoom * 100)}%</span>
                    </div>
                    <input
                        type="range"
                        min={1}
                        max={3}
                        step={0.1}
                        value={zoom}
                        onChange={(e) => setZoom(Number(e.target.value))}
                        className="w-full accent-blue-500"
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium flex items-center gap-2">
                            <RotateCw size={16} />
                            Obrót
                        </label>
                        <span className="text-sm text-gray-400">{rotation}°</span>
                    </div>
                    <input
                        type="range"
                        min={0}
                        max={360}
                        step={1}
                        value={rotation}
                        onChange={(e) => setRotation(Number(e.target.value))}
                        className="w-full accent-blue-500"
                    />
                </div>

                <div className="flex gap-3 pt-2">
                    <button
                        onClick={handleCropComplete}
                        className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                        <Check size={20} />
                        Zatwierdź kadrowanie
                    </button>
                    <button
                        onClick={onCancel}
                        className="px-6 py-3 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-800 transition-colors font-medium"
                    >
                        Anuluj
                    </button>
                </div>
            </div>
        </div>
    );
}
