"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RootRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Check if splash was already shown today
    const lastSplashDate = localStorage.getItem("last_splash_date");
    const today = new Date().toDateString();

    if (lastSplashDate === today) {
      // Already showed splash today, go directly to home/onboarding
      const hasCompletedOnboarding = localStorage.getItem("onboarding_completed") === "true";
      router.replace(hasCompletedOnboarding ? "/home" : "/onboarding");
    } else {
      // Show splash and record today's date
      localStorage.setItem("last_splash_date", today);
      router.replace("/splash");
    }
  }, [router]);

  // Show dark background immediately while redirecting (no white flash)
  return (
    <div style={{
      backgroundColor: '#0f1729',
      width: '100vw',
      height: '100vh',
      position: 'fixed',
      top: 0,
      left: 0
    }} />
  );
}
