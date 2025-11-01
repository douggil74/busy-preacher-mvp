// components/SignInPrompt.tsx
'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { X } from 'lucide-react';

interface SignInPromptProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export function SignInPrompt({ isOpen, onClose, message }: SignInPromptProps) {
  const { signInWithGoogle } = useAuth();

  if (!isOpen) return null;

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
      onClose();
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4">
        {/* Card with golden glow */}
        <div className="relative bg-neutral-900 rounded-lg border border-yellow-400/20 shadow-[0_0_30px_rgba(250,204,21,0.15)]">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-neutral-400 hover:text-yellow-400 transition-colors"
            aria-label="Close"
          >
            <X size={24} />
          </button>

          {/* Content */}
          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="font-playfair text-3xl text-yellow-400 mb-2">
                Sign In to Continue
              </h2>
              <p className="text-neutral-300">
                {message || 'Join our prayer community and connect with fellow believers'}
              </p>
            </div>

            {/* Google Sign-In Button */}
            <button
              onClick={handleSignIn}
              className="w-full bg-white hover:bg-neutral-100 text-neutral-900 font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
            >
              {/* Google Icon */}
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.35z" fill="#4285F4"/>
                <path d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.59A9.996 9.996 0 0010 20z" fill="#34A853"/>
                <path d="M4.405 11.9c-.2-.6-.314-1.24-.314-1.9 0-.66.114-1.3.314-1.9V5.51H1.064A9.996 9.996 0 000 10c0 1.614.386 3.14 1.064 4.49l3.34-2.59z" fill="#FBBC05"/>
                <path d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.959.99 12.695 0 10 0 6.09 0 2.71 2.24 1.064 5.51l3.34 2.59C5.19 5.736 7.395 3.977 10 3.977z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            {/* Benefits */}
            <div className="mt-6 pt-6 border-t border-neutral-800">
              <p className="text-sm text-neutral-400 text-center mb-3">
                When you sign in, you can:
              </p>
              <ul className="space-y-2 text-sm text-neutral-300">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-0.5">✓</span>
                  <span>Share prayer requests with the community</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-0.5">✓</span>
                  <span>Pray for others and see your impact</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-0.5">✓</span>
                  <span>Track your prayer journey and milestones</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}