import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { fetchCurrentUserProfile, UserProfile } from '../services/userProfileService';

interface UserContextType {
  profile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  isTeacher: boolean;
  isLearner: boolean;
  isParent: boolean;
  hasSpecialPermissions: boolean;
  refreshProfile: () => Promise<void>;
  role: 'teacher' | 'learner' | 'parent' | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch profile when session changes
  const refreshProfile = async () => {
    setLoading(true);
    try {
      console.log('🔄 UserContext: Refreshing user profile');
      const { data: { user }, error } = await supabase.auth.getUser();
      
      console.log('🔍 UserContext: Auth check result:', { 
        hasUser: !!user, 
        userId: user?.id,
        hasError: !!error,
        errorMessage: error?.message 
      });
      
      if (error || !user) {
        console.log('⚠️ UserContext: No authenticated user found');
        setProfile(null);
      } else {
        console.log('✅ UserContext: User authenticated, fetching profile');
        try {
          const fetchedProfile = await fetchCurrentUserProfile();
          console.log('✅ UserContext: Profile fetched successfully:', {
            userId: fetchedProfile.user_id,
            email: fetchedProfile.email,
            role: fetchedProfile.role,
            registrationComplete: fetchedProfile.registration_complete,
            specialPermissions: fetchedProfile.special_permissions
          });
          setProfile(fetchedProfile);
        } catch (profileError) {
          console.error('❌ UserContext: Error fetching profile:', profileError);
          setProfile(null);
        }
      }
    } catch (error) {
      console.error('❌ UserContext: Error refreshing user profile:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load on mount
    console.log('🔄 UserContext: Initial profile load');
    refreshProfile();

    // Listen to auth state changes (login, logout)
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 UserContext: Auth state changed:', event);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        console.log('👤 UserContext: User signed in or token refreshed, refreshing profile');
        refreshProfile();
      }
      if (event === 'SIGNED_OUT') {
        console.log('🚪 UserContext: User signed out, clearing profile');
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      console.log('🧹 UserContext: Cleaning up auth listener');
      authListener.subscription.unsubscribe();
    };
  }, []);

  const value: UserContextType = {
    profile,
    loading,
    isAuthenticated: !!profile,
    isTeacher: profile?.role === 'teacher',
    isLearner: profile?.role === 'learner',
    isParent: profile?.role === 'parent',
    hasSpecialPermissions: profile?.special_permissions || false,
    role: profile?.role as 'teacher' | 'learner' | 'parent' | null,
    refreshProfile
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};