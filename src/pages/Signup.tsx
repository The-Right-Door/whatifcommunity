import React, { useState } from 'react';
import { Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { signupUser, SignupFormData } from '../services/SignupService';

const roles = ['Learner', 'Teacher', 'Parent', 'Guest'];


export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SignupFormData>({
    firstName: '',
    middleName: '',
    lastName: '',
    role: '',
    phone: '',
    email: '',
    password: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      console.log('🔍 Signup.tsx: Starting signup process');
      // Sign up the user using Supabase Auth
      const authData = await signupUser(formData);
      console.log('✅ Signup.tsx: Signup successful, creating user profile');
      
      // Create user profile in the database
      try {
        console.log('🔍 Signup.tsx: Attempting to create user profile for:', authData.user?.id);
        const { error: insertError } = await supabase
          .from('users')
          .insert([{
            user_id: authData.user.id,
            first_name: formData.firstName,
            last_name: formData.lastName,
            middle_name: formData.middleName || null,
            email: formData.email,
            phone: formData.phone,
            role: formData.role.toLowerCase(),
            registration_complete: false
          }]);

        if (insertError) {
          console.error('❌ Signup.tsx: Profile creation failed:', insertError);
          toast.error('Failed to create user profile. Please try again.');
          return;
        }
        
        console.log('✅ Signup.tsx: User profile created successfully');
        // Navigate if successful
        toast.success('Account created successfully! Please check your email to confirm your registration.');
        navigate('/signup-confirmation');
      } catch (profileError) {
        console.error('❌ Signup.tsx: Error creating profile:', profileError);
        toast.error('Failed to create user profile. Please try again.');
      }
    } catch (error: any) {
      console.error('❌ Signup.tsx: Signup error:', error);

      if (error?.message?.includes('already registered')) {
        toast.error('This email is already registered. Please use a different email or login.');
      } else if (error?.message?.includes('password')) {
        toast.error('Password must be at least 6 characters long.');
      } else if (error?.message?.includes('email')) {
        toast.error('Please enter a valid email address.');
      } else {
        toast.error(error?.message || 'Failed to create account. Please try again.');
      }
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
      
      <Navbar />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-20">
        <div className="bg-transparent backdrop-blur-sm border border-white/20 rounded-lg p-8 max-w-md w-full">
          <div className="flex items-center space-x-2 mb-6 justify-center">
            <Users className="h-8 w-8 text-white" />
            <h2 className="text-2xl font-bold text-white">Create Account</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white">First Name</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-white focus:ring focus:ring-white/20"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white">Middle Name</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-white focus:ring focus:ring-white/20"
                  value={formData.middleName}
                  onChange={(e) => setFormData({...formData, middleName: e.target.value})}
                  disabled={isSubmitting}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white">Last Name</label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-white focus:ring focus:ring-white/20"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white">Role</label>
              <select
                required
                className="mt-1 block w-full rounded-md bg-white/10 border-white/20 text-white focus:border-white focus:ring focus:ring-white/20"
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                disabled={isSubmitting}
              >
                <option value="" className="text-gray-900">Select a role</option>
                {roles.map((role) => (
                  <option key={role} value={role} className="text-gray-900">{role}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white">Phone</label>
              <input
                type="tel"
                required
                className="mt-1 block w-full rounded-md bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-white focus:ring focus:ring-white/20"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                disabled={isSubmitting}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white">Email</label>
              <input
                type="email"
                required
                className="mt-1 block w-full rounded-md bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-white focus:ring focus:ring-white/20"
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
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                disabled={isSubmitting}
              />
            </div>
            
            <button
              type="submit"
              className={`w-full bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          
          <p className="mt-4 text-center text-sm text-white">
            Already have an account?{' '}
            <Link to="/login" className="text-white font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}