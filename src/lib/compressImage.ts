// src/lib/compressImage.ts

/**
 * Compress an image file using Canvas.
 * Returns a new File object with reduced size.
 * If the original file is already below maxSize, it is returned unchanged.
 */
export async function compressImage(
    file: File,
    maxSizeBytes: number = 2 * 1024 * 1024, // default 2 MB
    mimeType: string = 'image/jpeg',
    quality: number = 0.8
): Promise<File> {
    // If file already small enough, no compression needed
    if (file.size <= maxSizeBytes) return file;

    // Load image into bitmap
    const bitmap = await createImageBitmap(file);

    // Determine target dimensions while preserving aspect ratio
    const maxDimension = 1024; // max width/height
    let { width, height } = bitmap;
    if (width > height) {
        if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
        }
    } else {
        if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
        }
    }

    // Draw to canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context not available');
    ctx.drawImage(bitmap, 0, 0, width, height);

    // Convert canvas to Blob
    const blob: Blob = await new Promise((resolve, reject) => {
        canvas.toBlob(
            (b) => {
                if (b) resolve(b);
                else reject(new Error('Canvas toBlob failed'));
            },
            mimeType,
            quality
        );
    });

    // Create new File preserving original name
    const compressedFile = new File([blob], file.name, {
        type: mimeType,
        lastModified: Date.now(),
    });

    // If still too large, recursively compress with lower quality
    if (compressedFile.size > maxSizeBytes && quality > 0.4) {
        return compressImage(compressedFile, maxSizeBytes, mimeType, quality - 0.1);
    }

    return compressedFile;
}
