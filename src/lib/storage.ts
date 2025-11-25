import { supabase, supabaseUrl } from './supabase';

export const THUMBNAIL_BUCKET = 'resource-thumbnails';
export const THUMBNAIL_FOLDER = 'public';
export const ACCEPTED_THUMBNAIL_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
export const MAX_THUMBNAIL_SIZE = 2 * 1024 * 1024; // 2MB

export type ThumbnailUploadResult = {
  path: string;
  extension: 'png' | 'webp';
};

export const getThumbnailExtension = (file: File): 'png' | 'webp' =>
  file.type === 'image/png' ? 'png' : 'webp';

export const validateThumbnailFile = (file: File): string | null => {
  if (!ACCEPTED_THUMBNAIL_TYPES.includes(file.type)) {
    return 'Nieobsługiwany format. Dozwolone: PNG, JPEG lub WEBP.';
  }

  if (file.size > MAX_THUMBNAIL_SIZE) {
    return 'Plik jest za duży. Maksymalny rozmiar to 2MB.';
  }

  return null;
};

export const uploadThumbnail = async (resourceId: string, file: File): Promise<ThumbnailUploadResult> => {
  const extension = getThumbnailExtension(file);
  const path = `${THUMBNAIL_FOLDER}/${resourceId}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(THUMBNAIL_BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) {
    throw new Error(uploadError.message || 'Nie udało się przesłać miniatury');
  }

  const { error: updateError } = await supabase
    .from('resources')
    .update({ thumbnail_path: path })
    .eq('id', resourceId);

  if (updateError) {
    throw new Error(updateError.message || 'Nie udało się zaktualizować miniatury');
  }

  return { path, extension };
};

export const getThumbnailPublicUrl = (thumbnailPath?: string | null): string | null => {
  if (!thumbnailPath) return null;
  return `${supabaseUrl}/storage/v1/object/public/${THUMBNAIL_BUCKET}/${thumbnailPath}`;
};
