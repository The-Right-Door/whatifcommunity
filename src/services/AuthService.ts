// src/services/AuthService.ts

import { supabase } from '../lib/supabase';
import { fetchCurrentUserProfile } from './userProfileService';

export interface LoginCredentials {
  email: string;
  password: string;
}

// ✅ You MUST have this class and export it
export class AuthError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export async function loginUser(credentials: LoginCredentials) {
  console.log('🔍 AuthService: Starting login process');
  const { email, password } = credentials;

  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    console.log('🔍 AuthService: Auth response:', {
      user: authData?.user ? {
        id: authData.user.id,
        email: authData.user.email,
        hasMetadata: !!authData.user.user_metadata
      } : null,
      error: authError ? {
        message: authError.message,
        status: authError.status
      } : null
    });

    if (authError) {
      console.error('❌ AuthService: Auth error:', authError);
      throw new AuthError(authError.message, authError.code, authError);
    }

    if (!authData.user) {
      console.error('❌ AuthService: No user returned from auth');
      throw new AuthError('Login failed: No user data returned');
    }

    console.log('✅ AuthService: Auth successful, fetching profile');
    
    try {
      const profile = await fetchCurrentUserProfile();
      console.log('✅ AuthService: Profile fetched successfully');
      return { authData, profile };
    } catch (profileError) {
      console.error('❌ AuthService: Error fetching profile:', profileError);
      
      // If profile not found, we'll handle this in the login component
      if (profileError instanceof Error && 'code' in profileError && profileError.code === 'PROFILE_NOT_FOUND') {
        console.log('⚠️ AuthService: Profile not found, will create one');
        return { authData, profile: null };
      }
      
      throw profileError;
    }
  } catch (error) {
    console.error('❌ AuthService: Unexpected error:', error);
    if (error instanceof AuthError) throw error;
    throw new AuthError('An unexpected error occurred during login', undefined, { originalError: error });
  }
}