'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AdminAuth from '@/components/AdminAuth';
import WeatherHeader, { WeatherScene, SceneType } from '@/components/WeatherHeader';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// All available scene types
const ALL_SCENES = [
  { id: 'sunny', name: 'Sunny', category: 'weather' },
  { id: 'partly-cloudy', name: 'Partly Cloudy', category: 'weather' },
  { id: 'cloudy', name: 'Cloudy', category: 'weather' },
  { id: 'rainy', name: 'Rainy', category: 'weather' },
  { id: 'stormy', name: 'Stormy', category: 'weather' },
  { id: 'snowy', name: 'Snowy', category: 'weather' },
  { id: 'foggy', name: 'Foggy', category: 'weather' },
  { id: 'night-clear', name: 'Night Clear', category: 'weather' },
  { id: 'night-cloudy', name: 'Night Cloudy', category: 'weather' },
  { id: 'christmas', name: 'Christmas', category: 'holiday' },
  { id: 'thanksgiving', name: 'Thanksgiving', category: 'holiday' },
  { id: 'easter', name: 'Easter', category: 'holiday' },
  { id: 'new-years', name: 'New Years', category: 'holiday' },
  { id: 'valentines', name: 'Valentines', category: 'holiday' },
] as const;

type SceneId = typeof ALL_SCENES[number]['id'];

interface SceneSettings {
  disabledScenes: SceneId[];
  customOverride: {
    enabled: boolean;
    sceneId: SceneId | null;
    expiresAt: string | null; // ISO date string
    customPrompt: string | null;
  };
}

const DEFAULT_SETTINGS: SceneSettings = {
  disabledScenes: [],
  customOverride: {
    enabled: false,
    sceneId: null,
    expiresAt: null,
    customPrompt: null,
  },
};

export default function AdminScenesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedScene, setSelectedScene] = useState<SceneId>('sunny');
  const [settings, setSettings] = useState<SceneSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [overrideHours, setOverrideHours] = useState(24);
  const [generatingCustom, setGeneratingCustom] = useState(false);

  // Load settings from Firestore
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'scenes');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSettings(docSnap.data() as SceneSettings);
        }
      } catch (err) {
        console.error('Error loading scene settings:', err);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  // Save settings to Firestore
  const saveSettings = async (newSettings: SceneSettings) => {
    setSaving(true);
    try {
      console.log('Saving settings:', newSettings);
      await setDoc(doc(db, 'settings', 'scenes'), newSettings, { merge: true });
      setSettings(newSettings);
      console.log('Settings saved successfully');
    } catch (err: any) {
      console.error('Error saving scene settings:', err);
      console.error('Error code:', err?.code);
      console.error('Error message:', err?.message);
      alert(`Failed to save settings: ${err?.message || 'Unknown error'}. Check Firestore rules.`);
    } finally {
      setSaving(false);
    }
  };

  // Toggle scene enabled/disabled
  const toggleScene = (sceneId: SceneId) => {
    const newDisabled = settings.disabledScenes.includes(sceneId)
      ? settings.disabledScenes.filter(s => s !== sceneId)
      : [...settings.disabledScenes, sceneId];
    saveSettings({ ...settings, disabledScenes: newDisabled });
  };

  // Set manual override
  const setOverride = (sceneId: SceneId | null) => {
    const expiresAt = sceneId
      ? new Date(Date.now() + overrideHours * 60 * 60 * 1000).toISOString()
      : null;
    saveSettings({
      ...settings,
      customOverride: {
        enabled: !!sceneId,
        sceneId,
        expiresAt,
        customPrompt: null,
      },
    });
  };

  // Clear override
  const clearOverride = () => {
    saveSettings({
      ...settings,
      customOverride: DEFAULT_SETTINGS.customOverride,
    });
  };

  // Generate custom scene with OpenAI (placeholder for future implementation)
  const generateCustomScene = async () => {
    if (!customPrompt.trim()) {
      alert('Please enter a description for the custom scene');
      return;
    }

    setGeneratingCustom(true);
    try {
      // TODO: Call OpenAI API to generate custom SVG
      // For now, just show the prompt was received
      alert(`Custom scene generation coming soon!\n\nYour prompt: "${customPrompt}"\n\nFor now, you can select a pre-built scene as an override.`);
    } catch (err) {
      console.error('Error generating custom scene:', err);
      alert('Failed to generate custom scene');
    } finally {
      setGeneratingCustom(false);
    }
  };

  // Check if override has expired
  const isOverrideActive = settings.customOverride.enabled &&
    settings.customOverride.expiresAt &&
    new Date(settings.customOverride.expiresAt) > new Date();

  const timeRemaining = isOverrideActive && settings.customOverride.expiresAt
    ? Math.max(0, Math.round((new Date(settings.customOverride.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60)))
    : 0;

  if (loading) {
    return (
      <AdminAuth>
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
          <div className="animate-pulse">Loading...</div>
        </div>
      </AdminAuth>
    );
  }

  return (
    <AdminAuth>
      <div className="min-h-screen bg-slate-950 text-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <button
                onClick={() => router.push('/admin')}
                className="text-white/60 hover:text-white mb-2 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Admin
              </button>
              <h1 className="text-2xl font-bold">Weather & Holiday Scenes</h1>
              <p className="text-white/60 text-sm">Preview, enable/disable, and customize scenes</p>
            </div>
          </div>

          {/* Active Override Banner */}
          {isOverrideActive && (
            <div className="mb-6 p-4 bg-yellow-400/20 border border-yellow-400/40 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-yellow-400 font-semibold">Override Active</h3>
                  <p className="text-white/70 text-sm">
                    Showing "{settings.customOverride.sceneId}" for {timeRemaining} more hours
                  </p>
                </div>
                <button
                  onClick={clearOverride}
                  className="px-4 py-2 bg-red-500/20 border border-red-500/40 rounded-lg text-red-400 hover:bg-red-500/30 transition"
                >
                  Clear Override
                </button>
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Preview Panel */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-yellow-400">Preview</h2>

              {/* Scene Selector */}
              <div className="flex gap-2 flex-wrap">
                <select
                  value={selectedScene}
                  onChange={(e) => setSelectedScene(e.target.value as SceneId)}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                >
                  <optgroup label="Weather">
                    {ALL_SCENES.filter(s => s.category === 'weather').map(scene => (
                      <option key={scene.id} value={scene.id}>{scene.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Holidays">
                    {ALL_SCENES.filter(s => s.category === 'holiday').map(scene => (
                      <option key={scene.id} value={scene.id}>{scene.name}</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Preview Container */}
              <div
                className="relative h-48 rounded-2xl overflow-hidden border border-white/10"
                style={{ backgroundColor: 'var(--card-bg)' }}
              >
                <ScenePreview sceneId={selectedScene} />
              </div>

              {/* Override Controls */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-4">
                <h3 className="font-medium">Manual Override</h3>
                <div className="flex gap-2 items-center">
                  <label className="text-sm text-white/60">Duration:</label>
                  <select
                    value={overrideHours}
                    onChange={(e) => setOverrideHours(Number(e.target.value))}
                    className="px-3 py-1 bg-white/10 border border-white/20 rounded text-sm"
                  >
                    <option value={1}>1 hour</option>
                    <option value={6}>6 hours</option>
                    <option value={12}>12 hours</option>
                    <option value={24}>24 hours</option>
                    <option value={48}>48 hours</option>
                    <option value={168}>1 week</option>
                  </select>
                </div>
                <button
                  onClick={() => setOverride(selectedScene)}
                  disabled={saving}
                  className="w-full px-4 py-2 bg-yellow-400 text-slate-900 rounded-lg font-medium hover:bg-yellow-300 transition disabled:opacity-50"
                >
                  {saving ? 'Saving...' : `Set "${ALL_SCENES.find(s => s.id === selectedScene)?.name}" as Override`}
                </button>
              </div>
            </div>

            {/* Settings Panel */}
            <div className="space-y-6">
              {/* Custom Scene Generator */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-4">
                <h2 className="text-lg font-semibold text-yellow-400">Custom Scene (Coming Soon)</h2>
                <p className="text-sm text-white/60">
                  Describe a custom scene and AI will generate it for you.
                </p>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="e.g., A peaceful sunrise over mountains with birds flying..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 min-h-[100px]"
                />
                <button
                  onClick={generateCustomScene}
                  disabled={generatingCustom || !customPrompt.trim()}
                  className="w-full px-4 py-2 bg-purple-500/20 border border-purple-500/40 text-purple-400 rounded-lg font-medium hover:bg-purple-500/30 transition disabled:opacity-50"
                >
                  {generatingCustom ? 'Generating...' : 'Generate Custom Scene'}
                </button>
              </div>

              {/* Scene Enable/Disable */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-4">
                <h2 className="text-lg font-semibold text-yellow-400">Enable/Disable Scenes</h2>
                <p className="text-sm text-white/60">
                  Disabled scenes won't appear even when conditions match.
                </p>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-white/80 mt-4">Weather</h3>
                  {ALL_SCENES.filter(s => s.category === 'weather').map(scene => (
                    <label
                      key={scene.id}
                      className="flex items-center justify-between p-2 hover:bg-white/5 rounded cursor-pointer"
                    >
                      <span className="text-sm">{scene.name}</span>
                      <input
                        type="checkbox"
                        checked={!settings.disabledScenes.includes(scene.id)}
                        onChange={() => toggleScene(scene.id)}
                        className="w-4 h-4 rounded border-white/20 bg-white/5 text-yellow-400 focus:ring-yellow-400"
                      />
                    </label>
                  ))}

                  <h3 className="text-sm font-medium text-white/80 mt-4">Holidays</h3>
                  {ALL_SCENES.filter(s => s.category === 'holiday').map(scene => (
                    <label
                      key={scene.id}
                      className="flex items-center justify-between p-2 hover:bg-white/5 rounded cursor-pointer"
                    >
                      <span className="text-sm">{scene.name}</span>
                      <input
                        type="checkbox"
                        checked={!settings.disabledScenes.includes(scene.id)}
                        onChange={() => toggleScene(scene.id)}
                        className="w-4 h-4 rounded border-white/20 bg-white/5 text-yellow-400 focus:ring-yellow-400"
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminAuth>
  );
}

// Scene Preview Component - renders the selected scene
function ScenePreview({ sceneId }: { sceneId: string }) {
  return (
    <div className="absolute inset-0">
      {/* We'll create a standalone preview version */}
      <WeatherPreviewScene type={sceneId} />
    </div>
  );
}

// Simplified preview scene renderer
function WeatherPreviewScene({ type }: { type: string }) {
  // Import the scene colors and render logic
  const colors: Record<string, { primary: string; secondary: string; accent: string }> = {
    sunny: { primary: '#D4890D', secondary: '#E9A825', accent: '#F5C842' },
    'partly-cloudy': { primary: '#546E7A', secondary: '#607D8B', accent: '#78909C' },
    cloudy: { primary: '#455A64', secondary: '#546E7A', accent: '#607D8B' },
    rainy: { primary: '#3F51B5', secondary: '#5C6BC0', accent: '#7986CB' },
    stormy: { primary: '#37474F', secondary: '#455A64', accent: '#FFC107' },
    snowy: { primary: '#64B5F6', secondary: '#90CAF9', accent: '#BBDEFB' },
    'night-clear': { primary: '#5E35B1', secondary: '#7E57C2', accent: '#FFB300' },
    'night-cloudy': { primary: '#3F51B5', secondary: '#5C6BC0', accent: '#7986CB' },
    foggy: { primary: '#78909C', secondary: '#90A4AE', accent: '#B0BEC5' },
    tornado: { primary: '#455A64', secondary: '#546E7A', accent: '#78909C' },
    hurricane: { primary: '#37474F', secondary: '#455A64', accent: '#607D8B' },
    christmas: { primary: '#C62828', secondary: '#2E7D32', accent: '#FFD700' },
    thanksgiving: { primary: '#E65100', secondary: '#BF360C', accent: '#FFB300' },
    easter: { primary: '#AB47BC', secondary: '#7CB342', accent: '#FFEB3B' },
    'new-years': { primary: '#FFD700', secondary: '#C0C0C0', accent: '#FFFFFF' },
    valentines: { primary: '#E91E63', secondary: '#F48FB1', accent: '#FF4081' },
  };

  const c = colors[type] || colors['partly-cloudy'];

  return (
    <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id={`preview-gradient-${type}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={c.primary} stopOpacity="0.15" />
          <stop offset="100%" stopColor={c.secondary} stopOpacity="0.05" />
        </linearGradient>
        <filter id="preview-glow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect width="800" height="200" fill={`url(#preview-gradient-${type})`} />

      {/* Scene label */}
      <text x="400" y="180" textAnchor="middle" fill={c.accent} fontSize="14" opacity="0.8">
        {type.replace('-', ' ').toUpperCase()}
      </text>

      {/* Simple scene indicators */}
      {type === 'sunny' && (
        <g>
          <circle cx="680" cy="70" r="40" fill={c.accent} opacity="0.4" />
          <circle cx="680" cy="70" r="30" fill="none" stroke={c.primary} strokeWidth="3" />
        </g>
      )}

      {type === 'night-clear' && (
        <g>
          <circle cx="680" cy="70" r="28" fill="none" stroke={c.accent} strokeWidth="2.5" opacity="0.75" />
          {[100, 200, 300, 400, 500, 600].map((x, i) => (
            <circle key={i} cx={x} cy={40 + (i % 3) * 30} r="3" fill={c.accent} opacity="0.7" className="animate-twinkle" style={{ animationDelay: `${i * 0.3}s` }} />
          ))}
        </g>
      )}

      {type === 'christmas' && (
        <g transform="translate(650, 20)">
          <polygon points="50,0 90,100 10,100" fill={c.secondary} opacity="0.8" />
          <polygon points="50,0 53,10 63,10 55,16 58,26 50,20 42,26 45,16 37,10 47,10" fill={c.accent} />
          <circle cx="35" cy="60" r="5" fill={c.primary} />
          <circle cx="65" cy="50" r="5" fill={c.accent} />
        </g>
      )}

      {type === 'thanksgiving' && (
        <g transform="translate(620, 40)">
          <ellipse cx="80" cy="50" rx="50" ry="60" fill={c.secondary} opacity="0.6" />
          <ellipse cx="80" cy="50" rx="40" ry="50" fill={c.primary} opacity="0.7" />
          <ellipse cx="40" cy="80" rx="30" ry="25" fill="#8B4513" opacity="0.8" />
        </g>
      )}

      {type === 'easter' && (
        <g>
          <g transform="translate(650, 30)">
            <rect x="-4" y="0" width="8" height="80" fill={c.primary} opacity="0.7" />
            <rect x="-25" y="20" width="50" height="8" fill={c.primary} opacity="0.7" />
          </g>
          {[100, 250, 400, 550].map((x, i) => (
            <ellipse key={i} cx={x} cy={120} rx="15" ry="20" fill={i % 2 === 0 ? c.primary : c.secondary} opacity="0.8" />
          ))}
        </g>
      )}

      {type === 'new-years' && (
        <g>
          {[150, 350, 550, 700].map((x, i) => (
            <g key={i} className="animate-twinkle" style={{ animationDelay: `${i * 0.5}s` }}>
              {[...Array(8)].map((_, j) => (
                <line
                  key={j}
                  x1={x} y1={70}
                  x2={x + Math.cos(j * Math.PI / 4) * 30}
                  y2={70 + Math.sin(j * Math.PI / 4) * 30}
                  stroke={j % 2 === 0 ? c.primary : c.accent}
                  strokeWidth="2"
                />
              ))}
            </g>
          ))}
        </g>
      )}

      {type === 'valentines' && (
        <g>
          {[100, 250, 400, 550, 700].map((x, i) => (
            <path
              key={i}
              d={`M${x} 70 C${x - 15} 50 ${x - 25} 70 ${x} 100 C${x + 25} 70 ${x + 15} 50 ${x} 70`}
              fill={i % 2 === 0 ? c.primary : c.secondary}
              opacity="0.7"
              className="animate-float"
              style={{ animationDelay: `${i * 0.3}s` }}
            />
          ))}
        </g>
      )}

      {(type === 'rainy' || type === 'stormy') && (
        <g>
          {[...Array(20)].map((_, i) => (
            <line
              key={i}
              x1={40 + i * 40}
              y1={0}
              x2={40 + i * 40 - 10}
              y2={200}
              stroke={c.secondary}
              strokeWidth="1.5"
              opacity="0.4"
            />
          ))}
        </g>
      )}

      {type === 'snowy' && (
        <g>
          {[...Array(15)].map((_, i) => (
            <circle
              key={i}
              cx={50 + i * 50}
              cy={30 + (i % 4) * 40}
              r="4"
              fill={c.accent}
              opacity="0.7"
            />
          ))}
        </g>
      )}

      {type === 'cloudy' && (
        <g>
          {[50, 300, 550].map((x, i) => (
            <ellipse key={i} cx={x + 100} cy={80} rx="80" ry="40" fill={c.secondary} opacity="0.4" />
          ))}
        </g>
      )}

      {type === 'foggy' && (
        <g>
          {[...Array(5)].map((_, i) => (
            <rect key={i} x="0" y={30 + i * 35} width="800" height="25" fill={c.secondary} opacity={0.15 - i * 0.02} />
          ))}
        </g>
      )}
    </svg>
  );
}
