export type Resource = {
  id: string;
  title: string;
  url: string;
  type: string;
  description: string;
  subject_id: string;
  contributor_id?: string;
  language?: string;
  ai_generated?: boolean;
  thumbnail_url?: string;
  created_at: string;
  subject_name?: string;
  topic_names?: string[];
  level_names?: string[];
  subject_slug?: string;
  contributor_nick?: string;
  avg_usefulness?: number | null;
  avg_correctness?: number | null;
  avg_difficulty?: number | null;
  ratings_count?: number; // Note: v_resources_full view returns 'rating_count' - ensure consistency when fetching
  comments_count?: number;
  thumbnail_path?: string | null;
};
