// app/setup/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SetupPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already onboarded
    const userName = localStorage.getItem("bc-user-name");
    const userStyle = localStorage.getItem("bc-style");

    if (userName && userStyle) {
      // Already onboarded, go to home
      router.push("/");
    } else {
      // Not onboarded, go to home which will trigger onboarding modal
      router.push("/?onboarding=true");
    }
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4 animate-bounce">📖</div>
        <p className="text-white/60">Redirecting to setup...</p>
      </div>
    </main>
  );
}