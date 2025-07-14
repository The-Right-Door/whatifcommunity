// src/services/SignupService.ts
import { supabase } from '../lib/supabase';

export interface SignupFormData {
  firstName: string;
  middleName: string;
  lastName: string;
  role: string;
  phone: string;
  email: string;
  password: string;
}

export async function signupUser(formData: SignupFormData) {
  console.log('🔍 SignupService: Starting signup process with data:', {
    ...formData,
    password: '[REDACTED]' // Don't log the actual password
  });

  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          first_name: formData.firstName,
          middle_name: formData.middleName,
          last_name: formData.lastName,
          role: formData.role.toLowerCase(),
          phone: formData.phone
        }
      }
    });

    console.log('🔍 SignupService: Auth response:', {
      user: authData?.user ? {
        id: authData.user.id,
        email: authData.user.email,
        metadata: authData.user.user_metadata
      } : null,
      error: authError ? {
        message: authError.message,
        status: authError.status
      } : null
    });

    if (authError) {
      console.error('❌ SignupService: Auth error:', authError);
      throw authError;
    }

    if (!authData.user) {
      console.error('❌ SignupService: No user returned from auth');
      throw new Error('Signup failed: user was not created');
    }

    console.log('✅ SignupService: Signup successful, user created with ID:', authData.user.id);
    return authData;
  } catch (error) {
    console.error('❌ SignupService: Error during signup:', error);
    throw error;
  }
}