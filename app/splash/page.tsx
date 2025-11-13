"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
});

// Add keyframes for glow animation
const glowKeyframes = `
  @keyframes glow {
    0%, 100% {
      filter: drop-shadow(0 0 20px rgba(255,215,0,0.4))
              drop-shadow(0 0 40px rgba(255,215,0,0.3))
              drop-shadow(0 0 60px rgba(255,215,0,0.2));
    }
    50% {
      filter: drop-shadow(0 0 30px rgba(255,215,0,0.6))
              drop-shadow(0 0 50px rgba(255,215,0,0.5))
              drop-shadow(0 0 80px rgba(255,215,0,0.4));
    }
  }

  @keyframes fadeOutZoom {
    0% {
      opacity: 1;
      transform: scale(1);
    }
    100% {
      opacity: 0;
      transform: scale(1.15);
    }
  }
`;

export default function SplashPage() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [visible, setVisible] = useState(true);
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem("splash-shown");
    if (seen) {
      router.replace("/home");
      return;
    }

    sessionStorage.setItem("splash-shown", "true");
    setChecked(true);

    const textTimer = setTimeout(() => setShowText(true), 600);
    const fadeTimer = setTimeout(() => setVisible(false), 2500);
    const navTimer = setTimeout(() => router.push("/home"), 4000);

    return () => {
      clearTimeout(textTimer);
      clearTimeout(fadeTimer);
      clearTimeout(navTimer);
    };
  }, [router]);

  if (!checked) return null;

  return (
    <>
      <style>{glowKeyframes}</style>
      <main
        className={`flex flex-col items-center justify-center h-[100svh] w-full ${playfair.className}`}
        style={{
          backgroundColor: "#0f1729",
          color: "white",
          overflow: "hidden",
          margin: 0,
          padding: 0,
          animation: visible ? 'none' : 'fadeOutZoom 1.5s ease-in-out forwards',
        }}
      >
      <div
        className="flex flex-col items-center justify-center"
        style={{
          textAlign: "center",
        }}
      >
        <h2
          className={`text-3xl font-semibold mb-8 text-center transition-opacity duration-700 ${
            showText ? "opacity-100" : "opacity-0"
          }`}
          style={{
            color: "#FFD700",
            letterSpacing: "0.05em",
            textShadow: "0 0 10px rgba(255,215,0,0.25)",
          }}
        >
          Welcome to the
        </h2>

        <div
          style={{
            animation: visible ? 'glow 2s ease-in-out infinite' : 'none',
            transition: 'all 1.5s ease-in-out',
          }}
        >
          <Image
            src="/logo.webp"
            alt="The Busy Christian"
            width={220}
            height={220}
            priority
            className="select-none"
            style={{
              transition: "transform 1.5s ease-in-out",
              transform: visible ? "scale(1) rotate(0deg)" : "scale(1.2) rotate(5deg)",
            }}
          />
        </div>

        <h1
          className={`text-2xl font-semibold mt-6 text-center transition-opacity duration-700 ${
            showText ? "opacity-100" : "opacity-0"
          }`}
          style={{
            color: "white",
            letterSpacing: "0.05em",
            textShadow: "0 0 10px rgba(255,255,255,0.25)",
          }}
        >
          The Busy Christian
        </h1>
      </div>
    </main>
    </>
  );
}
