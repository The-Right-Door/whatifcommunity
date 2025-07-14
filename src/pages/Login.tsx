import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { loginUser, LoginCredentials, AuthError } from '../services/AuthService';
import { useUser } from '../contexts/UserContext';

export default function Login() {
  const navigate = useNavigate();
  const { profile, loading, isTeacher, isLearner, isParent, isAuthenticated } = useUser();

  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSubmitting, setResetSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated && profile) {
      console.log('🔍 Login.tsx: User is authenticated, checking profile:', {
        isAuthenticated,
        profile,
        registrationComplete: profile.registration_complete
      });

       console.log('📝 Login.tsx: registration_complete:', profile.registration_complete);
      if (!profile.registration_complete) {
        console.log('🔄 Login.tsx: Redirecting to complete registration');
        toast('Redirecting to complete registration...');
        navigate('/complete-registration');
      } else if (isTeacher) {
        console.log('🔄 Login.tsx: Redirecting to teacher dashboard');
        navigate('/teacher/dashboard');
      } else if (isLearner) {
        console.log('🔄 Login.tsx: Redirecting to learner dashboard');
        navigate('/learner/dashboard');
      } else if (isParent) {
        console.log('🔄 Login.tsx: Redirecting to parent dashboard');
        navigate('/parent/dashboard');
      } else {
        console.log('🔄 Login.tsx: No specific role matched, redirecting to home');
        navigate('/'); // fallback if no role matched
      }
    }
  }, [loading, isAuthenticated, profile, isTeacher, isLearner, isParent, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    console.log('🔍 Login.tsx: Starting login process');

    try {
      const { authData, profile } = await loginUser(formData);
      console.log('📝 Login.tsx Herbert (handleSubmit): registration_complete:', profile.registration_complete);
      console.log('✅ Login.tsx: Login successful, checking profile:', {
        userId: authData.user?.id,
        hasProfile: !!profile
      });

      if (!profile) {
        console.log('🔍 Login.tsx: No profile found, creating one from auth metadata');
        const metadata = authData.user.user_metadata;
        
        const { error: insertError } = await supabase
          .from('users')
          .insert([{
            user_id: authData.user.id,
            first_name: metadata.first_name,
            last_name: metadata.last_name,
            email: authData.user.email,
            role: metadata.role,
            registration_complete: false
          }]);

        if (insertError) {
          console.error('❌ Login.tsx: Profile creation failed:', insertError);
          toast.error('Failed to create user profile. Please try again.');
          return;
        }
        
        console.log('✅ Login.tsx: Profile created successfully');
      }

    } catch (error) {
      if (error instanceof AuthError) {
        console.group('❌ Login.tsx: Auth Error');
        console.log('Code:', error.code);
        console.log('Message:', error.message);
        if (error.details) console.log('Details:', error.details);
        console.groupEnd();
      } else {
        console.error('❌ Login.tsx: Unexpected error:', error);
      }

      toast.error(error instanceof Error ? error.message : 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setResetSubmitting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      
      toast.success('Password reset link sent to your email');
      setShowForgotPassword(false);
      setResetEmail('');
    } catch (error: any) {
      console.error('Error sending reset email:', error);
      toast.error(error.message || 'Failed to send reset email. Please try again.');
    } finally {
      setResetSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white text-xl">Please wait...</div>
      </div>
    );
  }

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
      
      <Navbar />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        {showForgotPassword ? (
          <div className="bg-transparent backdrop-blur-sm border border-white/20 rounded-lg p-8 max-w-md w-full">
            <div className="flex items-center space-x-2 mb-6 justify-center">
              <Users className="h-8 w-8 text-white" />
              <h2 className="text-2xl font-bold text-white">Reset Password</h2>
            </div>
            
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white">Email</label>
                <input
                  type="email"
                  required
                  className="mt-1 block w-full rounded-md bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-white focus:ring focus:ring-white/20"
                  placeholder="Enter your email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  disabled={resetSubmitting}
                />
              </div>
              
              <button
                type="submit"
                className={`w-full px-4 py-2 rounded-md transition-colors ${
                  resetSubmitting ? 'bg-gray-500 cursor-not-allowed' : 'bg-gray-900 hover:bg-gray-800'
                } text-white`}
                disabled={resetSubmitting}
              >
                {resetSubmitting ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
            
            <p className="mt-4 text-center text-sm text-white">
              <button 
                onClick={() => setShowForgotPassword(false)} 
                className="text-white font-semibold hover:underline"
              >
                Back to Login
              </button>
            </p>
          </div>
        ) : (
          <div className="bg-transparent backdrop-blur-sm border border-white/20 rounded-lg p-8 max-w-md w-full">
            <div className="flex items-center space-x-2 mb-6 justify-center">
              <Users className="h-8 w-8 text-white" />
              <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white">Email</label>
                <input
                  type="email"
                  required
                  className="mt-1 block w-full rounded-md bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-white focus:ring focus:ring-white/20"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white">Password</label>
                <input
                  type="password"
                  required
                  className="mt-1 block w-full rounded-md bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-white focus:ring focus:ring-white/20"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
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
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
            
            <div className="mt-4 text-center text-sm text-white">
              <button 
                onClick={() => setShowForgotPassword(true)}
                className="text-white hover:underline"
              >
                Forgot password?
              </button>
            </div>
            
            <p className="mt-4 text-center text-sm text-white">
              Don't have an account?{' '}
              <Link to="/signup" className="text-white font-semibold hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}