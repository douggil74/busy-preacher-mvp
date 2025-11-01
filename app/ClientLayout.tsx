'use client';

import { useEffect } from "react";
import { startBackgroundSync } from "@/lib/backgroundSync";
import { StudyStyleProvider } from './hooks/useStudyStyle';
import { AuthProvider } from '@/contexts/AuthContext';
import HeaderBar from './HeaderBar';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    startBackgroundSync(); // starts background sync
  }, []);

  return (
    <AuthProvider>
      <StudyStyleProvider>
        <HeaderBar />
        <main className="pt-16">{children}</main>
      </StudyStyleProvider>
    </AuthProvider>
  );
}