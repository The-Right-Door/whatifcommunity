import { supabase } from './supabase'; // ✅ This works because supabase is in the same folder

export const handleLogout = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Logout failed:', error.message);
    alert('Logout failed. Please try again.');
  } else {
    console.log('Successfully signed out');
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/login'; // Redirect to login or home page
  }
};
