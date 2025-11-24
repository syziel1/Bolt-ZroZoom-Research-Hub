import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Resource = {
  id: string;
  title: string;
  url: string;
  type: string;
  description: string;
  subject_name: string;
  subject_slug: string;
  contributor_nick: string;
  avg_rating: number;
  topic_names: string[];
  level_names: string[];
};

export type Subject = {
  id: string;
  name: string;
  slug: string;
};

export type Topic = {
  id: string;
  subject_id: string;
  name: string;
  slug: string;
};

export type Level = {
  id: string;
  name: string;
  slug: string;
};
