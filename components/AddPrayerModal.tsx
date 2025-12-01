'use client';

import { useState, useEffect } from 'react';
import { Playfair_Display } from 'next/font/google';
import { Prayer, PRAYER_TAGS } from '@/lib/prayerStorage';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['600', '700'],
  display: 'swap',
});

interface AddPrayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (prayer: Omit<Prayer, 'id' | 'dateAdded' | 'isAnswered'>) => void;
  editingPrayer?: Prayer | null;
  isAnswering?: boolean;
}

export function AddPrayerModal({ 
  isOpen, 
  onClose, 
  onSave, 
  editingPrayer,
  isAnswering = false 
}: AddPrayerModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [linkedPassage, setLinkedPassage] = useState('');
  const [answerNotes, setAnswerNotes] = useState('');
  const [customTag, setCustomTag] = useState('');
  const [isShared, setIsShared] = useState(false); // ✅ NEW STATE

  useEffect(() => {
    if (editingPrayer) {
      setTitle(editingPrayer.title);
      setDescription(editingPrayer.description);
      setSelectedTags(editingPrayer.tags);
      setLinkedPassage(editingPrayer.linkedPassage || '');
      setAnswerNotes(editingPrayer.answerNotes || '');
      setIsShared(editingPrayer.isShared || false);
    } else {
      setTitle('');
      setDescription('');
      setSelectedTags([]);
      setLinkedPassage('');
      setAnswerNotes('');
      setIsShared(false);
    }
  }, [editingPrayer, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert('Please enter a prayer title');
      return;
    }

    const prayerData: Omit<Prayer, 'id' | 'dateAdded' | 'isAnswered'> = {
      title: title.trim(),
      description: description.trim(),
      tags: selectedTags,
      linkedPassage: linkedPassage.trim() || undefined,
      answerNotes: answerNotes.trim() || undefined,
      isShared, // ✅ SAVE SHARED STATUS
      dateAnswered: isAnswering ? new Date().toISOString() : editingPrayer?.dateAnswered,
    };

    onSave(prayerData);
    onClose();
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const addCustomTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
      setSelectedTags(prev => [...prev, customTag.trim()]);
      setCustomTag('');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide rounded-2xl p-6 shadow-2xl"
        style={{
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-2xl w-8 h-8 flex items-center justify-center rounded-lg transition-all"
          style={{ color: 'var(--text-secondary)' }}
        >
          ×
        </button>

        <div className="mb-6 pr-10">
          <h2
            className={`${playfair.className} text-3xl font-bold mb-2`}
            style={{ color: isAnswering ? '#22c55e' : 'var(--accent-color)' }}
          >
            {isAnswering
              ? '✅ Mark Prayer as Answered'
              : editingPrayer
                ? '✏️ Edit Prayer'
                : '🙏 Add New Prayer'
            }
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {isAnswering
              ? 'Share how God answered this prayer'
              : 'Bring your requests to the Lord with thanksgiving'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Prayer Request *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., For mom's healing, Job interview success..."
              className="input"
              required
              disabled={isAnswering}
            />
          </div>

          {/* Description */}
          {!isAnswering && (
            <div>
              <label htmlFor="description" className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                Details (Optional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add more details about your prayer request..."
                rows={4}
                className="input resize-none"
              />
            </div>
          )}

          {/* Answer Notes */}
          {isAnswering && (
            <div>
              <label htmlFor="answerNotes" className="block text-sm font-semibold text-green-500 mb-2">
                How God Answered This Prayer
              </label>
              <textarea
                id="answerNotes"
                value={answerNotes}
                onChange={(e) => setAnswerNotes(e.target.value)}
                placeholder="Share how God answered this prayer..."
                rows={4}
                className="w-full rounded-2xl border-2 border-green-500/30 bg-green-500/10 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition resize-none"
                style={{ color: 'var(--text-primary)' }}
              />
            </div>
          )}

          {/* Tags */}
          {!isAnswering && (
            <div>
              <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                Categories
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {PRAYER_TAGS.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className="rounded-full px-3 py-1.5 text-sm transition-all font-medium"
                    style={{
                      backgroundColor: selectedTags.includes(tag)
                        ? 'color-mix(in srgb, var(--accent-color) 20%, transparent)'
                        : 'color-mix(in srgb, var(--text-primary) 5%, transparent)',
                      border: selectedTags.includes(tag)
                        ? '2px solid var(--accent-color)'
                        : '2px solid var(--card-border)',
                      color: selectedTags.includes(tag)
                        ? 'var(--accent-color)'
                        : 'var(--text-secondary)',
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Add custom tag */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTag())}
                  placeholder="Add custom category..."
                  className="flex-1 rounded-2xl px-4 py-2 text-sm outline-none transition"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--text-primary) 5%, transparent)',
                    border: '2px solid var(--card-border)',
                    color: 'var(--text-primary)',
                  }}
                />
                <button
                  type="button"
                  onClick={addCustomTag}
                  className="rounded-2xl px-4 py-2 text-sm transition-colors"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--text-primary) 5%, transparent)',
                    border: '1px solid var(--card-border)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  Add
                </button>
              </div>
            </div>
          )}

          {/* ✅ NEW: Share with Community */}
          {!isAnswering && (
            <div className="pt-3">
              <div
                className="rounded-xl p-4"
                style={{
                  background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent-color) 12%, transparent) 0%, transparent 100%)',
                  border: '2px solid color-mix(in srgb, var(--accent-color) 30%, transparent)',
                }}
              >
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isShared}
                    onChange={() => setIsShared(!isShared)}
                    className="w-5 h-5 cursor-pointer"
                    style={{ accentColor: 'var(--accent-color)' }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Share with Community Prayer Network</span>
                      <span className="text-lg">🙏</span>
                    </div>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                      Let others pray alongside you and receive encouragement
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Linked Passage */}
          {!isAnswering && (
            <div>
              <label htmlFor="linkedPassage" className="block text-sm font-semibold mb-2 mt-4" style={{ color: 'var(--text-primary)' }}>
                Link to Scripture (Optional)
              </label>
              <input
                id="linkedPassage"
                type="text"
                value={linkedPassage}
                onChange={(e) => setLinkedPassage(e.target.value)}
                placeholder="e.g., Philippians 4:6-7, Psalm 23..."
                className="input"
              />
              <p className="mt-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                Link this prayer to a Bible passage for context
              </p>
            </div>
          )}

          {/* Footer buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-2xl px-6 py-3 transition-colors"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--text-primary) 5%, transparent)',
                border: '1px solid var(--card-border)',
                color: 'var(--text-secondary)',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-2xl px-6 py-3 font-semibold transition-all hover:scale-[1.02]"
              style={{
                backgroundColor: isAnswering
                  ? 'rgba(34, 197, 94, 0.15)'
                  : 'color-mix(in srgb, var(--accent-color) 15%, transparent)',
                border: isAnswering
                  ? '2px solid rgba(34, 197, 94, 0.3)'
                  : '2px solid var(--accent-color)',
                color: isAnswering ? '#22c55e' : 'var(--accent-color)',
              }}
            >
              {isAnswering ? 'Mark as Answered' : editingPrayer ? 'Save Changes' : 'Add Prayer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
