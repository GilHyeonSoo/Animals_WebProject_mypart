import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Facility {
  id: string;
  name: string;
  category: string;
  address: string;
  district: string;
  latitude: number;
  longitude: number;
  phone?: string;
  description?: string;
  opening_hours?: string;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  facility_id: string;
  rating: number;
  review_text: string;
  reviewer_nickname: string;
  created_at: string;
}

export interface District {
  id: string;
  name: string;
  description?: string;
  popular_services?: string;
  created_at: string;
}
