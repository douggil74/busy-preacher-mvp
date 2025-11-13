'use client';

import { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, Shield } from 'lucide-react';
import { hasAdminPassword, setAdminPassword, verifyAdminPassword, setAdminSession, isAdminAuthenticated } from '@/lib/adminAuth';

interface AdminAuthProps {
  children: React.ReactNode;
}

export default function AdminAuth({ children }: AdminAuthProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Check if already authenticated in this session
      if (isAdminAuthenticated()) {
        setIsAuthenticated(true);
        setIsLoading(false);
        return;
      }

      // Password is always set (default or custom)
      await hasAdminPassword(); // Ensures default is set
      setNeedsSetup(false); // Never show setup screen
      setIsLoading(false);
    } catch (err) {
      console.error('Auth check failed:', err);
      setIsLoading(false);
    }
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await setAdminPassword(password);
      setAdminSession();
      setIsAuthenticated(true);
    } catch (err) {
      setError('Failed to set password');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const isValid = await verifyAdminPassword(password);
      if (isValid) {
        setAdminSession();
        setIsAuthenticated(true);
      } else {
        setError('Incorrect password');
        setPassword('');
      }
    } catch (err) {
      setError('Login failed');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 shadow-2xl">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full">
              {needsSetup ? (
                <Shield className="w-8 h-8 text-white" />
              ) : (
                <Lock className="w-8 h-8 text-white" />
              )}
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-white text-center mb-2">
            {needsSetup ? 'Admin Setup' : 'Admin Login'}
          </h1>
          <p className="text-slate-400 text-center mb-6">
            {needsSetup
              ? 'Create your admin password to secure the admin panel'
              : 'Enter your password to access the admin panel'}
          </p>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-500 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={needsSetup ? handleSetup : handleLogin} className="space-y-4">
            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {needsSetup ? 'Create Password' : 'Password'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500 pr-12"
                  placeholder="Enter password"
                  required
                  minLength={6}
                  autoComplete="off"
                  name="admin-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password (Setup Only) */}
            {needsSetup && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Confirm password"
                  required
                  minLength={6}
                  autoComplete="off"
                  name="admin-password-confirm"
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full px-6 py-3 bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
            >
              {needsSetup ? (
                <>
                  <Shield className="w-5 h-5" />
                  Create Admin Password
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  Login
                </>
              )}
            </button>
          </form>

          {/* Info */}
          {needsSetup && (
            <p className="mt-4 text-xs text-slate-500 text-center">
              This password will be required to access all admin features. Keep it secure!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
