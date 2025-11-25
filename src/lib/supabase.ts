import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const SUPABASE_URL = supabaseUrl;

export type { Resource } from '../types/resource';

export type Subject = {
  subject_id: string;
  subject_name: string;
  subject_slug: string;
  order_index: number;
  resources_count: number;
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
