import { createClient } from "@supabase/supabase-js";

export type VanCliburnStoryEntry = {
  id: string;
  title: string;
  chapter_label: string | null;
  entry_date: string | null;
  category: string | null;
  excerpt: string | null;
  body: string | null;
  image_url: string | null;
  is_published: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;
