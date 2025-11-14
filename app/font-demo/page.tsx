"use client";

import { Dancing_Script, Pacifico, Great_Vibes, Satisfy, Alex_Brush, Allura, Sacramento, Tangerine } from "next/font/google";

const dancingScript = Dancing_Script({ weight: ["400", "600"], subsets: ["latin"] });
const pacifico = Pacifico({ weight: ["400"], subsets: ["latin"] });
const greatVibes = Great_Vibes({ weight: ["400"], subsets: ["latin"] });
const satisfy = Satisfy({ weight: ["400"], subsets: ["latin"] });
const alexBrush = Alex_Brush({ weight: ["400"], subsets: ["latin"] });
const allura = Allura({ weight: ["400"], subsets: ["latin"] });
const sacramento = Sacramento({ weight: ["400"], subsets: ["latin"] });
const tangerine = Tangerine({ weight: ["400", "700"], subsets: ["latin"] });

export default function FontDemo() {
  const fonts = [
    { name: "Dancing Script (current)", className: dancingScript.className, note: "Popular, casual" },
    { name: "Pacifico", className: pacifico.className, note: "Modern, friendly, surf-style" },
    { name: "Great Vibes", className: greatVibes.className, note: "Elegant, formal calligraphy" },
    { name: "Satisfy", className: satisfy.className, note: "Casual handwriting, modern" },
    { name: "Alex Brush", className: alexBrush.className, note: "Elegant, refined script" },
    { name: "Allura", className: allura.className, note: "Flowing, sophisticated" },
    { name: "Sacramento", className: sacramento.className, note: "Modern calligraphy" },
    { name: "Tangerine", className: tangerine.className, note: "Classic, refined elegance" },
  ];

  return (
    <div style={{
      backgroundColor: "#0f1729",
      minHeight: "100vh",
      padding: "40px 20px",
    }}>
      <h1 style={{
        color: "white",
        textAlign: "center",
        marginBottom: "40px",
        fontSize: "24px",
        fontFamily: "system-ui",
      }}>
        Script Font Options for "Welcome to the"
      </h1>

      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: "40px",
        maxWidth: "800px",
        margin: "0 auto",
      }}>
        {fonts.map((font, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: "#1a2332",
              padding: "30px",
              borderRadius: "12px",
              border: "2px solid #2d3f5f",
            }}
          >
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "15px",
            }}>
              <h2 style={{
                color: "#b8d4e6",
                fontSize: "16px",
                fontFamily: "system-ui",
                margin: 0,
              }}>
                {font.name}
              </h2>
              <span style={{
                color: "#7a8ea3",
                fontSize: "13px",
                fontFamily: "system-ui",
              }}>
                {font.note}
              </span>
            </div>
            <div
              className={font.className}
              style={{
                color: "#FFD700",
                fontSize: "48px",
                textAlign: "center",
                letterSpacing: "0.02em",
                textShadow: "0 0 10px rgba(255,215,0,0.25)",
              }}
            >
              Welcome to the
            </div>
          </div>
        ))}
      </div>

      <div style={{
        textAlign: "center",
        marginTop: "60px",
        color: "#b8d4e6",
        fontFamily: "system-ui",
      }}>
        <p>Navigate to <code style={{ backgroundColor: "#1a2332", padding: "4px 8px", borderRadius: "4px" }}>/font-demo</code> to see this page</p>
        <p style={{ marginTop: "20px", fontSize: "14px", color: "#7a8ea3" }}>
          Click back when you've chosen your favorite!
        </p>
      </div>
    </div>
  );
}
