// src/contexts/UserContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchCurrentUserProfile, UserProfile } from '../services/userProfileService';
import { ProfileError } from '../services/userProfileService';
import toast from 'react-hot-toast';

interface UserContextType {
  role: 'teacher' | 'learner' | 'parent' | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
  isTeacher: boolean;
  isLearner: boolean;
  isParent: boolean;
  isAuthenticated: boolean;
  canAddTopics: boolean;
  canEditTopics: boolean;
  canManageSubtopics: boolean;
}

const UserContext = createContext<UserContextType>({
  role: null,
  profile: null,
  loading: true,
  error: null,
  refreshProfile: async () => {},
  isTeacher: false,
  isLearner: false,
  isParent: false,
  isAuthenticated: false,
  canAddTopics: false,
  canEditTopics: false,
  canManageSubtopics: false
});

export const useUser = () => useContext(UserContext);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<'teacher' | 'learner' | 'parent' | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUser = async (showToast: boolean = false) => {
    try {
      const userProfile = await fetchCurrentUserProfile();
      console.log('🎯 Loaded user profile:', userProfile);

      setProfile(userProfile);
      setRole(userProfile.role as 'teacher' | 'learner' | 'parent');
      setError(null);

      if (showToast) {
        toast.success('Profile refreshed successfully');
      }
    } catch (err: any) {
      if (err instanceof ProfileError && err.code === 'AUTH_REQUIRED') {
        console.log('🚫 No authenticated user, setting profile to null.');
        setRole(null);
        setProfile(null);
        setError(null); // No error if user simply not logged in
      } else {
        console.error('❌ Error loading user data:', err);
        setRole(null);
        setProfile(null);
        setError('Failed to load user profile');

        if (showToast) {
          toast.error('Failed to refresh profile');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const refreshProfile = async () => {
    setLoading(true);
    await loadUser(true); // Show toast notifications on manual refresh
  };

  // Compute role-based permissions
  const isTeacher = role === 'teacher';
  const isLearner = role === 'learner';
  const isParent = role === 'parent';
  const isAuthenticated = !!profile;

  // Topic management permissions
  const canAddTopics = isTeacher && profile?.registration_complete;
  const canEditTopics = isTeacher && profile?.registration_complete;
  const canManageSubtopics = isTeacher && profile?.registration_complete;

  const contextValue: UserContextType = {
    role,
    profile,
    loading,
    error,
    refreshProfile,
    isTeacher,
    isLearner,
    isParent,
    isAuthenticated,
    canAddTopics,
    canEditTopics,
    canManageSubtopics
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};