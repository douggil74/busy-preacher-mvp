// contexts/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState } from 'react';

interface AuthContextType {
  user: null;
  isAuthenticated: false;
  isLoading: false;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // No authentication - all users are guests
  const value: AuthContextType = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    signOut: async () => {
      // No-op for now
      console.log('Sign out called (no auth active)');
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
