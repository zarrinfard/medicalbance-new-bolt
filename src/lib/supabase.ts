import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface DoctorProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  nationality: string;
  specialties: string;
  website?: string;
  social_media?: string;
  bio?: string;
  profile_image_url?: string;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface PatientProfile {
  id: string;
  user_id: string;
  alias: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  doctor_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  uploaded_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: 'patient' | 'doctor' | 'admin';
  created_at: string;
}