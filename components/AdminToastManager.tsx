'use client';

import { useState, useEffect } from 'react';
import {
  MessageSquare,
  Plus,
  Trash2,
  Check,
  X,
  Loader2,
  Zap,
  Eye,
  Sparkles,
  Target,
  Clock,
} from 'lucide-react';

interface ToastMessage {
  id: string;
  title: string;
  message: string;
  icon: string;
  trigger: 'welcome_back' | 'streak' | 'milestone' | 'encouragement' | 'random';
  triggerValue?: number;
  isActive: boolean;
  position: 'top' | 'bottom';
  style: 'minimal' | 'card' | 'glass';
  showChance?: number;
}

const EMOJI_OPTIONS = ['👋', '🔥', '🌟', '📖', '💭', '🙏', '❤️', '✨', '🎉', '💪', '🌈', '☀️'];

const TRIGGER_OPTIONS = [
  { value: 'welcome_back', label: 'Welcome Back', desc: 'After 3+ days away', icon: '👋' },
  { value: 'streak', label: 'Streak', desc: '7, 14, 30, 60, 90 days', icon: '🔥' },
  { value: 'milestone', label: 'Milestone', desc: '10, 25, 50, 100 studies', icon: '🌟' },
  { value: 'encouragement', label: 'Encouragement', desc: 'Random boost', icon: '💭' },
  { value: 'random', label: 'Random', desc: 'Chance-based', icon: '🎲' },
];

export default function AdminToastManager() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewToast, setPreviewToast] = useState<ToastMessage | null>(null);

  // New toast form
  const [form, setForm] = useState({
    title: '',
    message: '',
    icon: '💬',
    trigger: 'encouragement' as ToastMessage['trigger'],
    triggerValue: undefined as number | undefined,
    position: 'bottom' as 'top' | 'bottom',
    style: 'card' as 'minimal' | 'card' | 'glass',
    showChance: 10,
  });

  const fetchToasts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/toasts');
      const data = await res.json();
      setToasts(data.toasts || []);
    } catch (error) {
      console.error('Error fetching toasts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchToasts();
  }, []);

  const resetForm = () => {
    setForm({
      title: '',
      message: '',
      icon: '💬',
      trigger: 'encouragement',
      triggerValue: undefined,
      position: 'bottom',
      style: 'card',
      showChance: 10,
    });
    setShowCreate(false);
    setEditingId(null);
  };

  const handleCreate = async () => {
    if (!form.title.trim() || !form.message.trim()) return;
    setSaving(true);
    try {
      await fetch('/api/admin/toasts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      resetForm();
      fetchToasts();
    } catch (error) {
      console.error('Error creating toast:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingId || !form.title.trim() || !form.message.trim()) return;
    setSaving(true);
    try {
      await fetch('/api/admin/toasts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingId, ...form }),
      });
      resetForm();
      fetchToasts();
    } catch (error) {
      console.error('Error updating toast:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (toast: ToastMessage) => {
    try {
      await fetch('/api/admin/toasts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: toast.id, isActive: !toast.isActive }),
      });
      fetchToasts();
    } catch (error) {
      console.error('Error toggling toast:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this toast message?')) return;
    try {
      await fetch(`/api/admin/toasts?id=${id}`, { method: 'DELETE' });
      fetchToasts();
    } catch (error) {
      console.error('Error deleting toast:', error);
    }
  };

  const startEdit = (toast: ToastMessage) => {
    setForm({
      title: toast.title,
      message: toast.message,
      icon: toast.icon,
      trigger: toast.trigger,
      triggerValue: toast.triggerValue,
      position: toast.position,
      style: toast.style,
      showChance: toast.showChance ?? 10,
    });
    setEditingId(toast.id);
    setShowCreate(true);
  };

  const getTriggerIcon = (trigger: string) => {
    return TRIGGER_OPTIONS.find(t => t.value === trigger)?.icon || '💬';
  };

  return (
    <div className="space-y-4">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💬</span>
          <span className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
            Toast Messages
          </span>
          <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-400">
            {toasts.filter(t => t.isActive).length} active
          </span>
        </div>
        <button
          onClick={() => { resetForm(); setShowCreate(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-medium text-sm transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          New Toast
        </button>
      </div>

      {/* Create/Edit Form */}
      {showCreate && (
        <div className="p-4 rounded-2xl space-y-4" style={{ backgroundColor: 'var(--card-hover)', border: '2px solid var(--accent-primary, #8b5cf6)' }}>
          <div className="flex items-center justify-between">
            <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>
              {editingId ? 'Edit Toast' : 'Create New Toast'}
            </h3>
            <button onClick={resetForm} className="p-1 hover:bg-white/10 rounded-lg">
              <X className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
            </button>
          </div>

          {/* Icon Picker */}
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>
              Pick an Icon
            </label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setForm({ ...form, icon: emoji })}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                    form.icon === emoji
                      ? 'bg-purple-500 scale-110 ring-2 ring-purple-400'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Title & Message */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>
                Title (short & sweet)
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Good to see you!"
                maxLength={30}
                className="w-full px-3 py-2 rounded-xl text-sm"
                style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }}
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>
                Message (the encouragement)
              </label>
              <input
                type="text"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Pick up where you left off?"
                maxLength={80}
                className="w-full px-3 py-2 rounded-xl text-sm"
                style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>

          {/* Trigger Type */}
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>
              When should this show?
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {TRIGGER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setForm({ ...form, trigger: opt.value as ToastMessage['trigger'] })}
                  className={`p-3 rounded-xl text-left transition-all ${
                    form.trigger === opt.value
                      ? 'bg-purple-500/20 border-2 border-purple-500'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  <span className="text-xl mb-1 block">{opt.icon}</span>
                  <span className="text-xs font-medium block" style={{ color: 'var(--text-primary)' }}>{opt.label}</span>
                  <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Trigger Value (for streak/milestone) */}
          {(form.trigger === 'streak' || form.trigger === 'milestone') && (
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>
                Specific Number (optional - leave blank for any)
              </label>
              <input
                type="number"
                value={form.triggerValue || ''}
                onChange={(e) => setForm({ ...form, triggerValue: e.target.value ? parseInt(e.target.value) : undefined })}
                placeholder={form.trigger === 'streak' ? 'e.g., 7, 30, 90' : 'e.g., 10, 50, 100'}
                className="w-32 px-3 py-2 rounded-xl text-sm"
                style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }}
              />
            </div>
          )}

          {/* Show Chance (for random/encouragement) */}
          {(form.trigger === 'random' || form.trigger === 'encouragement') && (
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>
                Show Chance: {form.showChance}%
              </label>
              <input
                type="range"
                min="1"
                max="100"
                value={form.showChance}
                onChange={(e) => setForm({ ...form, showChance: parseInt(e.target.value) })}
                className="w-full accent-purple-500"
              />
              <div className="flex justify-between text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                <span>Rare (1%)</span>
                <span>Always (100%)</span>
              </div>
            </div>
          )}

          {/* Style Options */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>
                Position
              </label>
              <div className="flex gap-2">
                {['bottom', 'top'].map((pos) => (
                  <button
                    key={pos}
                    onClick={() => setForm({ ...form, position: pos as 'top' | 'bottom' })}
                    className={`flex-1 py-2 rounded-xl text-xs font-medium capitalize transition-all ${
                      form.position === pos
                        ? 'bg-purple-500 text-white'
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                    style={form.position !== pos ? { color: 'var(--text-primary)' } : {}}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>
                Style
              </label>
              <div className="flex gap-2">
                {['minimal', 'card', 'glass'].map((style) => (
                  <button
                    key={style}
                    onClick={() => setForm({ ...form, style: style as 'minimal' | 'card' | 'glass' })}
                    className={`flex-1 py-2 rounded-xl text-xs font-medium capitalize transition-all ${
                      form.style === style
                        ? 'bg-purple-500 text-white'
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                    style={form.style !== style ? { color: 'var(--text-primary)' } : {}}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>
              Preview
            </label>
            <div className="p-3 rounded-2xl" style={{ backgroundColor: 'var(--bg-primary)' }}>
              <ToastPreview
                title={form.title || 'Your title here'}
                message={form.message || 'Your message here'}
                icon={form.icon}
                style={form.style}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={editingId ? handleUpdate : handleCreate}
              disabled={saving || !form.title.trim() || !form.message.trim()}
              className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 text-white rounded-xl font-medium transition-all"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : editingId ? 'Save Changes' : 'Create Toast'}
            </button>
            <button
              onClick={resetForm}
              className="px-6 py-3 rounded-xl font-medium"
              style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Toast List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      ) : toasts.length === 0 ? (
        <div className="text-center py-8">
          <Sparkles className="w-12 h-12 mx-auto mb-3 text-purple-400" />
          <p className="font-medium" style={{ color: 'var(--text-primary)' }}>No toasts yet</p>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Create your first encouraging message!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`p-4 rounded-xl transition-all ${!toast.isActive ? 'opacity-50' : ''}`}
              style={{ backgroundColor: 'var(--card-hover)' }}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{toast.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                      {toast.title}
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
                      {getTriggerIcon(toast.trigger)} {toast.trigger.replace('_', ' ')}
                      {toast.triggerValue ? ` @ ${toast.triggerValue}` : ''}
                    </span>
                    {(toast.trigger === 'random' || toast.trigger === 'encouragement') && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                        {toast.showChance}% chance
                      </span>
                    )}
                  </div>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                    {toast.message}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                    <span className="capitalize">{toast.position}</span>
                    <span>•</span>
                    <span className="capitalize">{toast.style}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPreviewToast(toast)}
                    className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
                    title="Preview"
                  >
                    <Eye className="w-4 h-4 text-blue-500" />
                  </button>
                  <button
                    onClick={() => startEdit(toast)}
                    className="p-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 transition-colors"
                    title="Edit"
                  >
                    <Zap className="w-4 h-4 text-purple-500" />
                  </button>
                  <button
                    onClick={() => handleToggle(toast)}
                    className={`p-2 rounded-lg transition-colors ${toast.isActive ? 'bg-green-500/10 hover:bg-green-500/20' : 'bg-gray-500/10 hover:bg-gray-500/20'}`}
                    title={toast.isActive ? 'Turn off' : 'Turn on'}
                  >
                    {toast.isActive ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <X className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(toast.id)}
                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Live Preview Modal */}
      {previewToast && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center p-4" onClick={() => setPreviewToast(null)}>
          <div className="w-full max-w-md mb-20" onClick={(e) => e.stopPropagation()}>
            <ToastPreview
              title={previewToast.title}
              message={previewToast.message}
              icon={previewToast.icon}
              style={previewToast.style}
              onDismiss={() => setPreviewToast(null)}
            />
          </div>
        </div>
      )}

      {/* Helper Text */}
      <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30">
        <p className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
          Toasts show once per day max. Welcome back triggers after 3+ days away.
          <br />Streaks: 7, 14, 30, 60, 90 days. Milestones: 10, 25, 50, 100+ studies.
        </p>
      </div>
    </div>
  );
}

// Toast Preview Component
function ToastPreview({
  title,
  message,
  icon,
  style,
  onDismiss,
}: {
  title: string;
  message: string;
  icon: string;
  style: 'minimal' | 'card' | 'glass';
  onDismiss?: () => void;
}) {
  const styleClasses = {
    minimal: 'bg-slate-800/95 border border-slate-700',
    card: 'bg-gradient-to-r from-slate-800 to-slate-900 border-2 border-yellow-400/30 shadow-lg shadow-yellow-400/10',
    glass: 'bg-white/10 backdrop-blur-xl border border-white/20',
  };

  return (
    <div className={`rounded-2xl p-4 ${styleClasses[style]} animate-in fade-in slide-in-from-bottom-4 duration-300`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-white text-sm">{title}</h4>
          <p className="text-white/70 text-sm mt-0.5">{message}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1 hover:bg-white/10 rounded-full transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4 text-white/50" />
          </button>
        )}
      </div>
    </div>
  );
}
