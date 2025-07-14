// src/contexts/UserContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchCurrentUserProfile, getCurrentUserRole } from '../services/userProfileService';
import { ProfileError } from '../services/userProfileService';

interface UserContextType {
  role: 'teacher' | 'learner' | 'parent' | null;
  profile: any; // Later you can replace with proper UserProfile type
  loading: boolean;
  error: string | null;
}

const UserContext = createContext<UserContextType>({
  role: null,
  profile: null,
  loading: true,
  error: null,
});

export const useUser = () => useContext(UserContext);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<'teacher' | 'learner' | 'parent' | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      setLoading(true);
      try {
        // Try getting role first (faster than full profile)
        const userRole = await getCurrentUserRole();
        setRole(userRole as 'teacher' | 'learner' | 'parent');

        // Then fetch full profile
        const userProfile = await fetchCurrentUserProfile();
        setProfile(userProfile);
        setError(null);
      } catch (err: any) {
        if (err instanceof ProfileError && err.code === 'AUTH_REQUIRED') {
          console.log('User not authenticated, continuing without profile');
          setRole(null);
          setProfile(null);
        } else {
          console.error('Error loading user data:', err);
          setError('Failed to load user profile');
        }
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  return (
    <UserContext.Provider value={{ role, profile, loading, error }}>
      {children}
    </UserContext.Provider>
  );
};
