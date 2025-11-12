'use client';

import { useEffect } from "react";
import { startBackgroundSync } from "@/lib/backgroundSync";
import { StudyStyleProvider } from './hooks/useStudyStyle';
import { AuthProvider } from '@/contexts/AuthContext';
import HeaderBar from './HeaderBar';
import AdminBanner from '@/components/AdminBanner';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    startBackgroundSync(); // starts background sync
  }, []);

  return (
    <AuthProvider>
      <StudyStyleProvider>
        <HeaderBar />
        <AdminBanner />
        <main className="pt-16" style={{ backgroundColor: 'var(--bg-color)' }}>
          {children}
        </main>
      </StudyStyleProvider>
    </AuthProvider>
  );
}