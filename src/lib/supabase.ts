import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          user_id: string;
          first_name: string | null;
          middle_name: string | null;
          last_name: string | null;
          email: string;
          phone: string | null;
          role: string;
          date_of_birth: string | null;
          registration_complete: boolean | null;
          created_at: string | null;
        };
        Insert: {
          user_id?: string;
          first_name?: string | null;
          middle_name?: string | null;
          last_name?: string | null;
          email: string;
          phone?: string | null;
          role: string;
          date_of_birth?: string | null;
          registration_complete?: boolean | null;
          created_at?: string | null;
        };
        Update: {
          user_id?: string;
          first_name?: string | null;
          middle_name?: string | null;
          last_name?: string | null;
          email?: string;
          phone?: string | null;
          role?: string;
          date_of_birth?: string | null;
          registration_complete?: boolean | null;
          created_at?: string | null;
        };
      };
      subjects: {
        Row: {
          subjects_id: number;
          subjects_name: string;
          subjects_status: string;
          subjects_short_description: string | null;
        };
      };
      grades: {
        Row: {
          grades_id: number;
          grade_no: number;
        };
      };
      subject_grade: {
        Row: {
          subject_id: number;
          grade_id: number;
        };
      };
    };
  };
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Helper types for auth
export type UserRole = 'teacher' | 'learner' | 'parent' | 'guest';

export interface UserMetadata {
  first_name?: string;
  last_name?: string;
  role?: UserRole;
}

export interface AuthError {
  message: string;
  status?: number;
}

// Helper functions for auth state
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error signing out:', error);
    return false;
  }
};