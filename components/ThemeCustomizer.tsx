// components/ThemeCustomizer.tsx
"use client";

import { useEffect, useState } from "react";

interface Theme {
  name: string;
  emoji: string;
  colors: {
    background: string;
    cardBg: string;
    cardBorder: string;
    textPrimary: string;
    textSecondary: string;
    accent: string;
  };
}

const themes: Record<string, { light: Theme; dark: Theme }> = {
  papyrus: {
    light: {
      name: "Papyrus Light",
      emoji: "📜",
      colors: {
        background: "#f5f1e8",
        cardBg: "#ebe5d9",
        cardBorder: "#d4c9b3",
        textPrimary: "#2d2520",
        textSecondary: "#5a4f46",
        accent: "#b8860b",
      },
    },
    dark: {
      name: "Papyrus Dark",
      emoji: "📜",
      colors: {
        background: "#2d2520",
        cardBg: "#3d3530",
        cardBorder: "#4d4540",
        textPrimary: "#f5f1e8",
        textSecondary: "#d4c9b3",
        accent: "#daa520",
      },
    },
  },
  ocean: {
    light: {
      name: "Ocean Light",
      emoji: "🌊",
      colors: {
        background: "#e6f2f8",
        cardBg: "#d6e8f2",
        cardBorder: "#b8d4e6",
        textPrimary: "#1a3d4d",
        textSecondary: "#2d5366",
        accent: "#0891b2",
      },
    },
    dark: {
      name: "Ocean Dark",
      emoji: "🌊",
      colors: {
        background: "#0f2533",
        cardBg: "#1a3544",
        cardBorder: "#254555",
        textPrimary: "#e6f2f8",
        textSecondary: "#b8d4e6",
        accent: "#22d3ee",
      },
    },
  },
  forest: {
    light: {
      name: "Forest Light",
      emoji: "🌲",
      colors: {
        background: "#e8f3e8",
        cardBg: "#d9e8d9",
        cardBorder: "#b8d4b8",
        textPrimary: "#1a3d1a",
        textSecondary: "#2d532d",
        accent: "#059669",
      },
    },
    dark: {
      name: "Forest Dark",
      emoji: "🌲",
      colors: {
        background: "#0f2e0f",
        cardBg: "#1a3d1a",
        cardBorder: "#254d25",
        textPrimary: "#e8f3e8",
        textSecondary: "#b8d4b8",
        accent: "#10b981",
      },
    },
  },
  sunset: {
    light: {
      name: "Sunset Light",
      emoji: "🌅",
      colors: {
        background: "#fef2e8",
        cardBg: "#fde8d9",
        cardBorder: "#fcd4b8",
        textPrimary: "#4d2d1a",
        textSecondary: "#664020",
        accent: "#ea580c",
      },
    },
    dark: {
      name: "Sunset Dark",
      emoji: "🌅",
      colors: {
        background: "#331a0f",
        cardBg: "#4d2d1a",
        cardBorder: "#664025",
        textPrimary: "#fef2e8",
        textSecondary: "#fcd4b8",
        accent: "#fb923c",
      },
    },
  },
  midnight: {
    light: {
      name: "Midnight Light",
      emoji: "🌙",
      colors: {
        background: "#f2e8f8",
        cardBg: "#e8d9f2",
        cardBorder: "#d4b8e6",
        textPrimary: "#3d1a4d",
        textSecondary: "#532d66",
        accent: "#9333ea",
      },
    },
    dark: {
      name: "Midnight Dark",
      emoji: "🌙",
      colors: {
        background: "#1a0f33",
        cardBg: "#2d1a4d",
        cardBorder: "#3d2566",
        textPrimary: "#f2e8f8",
        textSecondary: "#d4b8e6",
        accent: "#a855f7",
      },
    },
  },
  desert: {
    light: {
      name: "Desert Light",
      emoji: "🏜️",
      colors: {
        background: "#f8f2e8",
        cardBg: "#f2e8d9",
        cardBorder: "#e6d4b8",
        textPrimary: "#4d3d2d",
        textSecondary: "#665340",
        accent: "#d97706",
      },
    },
    dark: {
      name: "Desert Dark",
      emoji: "🏜️",
      colors: {
        background: "#332d20",
        cardBg: "#4d3d2d",
        cardBorder: "#66533d",
        textPrimary: "#f8f2e8",
        textSecondary: "#e6d4b8",
        accent: "#f59e0b",
      },
    },
  },
  royal: {
    light: {
      name: "Royal Light",
      emoji: "👑",
      colors: {
        background: "#e8eef8",
        cardBg: "#d9e2f2",
        cardBorder: "#b8cce6",
        textPrimary: "#1a2d4d",
        textSecondary: "#2d4066",
        accent: "#1d4ed8",
      },
    },
    dark: {
      name: "Royal Dark",
      emoji: "👑",
      colors: {
        background: "#0f1a33",
        cardBg: "#1a2d4d",
        cardBorder: "#253d66",
        textPrimary: "#e8eef8",
        textSecondary: "#b8cce6",
        accent: "#3b82f6",
      },
    },
  },
};

interface ThemeCustomizerProps {
  inMenu?: boolean;
  onThemeChange?: () => void;
}

export function ThemeCustomizer({ inMenu = false, onThemeChange }: ThemeCustomizerProps) {
  const [currentTheme, setCurrentTheme] = useState<string>("papyrus");
  const [currentMode, setCurrentMode] = useState<"light" | "dark">("light");
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("bc-theme-v2");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCurrentTheme(parsed.theme || "papyrus");
        setCurrentMode(parsed.mode || "light");
      } catch (e) {
        // Default to papyrus light
      }
    }
  }, []);

  const applyTheme = (themeName: string, mode: "light" | "dark") => {
    const theme = themes[themeName][mode];
    const root = document.documentElement;

    root.style.setProperty("--bg-color", theme.colors.background);
    root.style.setProperty("--card-bg", theme.colors.cardBg);
    root.style.setProperty("--card-border", theme.colors.cardBorder);
    root.style.setProperty("--text-primary", theme.colors.textPrimary);
    root.style.setProperty("--text-secondary", theme.colors.textSecondary);
    root.style.setProperty("--accent-color", theme.colors.accent);

    localStorage.setItem("bc-theme-v2", JSON.stringify({ theme: themeName, mode }));
    setCurrentTheme(themeName);
    setCurrentMode(mode);
    
    if (onThemeChange) {
      onThemeChange();
    }
  };

  // If in menu, show inline theme picker
  if (inMenu) {
    return (
      <div className="w-full">
        <button
          className="w-full text-left rounded-lg px-0 py-1 flex items-center gap-2 text-sm font-medium"
          style={{ color: 'var(--text-primary)' }}
          onClick={() => setShowPicker(!showPicker)}
        >
          <span className="text-lg">🎨</span>
          <span>Change Theme</span>
          <span className="ml-auto text-xs" style={{ color: 'var(--text-secondary)' }}>
            {themes[currentTheme][currentMode].emoji} {currentMode === "light" ? "☀️" : "🌙"}
          </span>
        </button>

        {showPicker && (
          <div className="mt-2 space-y-2 pl-8">
            {Object.entries(themes).map(([key, { light, dark }]) => (
              <div key={key} className="flex items-center gap-2">
                <button
                  onClick={() => applyTheme(key, "light")}
                  className="flex-1 text-left rounded-lg px-2 py-1.5 text-xs hover:bg-white/10 transition-colors"
                  style={{ 
                    color: 'var(--text-primary)',
                    backgroundColor: currentTheme === key && currentMode === "light" ? 'var(--accent-color)' : 'transparent',
                    opacity: currentTheme === key && currentMode === "light" ? 1 : 0.7
                  }}
                >
                  {light.emoji} {key.charAt(0).toUpperCase() + key.slice(1)} ☀️
                </button>
                <button
                  onClick={() => applyTheme(key, "dark")}
                  className="flex-1 text-left rounded-lg px-2 py-1.5 text-xs hover:bg-white/10 transition-colors"
                  style={{ 
                    color: 'var(--text-primary)',
                    backgroundColor: currentTheme === key && currentMode === "dark" ? 'var(--accent-color)' : 'transparent',
                    opacity: currentTheme === key && currentMode === "dark" ? 1 : 0.7
                  }}
                >
                  {dark.emoji} {key.charAt(0).toUpperCase() + key.slice(1)} 🌙
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Standalone button version (not used now, but kept for compatibility)
  return (
    <div className="relative">
      <button
        onClick={() => setShowPicker(!showPicker)}
        className="rounded-xl px-3 h-9 hover:bg-white/10 text-lg transition-colors flex items-center"
        style={{
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: 'var(--card-border)',
          color: 'var(--text-primary)'
        }}
        title="Change theme"
      >
        🎨
      </button>

      {showPicker && (
        <div
          className="absolute right-0 mt-2 w-72 rounded-2xl p-3 shadow-lg z-50"
          style={{
            backgroundColor: 'var(--bg-color)',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: 'var(--card-border)'
          }}
        >
          <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
            Choose Your Theme
          </h3>
          <div className="space-y-2">
            {Object.entries(themes).map(([key, { light, dark }]) => (
              <div key={key} className="flex items-center gap-2">
                <button
                  onClick={() => {
                    applyTheme(key, "light");
                    setShowPicker(false);
                  }}
                  className="flex-1 text-left rounded-lg px-3 py-2 text-sm hover:bg-white/10 transition-colors"
                  style={{ 
                    color: 'var(--text-primary)',
                    backgroundColor: currentTheme === key && currentMode === "light" ? 'var(--accent-color)' : 'transparent'
                  }}
                >
                  {light.emoji} {key.charAt(0).toUpperCase() + key.slice(1)} ☀️
                </button>
                <button
                  onClick={() => {
                    applyTheme(key, "dark");
                    setShowPicker(false);
                  }}
                  className="flex-1 text-left rounded-lg px-3 py-2 text-sm hover:bg-white/10 transition-colors"
                  style={{ 
                    color: 'var(--text-primary)',
                    backgroundColor: currentTheme === key && currentMode === "dark" ? 'var(--accent-color)' : 'transparent'
                  }}
                >
                  {dark.emoji} {key.charAt(0).toUpperCase() + key.slice(1)} 🌙
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}