"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
});

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
    <main
      className={`flex flex-col items-center justify-center h-[100svh] w-full transition-opacity duration-[1500ms] ease-in-out ${
        visible ? "opacity-100" : "opacity-0"
      } ${playfair.className}`}
      style={{
        backgroundColor: "#0f1729",
        color: "white",
        overflow: "hidden",
        margin: 0,
        padding: 0,
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

        <Image
          src="/logo.png"
          alt="The Busy Christian"
          width={200}
          height={200}
          priority
          className="select-none"
          style={{
            filter: "drop-shadow(0 0 25px rgba(255,215,0,0.35))",
            transition: "transform 1.2s ease-in-out, opacity 1.2s ease-in-out",
            transform: visible ? "scale(1)" : "scale(1.1)",
            opacity: visible ? 1 : 0.6,
          }}
        />

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
  );
}
