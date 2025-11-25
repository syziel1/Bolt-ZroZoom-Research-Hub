import { supabase, SUPABASE_URL } from './supabase';

export const THUMBNAIL_BUCKET = 'resource-thumbnails';
export const THUMBNAIL_FOLDER = 'public';
export const ACCEPTED_THUMBNAIL_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
export const MAX_THUMBNAIL_SIZE = 2 * 1024 * 1024; // 2 MB

type UploadResult = {
  path: string;
  publicUrl: string;
};

const getExtensionFromType = (type: string) => {
  if (type === 'image/png') return 'png';
  return 'webp';
};

export const getThumbnailUrl = (thumbnailPath?: string | null) => {
  if (!thumbnailPath) return null;
  return `${SUPABASE_URL}/storage/v1/object/public/${THUMBNAIL_BUCKET}/${thumbnailPath}`;
};

export const validateThumbnailFile = (file: File): string | null => {
  if (!ACCEPTED_THUMBNAIL_TYPES.includes(file.type)) {
    return 'Dozwolone są tylko pliki PNG, JPEG lub WEBP.';
  }
  if (file.size > MAX_THUMBNAIL_SIZE) {
    return 'Maksymalny rozmiar pliku to 2 MB.';
  }
  return null;
};

export const uploadResourceThumbnail = async (
  resourceId: string,
  file: File,
): Promise<UploadResult> => {
  const validationError = validateThumbnailFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const ext = getExtensionFromType(file.type);
  const path = `${THUMBNAIL_FOLDER}/${resourceId}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(THUMBNAIL_BUCKET)
    .upload(path, file, { upsert: true });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { error: updateError } = await supabase
    .from('resources')
    .update({ thumbnail_path: path })
    .eq('id', resourceId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  return {
    path,
    publicUrl: getThumbnailUrl(path) as string,
  };
};
