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

  useEffect(() => {
    if (editingPrayer) {
      setTitle(editingPrayer.title);
      setDescription(editingPrayer.description);
      setSelectedTags(editingPrayer.tags);
      setLinkedPassage(editingPrayer.linkedPassage || '');
      setAnswerNotes(editingPrayer.answerNotes || '');
    } else {
      setTitle('');
      setDescription('');
      setSelectedTags([]);
      setLinkedPassage('');
      setAnswerNotes('');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-slate-900/95 backdrop-blur-xl p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-white/60 hover:text-white text-2xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-all"
        >
          ×
        </button>

        <div className="mb-6 pr-10">
          <h2 className={`${playfair.className} text-3xl font-bold mb-2 ${isAnswering ? 'text-green-400' : 'text-[#FFD966]'}`}>
            {isAnswering 
              ? '✅ Mark Prayer as Answered' 
              : editingPrayer 
                ? '✏️ Edit Prayer' 
                : '🙏 Add New Prayer'
            }
          </h2>
          <p className="text-white/60 text-sm">
            {isAnswering 
              ? 'Share how God answered this prayer' 
              : 'Bring your requests to the Lord with thanksgiving'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-white/90 mb-2">
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

          {!isAnswering && (
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-white/90 mb-2">
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

          {isAnswering && (
            <div>
              <label htmlFor="answerNotes" className="block text-sm font-semibold text-green-400 mb-2">
                How God Answered This Prayer
              </label>
              <textarea
                id="answerNotes"
                value={answerNotes}
                onChange={(e) => setAnswerNotes(e.target.value)}
                placeholder="Share how God answered this prayer... What happened? How did He provide?"
                rows={4}
                className="w-full rounded-2xl border-2 border-green-400/30 bg-green-900/20 px-4 py-3 text-base outline-none text-green-300 placeholder:text-green-700 focus:ring-2 focus:ring-green-400/50 focus:border-green-400 transition resize-none"
              />
            </div>
          )}

          {!isAnswering && (
            <div>
              <label className="block text-sm font-semibold text-white/90 mb-3">
                Categories
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {PRAYER_TAGS.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`
                      rounded-full px-3 py-1.5 text-sm border-2 transition-all font-medium
                      ${selectedTags.includes(tag)
                        ? 'bg-[#FFD966]/20 border-[#FFD966] text-[#FFD966]'
                        : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20'
                      }
                    `}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTag())}
                  placeholder="Add custom category..."
                  className="flex-1 rounded-2xl border-2 border-white/10 bg-white/5 px-4 py-2 text-sm outline-none text-white placeholder:text-white/40 focus:ring-2 focus:ring-[#FFD966]/50 focus:border-[#FFD966] transition"
                />
                <button
                  type="button"
                  onClick={addCustomTag}
                  className="btn rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          {!isAnswering && (
            <div>
              <label htmlFor="linkedPassage" className="block text-sm font-semibold text-white/90 mb-2">
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
              <p className="mt-1.5 text-xs text-white/50">
                Link this prayer to a Bible passage for context
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-white/80 hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`
                flex-1 btn rounded-2xl px-6 py-3 font-semibold transition-all
                ${isAnswering
                  ? 'border-2 border-green-400/30 bg-green-400/10 text-green-400 hover:bg-green-400/20'
                  : 'border-2 border-[#FFD966] bg-[#FFD966]/10 text-[#FFD966] hover:bg-[#FFD966]/20'
                }
              `}
            >
              {isAnswering ? 'Mark as Answered' : editingPrayer ? 'Save Changes' : 'Add Prayer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
