import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';

export default function SignupConfirmation() {
  const handleResendEmail = async () => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup'
      });
      
      if (error) throw error;
      
      toast.success('Confirmation email resent successfully!');
    } catch (error: any) {
      console.error('Error resending confirmation:', error);
      
      if (error?.message?.includes('too many requests')) {
        toast.error('Please wait a few minutes before requesting another email.');
      } else if (error?.message?.includes('Email rate limit exceeded')) {
        toast.error('Too many attempts. Please try again later.');
      } else {
        toast.error(error?.message || 'Failed to resend confirmation email. Please try again.');
      }
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

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="bg-transparent backdrop-blur-sm border border-white/20 rounded-lg p-8 max-w-md w-full">
          <div className="flex items-center justify-center mb-8">
            <div className="p-3 bg-emerald-600/30 rounded-lg">
              <Mail className="h-8 w-8 text-white" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white text-center mb-4">
            Check your inbox!
          </h2>

          <p className="text-gray-200 text-center mb-8">
            We've sent you an email with a link to confirm your account. Please check your inbox and follow the instructions to complete your registration.
          </p>

          <div className="space-y-4">
            <button
              onClick={handleResendEmail}
              className="w-full bg-emerald-600/80 text-white px-4 py-3 rounded-full font-semibold hover:bg-emerald-500 transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <Mail className="h-5 w-5" />
              <span>Resend confirmation email</span>
            </button>

            <Link
              to="/login"
              className="w-full bg-white/10 text-white px-4 py-3 rounded-full font-semibold hover:bg-white/20 transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <ArrowRight className="h-5 w-5" />
              <span>Back to login</span>
            </Link>
          </div>

          <p className="mt-6 text-sm text-gray-300 text-center">
            Didn't receive the email? Check your spam folder or try resending the confirmation email.
          </p>
        </div>
      </div>
    </div>
  );
}