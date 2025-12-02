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
  { id: 'tornado', name: 'Tornado Warning', category: 'severe' },
  { id: 'hurricane', name: 'Hurricane Warning', category: 'severe' },
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
    customSvg: string | null; // AI-generated SVG content
  };
}

const DEFAULT_SETTINGS: SceneSettings = {
  disabledScenes: [],
  customOverride: {
    enabled: false,
    sceneId: null,
    expiresAt: null,
    customPrompt: null,
    customSvg: null,
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
  const [generatedSvg, setGeneratedSvg] = useState<string | null>(null);

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
        customSvg: null,
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

  // Generate custom scene with OpenAI
  const generateCustomScene = async () => {
    if (!customPrompt.trim()) {
      alert('Please enter a description for the custom scene');
      return;
    }

    setGeneratingCustom(true);
    setGeneratedSvg(null);
    try {
      const response = await fetch('/api/generate-scene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: customPrompt.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate scene');
      }

      setGeneratedSvg(data.svg);
    } catch (err: any) {
      console.error('Error generating custom scene:', err);
      alert(`Failed to generate custom scene: ${err.message}`);
    } finally {
      setGeneratingCustom(false);
    }
  };

  // Apply generated custom scene as override
  const applyCustomScene = async () => {
    if (!generatedSvg) return;

    const expiresAt = new Date(Date.now() + overrideHours * 60 * 60 * 1000).toISOString();
    await saveSettings({
      ...settings,
      customOverride: {
        enabled: true,
        sceneId: 'custom' as any,
        expiresAt,
        customPrompt: customPrompt.trim(),
        customSvg: generatedSvg,
      },
    });
    alert('Custom scene applied as override!');
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

          {/* Large Preview at Top */}
          <div className="mb-8">
            {/* Preview Container - Large */}
            <div className="relative h-56 md:h-72 rounded-2xl overflow-hidden border border-white/20 mb-4">
              <ScenePreview sceneId={selectedScene} />
              {/* Scene name overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                <h2 className="text-xl font-bold text-white">
                  {ALL_SCENES.find(s => s.id === selectedScene)?.name}
                </h2>
              </div>
            </div>

            {/* Scene Selector Buttons */}
            <div className="flex flex-wrap gap-2 mb-6">
              {ALL_SCENES.map((scene) => (
                <button
                  key={scene.id}
                  onClick={() => setSelectedScene(scene.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    selectedScene === scene.id
                      ? scene.category === 'severe'
                        ? 'bg-red-500 text-white'
                        : 'bg-yellow-400 text-slate-900'
                      : scene.category === 'severe'
                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                        : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {scene.name}
                </button>
              ))}
            </div>

            {/* Override Controls - Prominent */}
            <div className="p-5 bg-white/5 border border-white/10 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-yellow-400">Scene Override</h3>
                {isOverrideActive && (
                  <span className="px-3 py-1 bg-green-500/20 border border-green-500/40 rounded-full text-green-400 text-sm font-medium">
                    Active
                  </span>
                )}
              </div>

              {/* Active Override Status */}
              {isOverrideActive ? (
                <div className="mb-4 p-4 bg-yellow-400/10 border border-yellow-400/30 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-400 font-medium">
                        Currently showing: {settings.customOverride.sceneId}
                      </p>
                      <p className="text-white/60 text-sm mt-1">
                        ⏱️ {timeRemaining} hour{timeRemaining !== 1 ? 's' : ''} remaining
                      </p>
                      {settings.customOverride.expiresAt && (
                        <p className="text-white/40 text-xs mt-1">
                          Expires: {new Date(settings.customOverride.expiresAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={clearOverride}
                      className="px-4 py-2 bg-red-500/20 border border-red-500/40 rounded-lg text-red-400 hover:bg-red-500/30 transition"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-white/50 text-sm mb-4">
                  No override active. Weather scenes will show based on current conditions.
                </p>
              )}

              {/* Set New Override */}
              <div className="flex flex-wrap gap-3 items-center">
                <span className="text-sm text-white/60">Set override for:</span>
                <select
                  value={overrideHours}
                  onChange={(e) => setOverrideHours(Number(e.target.value))}
                  className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm"
                >
                  <option value={1}>1 hour</option>
                  <option value={6}>6 hours</option>
                  <option value={12}>12 hours</option>
                  <option value={24}>24 hours</option>
                  <option value={48}>2 days</option>
                  <option value={168}>1 week</option>
                  <option value={720}>1 month</option>
                </select>
                <button
                  onClick={() => setOverride(selectedScene)}
                  disabled={saving}
                  className="flex-1 min-w-[200px] px-4 py-2 bg-yellow-400 text-slate-900 rounded-lg font-medium hover:bg-yellow-300 transition disabled:opacity-50"
                >
                  {saving ? 'Saving...' : `Override with "${ALL_SCENES.find(s => s.id === selectedScene)?.name}"`}
                </button>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Settings Panel */}
            <div className="space-y-6">
              {/* Custom Scene Generator */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-4">
                <h2 className="text-lg font-semibold text-purple-400">AI Custom Scene Generator</h2>
                <p className="text-sm text-white/60">
                  Describe a custom scene and AI will generate it for you.
                </p>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="e.g., A peaceful sunrise over mountains with birds flying..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 min-h-[80px]"
                />
                <button
                  onClick={generateCustomScene}
                  disabled={generatingCustom || !customPrompt.trim()}
                  className="w-full px-4 py-2 bg-purple-500/20 border border-purple-500/40 text-purple-400 rounded-lg font-medium hover:bg-purple-500/30 transition disabled:opacity-50"
                >
                  {generatingCustom ? 'Generating... (may take 10-15 seconds)' : 'Generate Custom Scene'}
                </button>

                {/* Generated SVG Preview */}
                {generatedSvg && (
                  <div className="mt-4 space-y-3">
                    <h3 className="text-sm font-medium text-green-400">Generated Scene Preview:</h3>
                    <div
                      className="relative h-32 rounded-lg overflow-hidden border border-green-500/30 bg-slate-800"
                      dangerouslySetInnerHTML={{ __html: generatedSvg }}
                    />
                    <div className="flex gap-2">
                      <select
                        value={overrideHours}
                        onChange={(e) => setOverrideHours(Number(e.target.value))}
                        className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm"
                      >
                        <option value={1}>1 hour</option>
                        <option value={6}>6 hours</option>
                        <option value={12}>12 hours</option>
                        <option value={24}>24 hours</option>
                        <option value={48}>2 days</option>
                        <option value={168}>1 week</option>
                        <option value={720}>1 month</option>
                      </select>
                      <button
                        onClick={applyCustomScene}
                        disabled={saving}
                        className="flex-1 px-4 py-2 bg-green-500/20 border border-green-500/40 text-green-400 rounded-lg font-medium hover:bg-green-500/30 transition disabled:opacity-50"
                      >
                        {saving ? 'Applying...' : 'Apply as Override'}
                      </button>
                    </div>
                    <button
                      onClick={() => setGeneratedSvg(null)}
                      className="w-full px-4 py-2 text-sm text-white/50 hover:text-white/70 transition"
                    >
                      Discard & Try Again
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Enable/Disable Panel */}
            <div className="space-y-6">
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

                  <h3 className="text-sm font-medium text-red-400 mt-4">Severe Weather Warnings</h3>
                  {ALL_SCENES.filter(s => s.category === 'severe').map(scene => (
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

// Scene Preview Component - renders the selected scene using actual WeatherScene
function ScenePreview({ sceneId }: { sceneId: string }) {
  return (
    <div className="absolute inset-0">
      <WeatherScene type={sceneId as SceneType} />
    </div>
  );
}
