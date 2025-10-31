'use client';

import { useEffect } from "react";
import { startBackgroundSync } from "@/lib/backgroundSync";
import { StudyStyleProvider } from './hooks/useStudyStyle';
import HeaderBar from './HeaderBar';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    startBackgroundSync(); // starts background sync
  }, []);

  return (
    <StudyStyleProvider>
      <HeaderBar />
      <main className="pt-16">{children}</main>
    </StudyStyleProvider>
  );
}
