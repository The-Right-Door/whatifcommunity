import React, { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hash, setHash] = useState<string | null>(null);

  useEffect(() => {
    // Extract the hash from the URL
    const hashFragment = window.location.hash;
    if (hashFragment) {
      // The hash typically starts with #, so we remove it
      setHash(hashFragment.substring(1));
    } else {
      toast.error('Invalid password reset link');
      navigate('/login');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) throw error;
      
      toast.success('Password updated successfully');
      navigate('/login');
    } catch (error: any) {
      console.error('Error resetting password:', error);
      toast.error(error.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="bg-transparent backdrop-blur-sm border border-white/20 rounded-lg p-8 max-w-md w-full">
          <div className="flex items-center space-x-2 mb-6 justify-center">
            <Users className="h-8 w-8 text-white" />
            <h2 className="text-2xl font-bold text-white">Reset Your Password</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white">New Password</label>
              <input
                type="password"
                required
                className="mt-1 block w-full rounded-md bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-white focus:ring focus:ring-white/20"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white">Confirm Password</label>
              <input
                type="password"
                required
                className="mt-1 block w-full rounded-md bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-white focus:ring focus:ring-white/20"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            
            <button
              type="submit"
              className={`w-full px-4 py-2 rounded-md transition-colors ${
                isSubmitting ? 'bg-gray-500 cursor-not-allowed' : 'bg-gray-900 hover:bg-gray-800'
              } text-white`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Reset Password'}
            </button>
          </form>
          
          <p className="mt-4 text-center text-sm text-white">
            Remember your password?{' '}
            <Link to="/login" className="text-white font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}