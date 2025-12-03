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
  // Midday weather (8am-5pm)
  { id: 'sunny', name: 'Sunny', category: 'weather' },
  { id: 'partly-cloudy', name: 'Partly Cloudy', category: 'weather' },
  { id: 'cloudy', name: 'Cloudy', category: 'weather' },
  { id: 'rainy', name: 'Rainy', category: 'weather' },
  { id: 'stormy', name: 'Stormy', category: 'weather' },
  { id: 'snowy', name: 'Snowy', category: 'weather' },
  { id: 'foggy', name: 'Foggy', category: 'weather' },
  { id: 'night-clear', name: 'Night Clear', category: 'weather' },
  { id: 'night-cloudy', name: 'Night Cloudy', category: 'weather' },
  // Morning variants (5am-8am)
  { id: 'sunny-morning', name: 'Sunny Morning', category: 'morning' },
  { id: 'partly-cloudy-morning', name: 'Partly Cloudy Morning', category: 'morning' },
  { id: 'cloudy-morning', name: 'Cloudy Morning', category: 'morning' },
  { id: 'rainy-morning', name: 'Rainy Morning', category: 'morning' },
  { id: 'snowy-morning', name: 'Snowy Morning', category: 'morning' },
  { id: 'foggy-morning', name: 'Foggy Morning', category: 'morning' },
  // Evening variants (5pm-8pm)
  { id: 'sunny-evening', name: 'Sunny Evening', category: 'evening' },
  { id: 'partly-cloudy-evening', name: 'Partly Cloudy Evening', category: 'evening' },
  { id: 'cloudy-evening', name: 'Cloudy Evening', category: 'evening' },
  { id: 'rainy-evening', name: 'Rainy Evening', category: 'evening' },
  { id: 'snowy-evening', name: 'Snowy Evening', category: 'evening' },
  { id: 'foggy-evening', name: 'Foggy Evening', category: 'evening' },
  // Severe weather
  { id: 'tornado', name: 'Tornado Warning', category: 'severe' },
  { id: 'hurricane', name: 'Hurricane Warning', category: 'severe' },
  // Holidays
  { id: 'christmas', name: 'Christmas', category: 'holiday' },
  { id: 'thanksgiving', name: 'Thanksgiving', category: 'holiday' },
  { id: 'easter', name: 'Easter', category: 'holiday' },
  { id: 'new-years', name: 'New Years', category: 'holiday' },
  { id: 'valentines', name: 'Valentines', category: 'holiday' },
] as const;

type SceneId = typeof ALL_SCENES[number]['id'];

interface SavedScene {
  id: string;
  name: string;
  prompt: string;
  type: 'svg' | 'image';
  svg: string | null;
  imageUrl: string | null;
  createdAt: string;
}

interface SceneSettings {
  disabledScenes: SceneId[];
  savedScenes: SavedScene[];
  customOverride: {
    enabled: boolean;
    sceneId: SceneId | null;
    expiresAt: string | null; // ISO date string
    customPrompt: string | null;
    customSvg: string | null; // AI-generated SVG content
    customImageUrl: string | null; // DALL-E generated image URL
  };
}

const DEFAULT_SETTINGS: SceneSettings = {
  disabledScenes: [],
  savedScenes: [],
  customOverride: {
    enabled: false,
    sceneId: null,
    expiresAt: null,
    customPrompt: null,
    customSvg: null,
    customImageUrl: null,
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
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [generatedType, setGeneratedType] = useState<'svg' | 'image' | null>(null);
  const [generationStyle, setGenerationStyle] = useState<'svg' | 'realistic'>('realistic');
  const [sceneName, setSceneName] = useState('');

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
        customImageUrl: null,
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

  // Generate custom scene with OpenAI (SVG or DALL-E based on style selection)
  const generateCustomScene = async () => {
    if (!customPrompt.trim()) {
      alert('Please enter a description for the custom scene');
      return;
    }

    setGeneratingCustom(true);
    setGeneratedSvg(null);
    setGeneratedImageUrl(null);
    setGeneratedType(null);
    try {
      const response = await fetch('/api/generate-scene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: customPrompt.trim(), style: generationStyle }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate scene');
      }

      // Handle both SVG and image responses
      if (data.type === 'image' && data.imageUrl) {
        setGeneratedImageUrl(data.imageUrl);
        setGeneratedType('image');
      } else if (data.svg) {
        setGeneratedSvg(data.svg);
        setGeneratedType('svg');
      }
    } catch (err: any) {
      console.error('Error generating custom scene:', err);
      alert(`Failed to generate custom scene: ${err.message}`);
    } finally {
      setGeneratingCustom(false);
    }
  };

  // Clear generated content
  const clearGenerated = () => {
    setGeneratedSvg(null);
    setGeneratedImageUrl(null);
    setGeneratedType(null);
  };

  // Apply generated custom scene as override
  const applyCustomScene = async () => {
    if (!generatedSvg && !generatedImageUrl) return;

    const expiresAt = new Date(Date.now() + overrideHours * 60 * 60 * 1000).toISOString();
    await saveSettings({
      ...settings,
      customOverride: {
        enabled: true,
        sceneId: 'custom' as any,
        expiresAt,
        customPrompt: customPrompt.trim(),
        customSvg: generatedSvg,
        customImageUrl: generatedImageUrl,
      },
    });
    alert('Custom scene applied as override!');
  };

  // Save generated scene to library
  const saveToLibrary = async () => {
    if ((!generatedSvg && !generatedImageUrl) || !sceneName.trim()) {
      alert('Please generate a scene and enter a name');
      return;
    }

    const newScene: SavedScene = {
      id: `scene_${Date.now()}`,
      name: sceneName.trim(),
      prompt: customPrompt.trim(),
      type: generatedType || 'svg',
      svg: generatedSvg,
      imageUrl: generatedImageUrl,
      createdAt: new Date().toISOString(),
    };

    const updatedSavedScenes = [...(settings.savedScenes || []), newScene];
    await saveSettings({
      ...settings,
      savedScenes: updatedSavedScenes,
    });
    setSceneName('');
    alert('Scene saved to library!');
  };

  // Delete saved scene
  const deleteSavedScene = async (sceneId: string) => {
    if (!confirm('Delete this saved scene?')) return;

    const updatedSavedScenes = (settings.savedScenes || []).filter(s => s.id !== sceneId);
    await saveSettings({
      ...settings,
      savedScenes: updatedSavedScenes,
    });
  };

  // Apply saved scene as override
  const applySavedScene = async (scene: SavedScene) => {
    const expiresAt = new Date(Date.now() + overrideHours * 60 * 60 * 1000).toISOString();
    await saveSettings({
      ...settings,
      customOverride: {
        enabled: true,
        sceneId: 'custom' as any,
        expiresAt,
        customPrompt: scene.prompt,
        customSvg: scene.svg,
        customImageUrl: scene.imageUrl,
      },
    });
    alert(`"${scene.name}" applied as override!`);
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
              <div className="absolute inset-0">
                <WeatherScene type={selectedScene as SceneType} />
              </div>
              {/* Scene name overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                <h2 className="text-xl font-bold text-white">
                  {ALL_SCENES.find(s => s.id === selectedScene)?.name}
                </h2>
              </div>
            </div>

            {/* Scene Selector Buttons */}
            <div className="flex flex-wrap gap-2 mb-6">
              {ALL_SCENES.map((scene) => {
                const isSelected = selectedScene === scene.id;
                let buttonClass = '';

                if (isSelected) {
                  if (scene.category === 'severe') buttonClass = 'bg-red-500 text-white';
                  else if (scene.category === 'morning') buttonClass = 'bg-orange-400 text-slate-900';
                  else if (scene.category === 'evening') buttonClass = 'bg-purple-500 text-white';
                  else buttonClass = 'bg-yellow-400 text-slate-900';
                } else {
                  if (scene.category === 'severe') buttonClass = 'bg-red-500/20 text-red-400 hover:bg-red-500/30';
                  else if (scene.category === 'morning') buttonClass = 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30';
                  else if (scene.category === 'evening') buttonClass = 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30';
                  else buttonClass = 'bg-white/10 text-white hover:bg-white/20';
                }

                return (
                  <button
                    key={scene.id}
                    onClick={() => setSelectedScene(scene.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${buttonClass}`}
                  >
                    {scene.name}
                  </button>
                );
              })}
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
                        {timeRemaining} hour{timeRemaining !== 1 ? 's' : ''} remaining
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
                  Describe a custom scene and AI will generate it. Use DALL-E for high-quality images or SVG for animated graphics.
                </p>

                {/* Quick Suggestions */}
                <div>
                  <p className="text-xs text-white/40 mb-2">Quick ideas:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Peaceful mountain sunrise',
                      'Gentle ocean waves at dusk',
                      'Northern lights over a calm lake',
                      'Cherry blossoms floating in spring breeze',
                      'Starry night with shooting star',
                      'Misty forest at dawn',
                      'Golden wheat field at sunset',
                      'Raindrops on window with warm glow'
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => setCustomPrompt(suggestion)}
                        className="px-2 py-1 text-xs bg-purple-500/10 text-purple-300 rounded hover:bg-purple-500/20 transition"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Style Selection */}
                <div className="flex items-center gap-3">
                  <label className="text-sm text-white/60">Style:</label>
                  <select
                    value={generationStyle}
                    onChange={(e) => setGenerationStyle(e.target.value as 'svg' | 'realistic')}
                    className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white"
                  >
                    <option value="realistic">Realistic (DALL-E)</option>
                    <option value="svg">Animated SVG</option>
                  </select>
                  <span className="text-xs text-white/40">
                    {generationStyle === 'realistic'
                      ? 'High-quality photorealistic images'
                      : 'Lightweight animated vector graphics'
                    }
                  </span>
                </div>

                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Describe your scene... Be specific about colors, mood, and elements you want."
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 min-h-[100px]"
                />

                <div className="flex gap-2">
                  <button
                    onClick={generateCustomScene}
                    disabled={generatingCustom || !customPrompt.trim()}
                    className="flex-1 px-4 py-2.5 bg-purple-500/20 border border-purple-500/40 text-purple-400 rounded-lg font-medium hover:bg-purple-500/30 transition disabled:opacity-50"
                  >
                    {generatingCustom ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        {generationStyle === 'realistic' ? 'Generating with DALL-E...' : 'Generating SVG...'}
                      </span>
                    ) : (generatedSvg || generatedImageUrl) ? 'Regenerate' : 'Generate Scene'}
                  </button>
                  {(generatedSvg || generatedImageUrl) && (
                    <button
                      onClick={clearGenerated}
                      className="px-4 py-2.5 bg-white/5 border border-white/20 text-white/60 rounded-lg hover:bg-white/10 transition"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Generated Preview - SVG or Image */}
                {(generatedSvg || generatedImageUrl) && (
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-green-400">
                        Generated {generatedType === 'image' ? 'Image (DALL-E)' : 'Scene (SVG)'}:
                      </h3>
                      <span className="text-xs text-white/40">Click "Regenerate" for a different version</span>
                    </div>

                    {generatedType === 'image' && generatedImageUrl ? (
                      <div className="relative h-44 rounded-xl overflow-hidden border-2 border-green-500/30 bg-slate-800">
                        <img
                          src={generatedImageUrl}
                          alt="Generated scene"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : generatedSvg ? (
                      <div
                        className="relative h-44 rounded-xl overflow-hidden border-2 border-green-500/30 bg-slate-800"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        dangerouslySetInnerHTML={{ __html: generatedSvg }}
                      />
                    ) : null}

                    <div className="flex gap-2">
                      <select
                        value={overrideHours}
                        onChange={(e) => setOverrideHours(Number(e.target.value))}
                        className="px-3 py-2.5 bg-white/10 border border-white/20 rounded-lg text-sm"
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
                        className="flex-1 px-4 py-2.5 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition disabled:opacity-50"
                      >
                        {saving ? 'Applying...' : 'Apply to App'}
                      </button>
                    </div>

                    {/* Save to Library */}
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <p className="text-xs text-white/50 mb-2">Save to library for later use:</p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={sceneName}
                          onChange={(e) => setSceneName(e.target.value)}
                          placeholder="Scene name..."
                          className="flex-1 px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-sm text-white placeholder-white/40"
                        />
                        <button
                          onClick={saveToLibrary}
                          disabled={saving || !sceneName.trim()}
                          className="px-4 py-2 bg-blue-500/20 border border-blue-500/40 text-blue-400 rounded-lg font-medium hover:bg-blue-500/30 transition disabled:opacity-50"
                        >
                          {saving ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Saved Scenes Library */}
              {(settings.savedScenes?.length || 0) > 0 && (
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-4">
                  <h2 className="text-lg font-semibold text-blue-400">Saved Scenes Library</h2>
                  <p className="text-sm text-white/60">
                    Your saved custom scenes. Click to preview, apply, or delete.
                  </p>

                  <div className="grid gap-3">
                    {settings.savedScenes?.map((scene) => (
                      <div
                        key={scene.id}
                        className="p-3 bg-white/5 border border-white/10 rounded-lg hover:border-white/20 transition"
                      >
                        <div className="flex gap-3">
                          {/* Preview Thumbnail */}
                          <div className="w-24 h-16 rounded overflow-hidden flex-shrink-0 bg-slate-800">
                            {scene.type === 'image' && scene.imageUrl ? (
                              <img
                                src={scene.imageUrl}
                                alt={scene.name}
                                className="w-full h-full object-cover"
                              />
                            ) : scene.svg ? (
                              <div
                                className="w-full h-full"
                                dangerouslySetInnerHTML={{ __html: scene.svg }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white/30 text-xs">
                                No preview
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-white truncate">{scene.name}</h3>
                            <p className="text-xs text-white/50 truncate">{scene.prompt}</p>
                            <p className="text-xs text-white/30 mt-1">
                              {scene.type === 'image' ? 'DALL-E' : 'SVG'} • {new Date(scene.createdAt).toLocaleDateString()}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => applySavedScene(scene)}
                              disabled={saving}
                              className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition disabled:opacity-50"
                            >
                              Apply
                            </button>
                            <button
                              onClick={() => deleteSavedScene(scene.id)}
                              disabled={saving}
                              className="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition disabled:opacity-50"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                  <h3 className="text-sm font-medium text-white/80 mt-4">Weather (Midday)</h3>
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

                  <h3 className="text-sm font-medium text-orange-400 mt-4">Morning (5am-8am)</h3>
                  {ALL_SCENES.filter(s => s.category === 'morning').map(scene => (
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

                  <h3 className="text-sm font-medium text-purple-400 mt-4">Evening (5pm-8pm)</h3>
                  {ALL_SCENES.filter(s => s.category === 'evening').map(scene => (
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
