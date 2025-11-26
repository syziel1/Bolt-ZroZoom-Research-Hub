import { useEffect, useRef, useState } from 'react';
import { ImageIcon, UploadCloud, XCircle, Crop } from 'lucide-react';
import {
  ACCEPTED_THUMBNAIL_TYPES,
  MAX_THUMBNAIL_SIZE,
  validateThumbnailFile,
} from '../lib/storage';
import { ImageCropper } from './ImageCropper';

type ThumbnailUploaderProps = {
  onFileSelect: (file: File | null) => void;
  previewUrl?: string | null;
  disabled?: boolean;
  uploading?: boolean;
};

export function ThumbnailUploader({ onFileSelect, previewUrl, disabled, uploading }: ThumbnailUploaderProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(previewUrl || null);
  const [showCropper, setShowCropper] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [originalFileName, setOriginalFileName] = useState<string>('');

  useEffect(() => {
    if (previewUrl !== undefined) {
      setLocalPreview(previewUrl || null);
    }
  }, [previewUrl]);

  useEffect(() => () => {
    if (localPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(localPreview);
    }
    if (imageToCrop?.startsWith('blob:')) {
      URL.revokeObjectURL(imageToCrop);
    }
  }, [localPreview, imageToCrop]);

  const handleFile = (file: File | null, skipCrop = false) => {
    if (!file) {
      setLocalPreview(null);
      setError('');
      onFileSelect(null);
      return;
    }

    const validationError = validateThumbnailFile(file);
    if (validationError) {
      setError(validationError);
      onFileSelect(null);
      return;
    }

    setError('');
    setOriginalFileName(file.name);

    if (skipCrop) {
      const preview = URL.createObjectURL(file);
      setLocalPreview(preview);
      onFileSelect(file);
    } else {
      // Open cropper
      const preview = URL.createObjectURL(file);
      setImageToCrop(preview);
      setShowCropper(true);
    }
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    // Create a new File from the cropped Blob
    const croppedFile = new File([croppedBlob], originalFileName, { type: 'image/webp' });

    // Clean up
    if (imageToCrop) {
      URL.revokeObjectURL(imageToCrop);
    }
    setImageToCrop(null);
    setShowCropper(false);

    // Set preview and notify parent
    const preview = URL.createObjectURL(croppedBlob);
    setLocalPreview(preview);
    onFileSelect(croppedFile);
  };

  const handleCropCancel = () => {
    if (imageToCrop) {
      URL.revokeObjectURL(imageToCrop);
    }
    setImageToCrop(null);
    setShowCropper(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFile(file);
  };

  const onPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    const file = e.clipboardData.files?.[0];
    handleFile(file || null);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    setIsDragActive(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file || null);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    setIsDragActive(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const removeSelection = () => {
    handleFile(null, true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const recropImage = () => {
    if (localPreview) {
      setImageToCrop(localPreview);
      setShowCropper(true);
    }
  };

  return (
    <>
      <div className="space-y-2">
        <div
          className={`relative border-2 border-dashed rounded-lg p-4 transition-colors ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
            } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
          onClick={() => !disabled && fileInputRef.current?.click()}
          onPaste={onPaste}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_THUMBNAIL_TYPES.join(',')}
            className="hidden"
            onChange={onInputChange}
            disabled={disabled}
          />
          <div className="flex items-center gap-4">
            <div className="w-64 aspect-video rounded-md bg-white border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
              {localPreview ? (
                <img src={localPreview} alt="Podgląd miniatury" className="w-full h-full object-contain" />
              ) : (
                <ImageIcon className="text-gray-400" size={48} />
              )}
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm text-gray-900 font-medium flex items-center gap-2">
                <UploadCloud size={18} className="text-blue-600" />
                Przeciągnij i upuść, wklej lub wybierz plik
              </p>
              <p className="text-xs text-gray-500">
                Obsługiwane formaty: PNG, JPEG, WEBP. Maksymalny rozmiar: {Math.round(MAX_THUMBNAIL_SIZE / 1024 / 1024)} MB.
              </p>
              <p className="text-xs text-blue-600 font-medium">
                <Crop size={12} className="inline mr-1" />
                Obraz zostanie automatycznie wykadrowany w proporcjach 16:9
              </p>
              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  disabled={disabled}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                >
                  Wybierz plik
                </button>
                {localPreview && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        recropImage();
                      }}
                      disabled={disabled}
                      className="px-3 py-1.5 text-sm border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 disabled:bg-gray-200 flex items-center gap-1"
                    >
                      <Crop size={14} />
                      Wykadruj ponownie
                    </button>
                    <button
                      type="button"
                      onClick={removeSelection}
                      disabled={disabled}
                      className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 disabled:bg-gray-200"
                    >
                      Usuń
                    </button>
                  </>
                )}
                {uploading && <span className="text-sm text-gray-500">Wysyłanie...</span>}
              </div>
            </div>
          </div>
          {disabled && <div className="absolute inset-0 bg-white/40 rounded-lg" />}
        </div>
        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-md p-2">
            <XCircle size={16} />
            <span>{error}</span>
          </div>
        )}
      </div>

      {showCropper && imageToCrop && (
        <ImageCropper
          imageSrc={imageToCrop}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspectRatio={16 / 9}
        />
      )}
    </>
  );
}
