/*
  # Add thumbnail_url column to resources table

  1. Changes
    - Add thumbnail_url column to resources table
    - Column type: text (to store external URLs like YouTube thumbnails)
    - Column is nullable (resources may not have external thumbnail URLs)
  
  2. Notes
    - This column stores external thumbnail URLs (e.g., from YouTube)
    - Different from thumbnail_path which stores uploaded file paths in storage
    - Both columns can coexist - use thumbnail_url for external URLs, thumbnail_path for uploads
*/

ALTER TABLE resources
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

COMMENT ON COLUMN resources.thumbnail_url IS 'External thumbnail URL (e.g., from YouTube or other sources)';
