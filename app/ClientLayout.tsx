'use client';

import { useEffect } from "react";
import { startBackgroundSync } from "@/lib/backgroundSync";
import { StudyStyleProvider } from './hooks/useStudyStyle';
import { AuthProvider } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import AdminBanner from '@/components/AdminBanner';
import BackgroundGradient from '@/components/BackgroundGradient';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    startBackgroundSync();
  }, []);

  return (
    <AuthProvider>
      <StudyStyleProvider>
        {/* Global background gradient */}
        <BackgroundGradient />

        <div className="flex min-h-screen relative" style={{ backgroundColor: 'transparent', zIndex: 1 }}>
          {/* Left Sidebar */}
          <Sidebar />

          {/* Main Content Area - No margin on mobile (sidebar hidden), ml-16 on desktop */}
          <div className="flex-1 ml-0 md:ml-16 transition-all duration-300">
            <AdminBanner />
            <main style={{ backgroundColor: 'transparent', minHeight: '100vh' }}>
              {children}
            </main>
          </div>
        </div>
      </StudyStyleProvider>
    </AuthProvider>
  );
}
