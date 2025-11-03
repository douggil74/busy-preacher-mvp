// components/ThemeCustomizer.tsx
'use client';

import { useState, useEffect } from 'react';

interface ThemeColors {
  background: string;
  cardBg: string;
  cardBorder: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
}

interface Theme {
  colors: ThemeColors;
  fontFamily: string;
  fontSize: 'small' | 'medium' | 'large';
}

const PRESETS = {
  default: {
    colors: {
      background: '#020617',
      cardBg: 'rgba(255, 255, 255, 0.05)',
      cardBorder: 'rgba(255, 255, 255, 0.1)',
      textPrimary: '#ffffff',
      textSecondary: 'rgba(255, 255, 255, 0.7)',
      accent: '#facc15',
    },
    fontFamily: 'Inter',
    fontSize: 'medium' as const,
  },
  ocean: {
    colors: {
      background: '#0c1425',
      cardBg: 'rgba(59, 130, 246, 0.1)',
      cardBorder: 'rgba(59, 130, 246, 0.3)',
      textPrimary: '#f0f9ff',
      textSecondary: 'rgba(240, 249, 255, 0.7)',
      accent: '#3b82f6',
    },
    fontFamily: 'Inter',
    fontSize: 'medium' as const,
  },
  forest: {
    colors: {
      background: '#0a1f0f',
      cardBg: 'rgba(34, 197, 94, 0.1)',
      cardBorder: 'rgba(34, 197, 94, 0.3)',
      textPrimary: '#f0fdf4',
      textSecondary: 'rgba(240, 253, 244, 0.7)',
      accent: '#22c55e',
    },
    fontFamily: 'Inter',
    fontSize: 'medium' as const,
  },
  sunset: {
    colors: {
      background: '#1a0f0a',
      cardBg: 'rgba(249, 115, 22, 0.1)',
      cardBorder: 'rgba(249, 115, 22, 0.3)',
      textPrimary: '#fff7ed',
      textSecondary: 'rgba(255, 247, 237, 0.7)',
      accent: '#f97316',
    },
    fontFamily: 'Inter',
    fontSize: 'medium' as const,
  },
  light: {
    colors: {
      background: '#ffffff',
      cardBg: 'rgba(0, 0, 0, 0.03)',
      cardBorder: 'rgba(0, 0, 0, 0.1)',
      textPrimary: '#0f172a',
      textSecondary: 'rgba(15, 23, 42, 0.7)',
      accent: '#facc15',
    },
    fontFamily: 'Inter',
    fontSize: 'medium' as const,
  },
};

const FONT_OPTIONS = [
  { name: 'Inter', value: 'Inter, system-ui, sans-serif' },
  { name: 'Playfair Display', value: 'Playfair Display, serif' },
  { name: 'Georgia', value: 'Georgia, serif' },
  { name: 'Arial', value: 'Arial, sans-serif' },
  { name: 'Verdana', value: 'Verdana, sans-serif' },
  { name: 'Courier', value: 'Courier New, monospace' },
  { name: 'Comic Sans', value: 'Comic Sans MS, cursive' },
];

export function ThemeCustomizer() {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>(PRESETS.default);
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');

  // Load theme from localStorage and apply globally
  useEffect(() => {
    const applyTheme = (newTheme: Theme) => {
      const root = document.documentElement;
      root.style.setProperty('--bg-color', newTheme.colors.background);
      root.style.setProperty('--card-bg', newTheme.colors.cardBg);
      root.style.setProperty('--card-border', newTheme.colors.cardBorder);
      root.style.setProperty('--text-primary', newTheme.colors.textPrimary);
      root.style.setProperty('--text-secondary', newTheme.colors.textSecondary);
      root.style.setProperty('--accent-color', newTheme.colors.accent);
      root.style.setProperty('--font-family', newTheme.fontFamily);
      
      const fontSizes = {
        small: '14px',
        medium: '16px',
        large: '18px',
      };
      root.style.setProperty('--font-size', fontSizes[newTheme.fontSize]);
    };

    const saved = localStorage.getItem('bc-theme');
    if (saved) {
      try {
        const parsedTheme = JSON.parse(saved);
        setTheme(parsedTheme);
        applyTheme(parsedTheme);
      } catch (e) {
        // Silently fall back to default theme if data is corrupted
        localStorage.removeItem('bc-theme');
        applyTheme(PRESETS.default);
      }
    } else {
      applyTheme(PRESETS.default);
    }
    
    // IMPORTANT: Reapply theme on navigation to ensure it persists across pages
    const reapplyTheme = () => {
      const currentSaved = localStorage.getItem('bc-theme');
      if (currentSaved) {
        try {
          const parsedTheme = JSON.parse(currentSaved);
          applyTheme(parsedTheme);
        } catch (e) {
          applyTheme(PRESETS.default);
        }
      }
    };
    
    // Listen for route changes
    window.addEventListener('popstate', reapplyTheme);
    
    return () => {
      window.removeEventListener('popstate', reapplyTheme);
    };
  }, []);

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    root.style.setProperty('--bg-color', newTheme.colors.background);
    root.style.setProperty('--card-bg', newTheme.colors.cardBg);
    root.style.setProperty('--card-border', newTheme.colors.cardBorder);
    root.style.setProperty('--text-primary', newTheme.colors.textPrimary);
    root.style.setProperty('--text-secondary', newTheme.colors.textSecondary);
    root.style.setProperty('--accent-color', newTheme.colors.accent);
    root.style.setProperty('--font-family', newTheme.fontFamily);
    
    const fontSizes = {
      small: '14px',
      medium: '16px',
      large: '18px',
    };
    root.style.setProperty('--font-size', fontSizes[newTheme.fontSize]);
  };

  const updateTheme = (updates: Partial<Theme>) => {
    const newTheme = { ...theme, ...updates };
    if (updates.colors) {
      newTheme.colors = { ...theme.colors, ...updates.colors };
    }
    setTheme(newTheme);
    applyTheme(newTheme);
    localStorage.setItem('bc-theme', JSON.stringify(newTheme));
  };

  const applyPreset = (presetName: string) => {
    const preset = PRESETS[presetName as keyof typeof PRESETS];
    setTheme(preset);
    applyTheme(preset);
    localStorage.setItem('bc-theme', JSON.stringify(preset));
  };

  const resetTheme = () => {
    setTheme(PRESETS.default);
    applyTheme(PRESETS.default);
    localStorage.setItem('bc-theme', JSON.stringify(PRESETS.default));
  };

  return (
    <>
      {/* Palette Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
        title="Customize Theme"
      >
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      </button>

      {/* Customization Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="fixed right-4 top-20 w-96 max-h-[80vh] overflow-y-auto bg-slate-900 border border-white/20 rounded-xl shadow-2xl z-50 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Customize Theme</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/10 rounded transition-colors"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setActiveTab('presets')}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'presets'
                    ? 'bg-yellow-400/20 border border-yellow-400 text-yellow-400'
                    : 'border border-white/10 text-white/60 hover:text-white/80'
                }`}
              >
                Presets
              </button>
              <button
                onClick={() => setActiveTab('custom')}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'custom'
                    ? 'bg-yellow-400/20 border border-yellow-400 text-yellow-400'
                    : 'border border-white/10 text-white/60 hover:text-white/80'
                }`}
              >
                Custom
              </button>
            </div>

            {/* Presets Tab */}
            {activeTab === 'presets' && (
              <div className="space-y-3">
                {Object.keys(PRESETS).map((presetName) => {
                  const preset = PRESETS[presetName as keyof typeof PRESETS];
                  return (
                    <button
                      key={presetName}
                      onClick={() => applyPreset(presetName)}
                      className="w-full p-4 rounded-lg border border-white/10 hover:border-white/30 transition-all text-left"
                      style={{ 
                        background: preset.colors.cardBg,
                        borderColor: preset.colors.cardBorder 
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold capitalize" style={{ color: preset.colors.textPrimary }}>
                          {presetName}
                        </span>
                        <div className="flex gap-1">
                          <div 
                            className="w-4 h-4 rounded-full border border-white/20" 
                            style={{ background: preset.colors.background }}
                          />
                          <div 
                            className="w-4 h-4 rounded-full border border-white/20" 
                            style={{ background: preset.colors.accent }}
                          />
                        </div>
                      </div>
                      <div className="text-xs" style={{ color: preset.colors.textSecondary }}>
                        Click to apply
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Custom Tab */}
            {activeTab === 'custom' && (
              <div className="space-y-4">
                {/* Background Color */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Background Color
                  </label>
                  <input
                    type="color"
                    value={theme.colors.background}
                    onChange={(e) => updateTheme({ colors: { ...theme.colors, background: e.target.value } })}
                    className="w-full h-10 rounded cursor-pointer"
                  />
                </div>

                {/* Card Background */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Card Background (opacity: {Math.round((theme.colors.cardBg.match(/[\d.]+\)$/)?.[0].replace(')', '') || 0.05) * 100)}%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={Math.round((parseFloat(theme.colors.cardBg.match(/[\d.]+\)$/)?.[0].replace(')', '') || '0.05')) * 100)}
                    onChange={(e) => {
                      const opacity = parseInt(e.target.value) / 100;
                      // Extract RGB values from current cardBg or use white as default
                      const rgbMatch = theme.colors.cardBg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
                      const r = rgbMatch ? rgbMatch[1] : '255';
                      const g = rgbMatch ? rgbMatch[2] : '255';
                      const b = rgbMatch ? rgbMatch[3] : '255';
                      updateTheme({ colors: { ...theme.colors, cardBg: `rgba(${r}, ${g}, ${b}, ${opacity})` } });
                    }}
                    className="w-full"
                  />
                </div>

                {/* Accent Color */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Accent Color
                  </label>
                  <input
                    type="color"
                    value={theme.colors.accent}
                    onChange={(e) => updateTheme({ colors: { ...theme.colors, accent: e.target.value } })}
                    className="w-full h-10 rounded cursor-pointer"
                  />
                </div>

                {/* Text Color */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Text Color
                  </label>
                  <input
                    type="color"
                    value={theme.colors.textPrimary}
                    onChange={(e) => updateTheme({ colors: { ...theme.colors, textPrimary: e.target.value } })}
                    className="w-full h-10 rounded cursor-pointer"
                  />
                </div>

                {/* Font Family */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Font Family
                  </label>
                  <select
                    value={theme.fontFamily}
                    onChange={(e) => updateTheme({ fontFamily: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm"
                  >
                    {FONT_OPTIONS.map(font => (
                      <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                        {font.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Font Size */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Font Size
                  </label>
                  <div className="flex gap-2">
                    {(['small', 'medium', 'large'] as const).map(size => (
                      <button
                        key={size}
                        onClick={() => updateTheme({ fontSize: size })}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                          theme.fontSize === size
                            ? 'bg-yellow-400/20 border border-yellow-400 text-yellow-400'
                            : 'border border-white/10 text-white/60 hover:text-white/80'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Reset Button */}
            <button
              onClick={resetTheme}
              className="w-full mt-6 px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-all"
            >
              Reset to Default
            </button>
          </div>
        </>
      )}
    </>
  );
}