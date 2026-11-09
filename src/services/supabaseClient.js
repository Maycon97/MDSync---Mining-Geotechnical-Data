import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = 
  (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_SUPABASE_URL || import.meta.env?.NEXT_PUBLIC_SUPABASE_URL)) ||
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_URL) ||
  'https://oihcykhsbrbrvkhgikge.supabase.co';

const supabaseKey = 
  (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env?.VITE_SUPABASE_ANON_KEY || import.meta.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)) ||
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ||
  'sb_publishable_Bbuzk5yx1oOWOYPpF952wQ_8ONaMhvH';

export const createClient = () => createSupabaseClient(supabaseUrl, supabaseKey);

export const supabase = createSupabaseClient(supabaseUrl, supabaseKey);
