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
  parent_topic_id: string | null;
  order_index: number | null;
};

export type TopicNode = Topic & {
  children: TopicNode[];
};

export type TopicRow = Topic;

export type Level = {
  id: string;
  name: string;
  slug: string;
};

export type ResourceTopic = {
  topic_id: string;
  topic_name: string;
  topic_slug: string;
  parent_topic_id: string | null;
  subject_slug: string;
};

export type ResourceLevel = {
  id: string;
  name: string;
  slug: string;
  order_index: number;
};
