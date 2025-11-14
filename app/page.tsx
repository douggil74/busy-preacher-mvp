"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RootRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Always show the animated web splash page with glow effects
    router.replace("/splash");
  }, [router]);

  return null;
}
