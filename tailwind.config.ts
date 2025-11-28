import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      colors: {
        card: "#0f172a",
        border: "rgba(255,255,255,0.08)",
      },
      boxShadow: {
        soft: "0 10px 30px rgba(0,0,0,0.2)",
      },
    },
  },
  plugins: [],
} satisfies Config;
