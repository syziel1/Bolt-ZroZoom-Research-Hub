/*
  # Create user_favorites table
  
  1. New Table
    - `user_favorites` - stores user's favorite resources
      - `id` (uuid, PK)
      - `user_id` (uuid, FK → profiles.id)
      - `resource_id` (uuid, FK → resources.id)
      - `created_at` (timestamp)
      
  2. Security
    - Enable RLS
    - Users can only see/manage their own favorites
    
  3. Performance
    - Index on user_id for fast lookups
    - Unique constraint on (user_id, resource_id) to prevent duplicates
*/

-- Create the user_favorites table
CREATE TABLE user_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  resource_id uuid NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  
  -- Unique constraint: each user can favorite each resource only once
  CONSTRAINT unique_user_resource UNIQUE (user_id, resource_id)
);

-- Enable Row Level Security
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- SELECT: Users can only see their own favorites
CREATE POLICY "Users can view their own favorites"
  ON user_favorites
  FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

-- INSERT: Users can only add their own favorites
CREATE POLICY "Users can add their own favorites"
  ON user_favorites
  FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- DELETE: Users can only delete their own favorites
CREATE POLICY "Users can delete their own favorites"
  ON user_favorites
  FOR DELETE
  USING ((SELECT auth.uid()) = user_id);

-- Indexes for performance
CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_resource_id ON user_favorites(resource_id);
CREATE INDEX idx_user_favorites_user_created ON user_favorites(user_id, created_at DESC);
