import { useEffect, useRef, useState } from 'react';
import { ImageUp, Loader2, Upload, XCircle } from 'lucide-react';
import {
  ACCEPTED_THUMBNAIL_TYPES,
  MAX_THUMBNAIL_SIZE,
  validateThumbnailFile,
} from '../lib/storage';

type ThumbnailUploaderProps = {
  onFileSelect: (file: File | null, previewUrl: string | null) => void;
  previewUrl?: string | null;
  disabled?: boolean;
  uploading?: boolean;
};

export function ThumbnailUploader({ onFileSelect, previewUrl, disabled, uploading }: ThumbnailUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(previewUrl || null);
  const [error, setError] = useState<string>('');
  const [isDragActive, setIsDragActive] = useState(false);

  useEffect(() => {
    setPreview(previewUrl || null);
  }, [previewUrl]);

  const handleFileSelection = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    const validationError = validateThumbnailFile(file);
    if (validationError) {
      setError(validationError);
      onFileSelect(null, null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setError('');
    onFileSelect(file, objectUrl);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelection(event.target.files);
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    const items = event.clipboardData.files;
    if (items && items.length > 0) {
      handleFileSelection(items);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragActive(false);
    handleFileSelection(event.dataTransfer.files);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const clearSelection = () => {
    setPreview(null);
    setError('');
    onFileSelect(null, null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <div
        onPaste={handlePaste}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative border-2 border-dashed rounded-lg p-4 transition-colors ${
          isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-200'
        } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_THUMBNAIL_TYPES.join(',')}
          className="hidden"
          onChange={handleInputChange}
          disabled={disabled}
        />

        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 text-blue-600">
            <ImageUp size={24} />
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">Dodaj miniaturę</p>
            <p className="text-sm text-gray-600">
              Obsługiwane formaty: PNG, JPEG, WEBP. Maks. rozmiar: {Math.round(MAX_THUMBNAIL_SIZE / 1024 / 1024)} MB.
            </p>
            <p className="text-xs text-gray-500">Możesz wkleić obraz ze schowka lub przeciągnąć plik.</p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50 disabled:opacity-60"
            disabled={disabled}
          >
            <Upload size={16} />
            Wybierz plik
          </button>
        </div>

        {preview && (
          <div className="mt-4 relative">
            <img
              src={preview}
              alt="Podgląd miniatury"
              className="w-full max-h-64 object-cover rounded-md border border-gray-200"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                clearSelection();
              }}
              className="absolute top-2 right-2 bg-white bg-opacity-80 rounded-full p-1 shadow hover:bg-opacity-100"
              aria-label="Usuń miniaturę"
            >
              <XCircle size={20} className="text-gray-600" />
            </button>
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center rounded-lg">
            <Loader2 className="animate-spin text-blue-600" size={28} />
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
