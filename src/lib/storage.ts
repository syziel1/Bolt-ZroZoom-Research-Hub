import { supabase, SUPABASE_URL } from './supabase';
import { logger } from './logger';

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
  logger.log('[uploadResourceThumbnail] Starting upload', { resourceId, fileName: file.name });

  const validationError = validateThumbnailFile(file);
  if (validationError) {
    logger.error('[uploadResourceThumbnail] Validation failed:', validationError);
    throw new Error(validationError);
  }

  const ext = getExtensionFromType(file.type);
  const path = `${THUMBNAIL_FOLDER}/${resourceId}.${ext}`;
  logger.log('[uploadResourceThumbnail] Upload path:', path);

  try {
    const { error: uploadError } = await supabase.storage
      .from(THUMBNAIL_BUCKET)
      .upload(path, file, { upsert: true });

    if (uploadError) {
      logger.error('[uploadResourceThumbnail] Storage upload error:', uploadError);
      throw new Error(`Upload failed: ${uploadError.message}`);
    }
    logger.log('[uploadResourceThumbnail] File uploaded successfully');

    const { error: updateError } = await supabase
      .from('resources')
      .update({ thumbnail_path: path })
      .eq('id', resourceId);

    if (updateError) {
      logger.error('[uploadResourceThumbnail] Database update error:', updateError);
      throw new Error(`Database update failed: ${updateError.message}`);
    }
    logger.log('[uploadResourceThumbnail] Database updated successfully');

    const publicUrl = getThumbnailUrl(path) as string;
    logger.log('[uploadResourceThumbnail] Complete. Public URL:', publicUrl);

    return {
      path,
      publicUrl,
    };
  } catch (error) {
    logger.error('[uploadResourceThumbnail] Unexpected error:', error);
    throw error;
  }
};
