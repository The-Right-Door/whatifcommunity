import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';
import { assignLearnerAutomaticallyIfClassroomExists } from './learnerAssignmentService';


export interface UserProfile {
  user_id: string;
  first_name: string | null;
  middle_name: string | null;
  last_name: string | null;
  email: string;
  phone: string | null;
  role: string;
  date_of_birth: string | null;
  registration_complete: boolean | null;
  subjects_majored?: string[];
  profile_image_url?: string;
  experience?: string;
  achievements?: string;
  grade_id?: number;
  education_level?: number;           // ✅ Represents grade or skill level
  stream_id?: number;                 // ✅ Selected stream
  subjects_enrolled?: number[];       // ✅ Array of selected subject IDs
  created_at: string | null;
  special_permissions?: boolean;
}

export class ProfileError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ProfileError';
  }
}

export async function fetchCurrentUserProfile(): Promise<UserProfile> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
     console.log('🔍 userProfileService: Supabase Auth Response:', { 
       userId: user?.id, 
       hasError: !!authError,
       errorMessage: authError?.message 
     });
    
    if (!user) {
      console.error('❌ userProfileService: No authenticated user found');
      throw new ProfileError('Not authenticated', 'AUTH_REQUIRED');
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', user.id)
      .single();
     
    console.log('📦 userProfileService: Profile fetch response:', { 
      hasData: !!data, 
      hasError: !!error,
      errorCode: error?.code,
      errorMessage: error?.message,
      profile: data ? {
        user_id: data.user_id,
        email: data.email,
        role: data.role,
        registration_complete: data.registration_complete,
        special_permissions: data.special_permissions || false,
      } : null
    });

    if (error) {
      console.error('❌ userProfileService: Error fetching profile:', error);
      throw new ProfileError(
        'Failed to fetch user profile',
        error.code,
        { originalError: error }
      );
    }

    if (!data) {
      console.error('❌ userProfileService: No profile data found for user');
      throw new ProfileError('Profile not found', 'PROFILE_NOT_FOUND');
    }

    console.log('✅ userProfileService: Profile fetched successfully');
    return data as UserProfile;
  } catch (error) {
    console.error('❌ userProfileService: Error in fetchCurrentUserProfile:', error);
    if (error instanceof ProfileError) throw error;
    throw new ProfileError(
      'An unexpected error occurred while fetching profile',
      'UNKNOWN_ERROR',
      { originalError: error }
    );
  }
}

export async function updateUserProfile(profile: Partial<UserProfile>): Promise<void> {
  try {
    console.log('🔍 userProfileService: Updating profile with data:', {
      ...profile,
      user_id: profile.user_id ? '[PRESENT]' : '[NOT PRESENT]'
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (!user) {
      console.error('❌ userProfileService: No authenticated user for update');
      throw new ProfileError('Not authenticated', 'AUTH_REQUIRED');
    }

    const { error } = await supabase
      .from('users')
      .update(profile)
      .eq('user_id', user.id);

    if (error) {
      console.error('❌ userProfileService: Error updating profile:', error);
      throw new ProfileError('Failed to update profile', error.code, { originalError: error });
    }

    console.log('✅ userProfileService: Profile updated successfully');
    console.log('📌 Auto-assignment check - Profile values:');
console.log('🔹 role:', profile.role);
console.log('📤 Sending profile to updateUserProfile:', profile);

console.log('🔹 stream_id:', profile.stream_id);
console.log('🔹 education_level:', profile.education_level);
console.log('🔹 subjects_enrolled length:', profile.subjects_enrolled?.length ?? 0);

    // ✅ Only auto-assign if the role is explicitly passed as learner
    if (profile.role === 'learner') {
      const streamId = profile.stream_id;
      const educationLevel = profile.education_level;
      const subjectIds = profile.subjects_enrolled;

      if (streamId && educationLevel && subjectIds?.length) {
        for (const subjectId of subjectIds) {
          await assignLearnerAutomaticallyIfClassroomExists(
            educationLevel,
            streamId,
            subjectId,
            user.id
          );
        }
        console.log('🎯 Learner automatically assigned to classrooms');
      } else {
        console.warn('⚠️ Missing stream, education level, or subjects — skipping learner auto-assignment');
      }
    }
  } catch (error) {
    console.error('❌ userProfileService: Error in updateUserProfile:', error);
    if (error instanceof ProfileError) throw error;
    throw new ProfileError(
      'An unexpected error occurred while updating profile',
      'UNKNOWN_ERROR',
      { originalError: error }
    );
  }
}
