'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface PastoralContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  isCrisis: boolean;
  sessionId: string;
  firstName: string;
}

export default function PastoralContactModal({
  isOpen,
  onClose,
  isCrisis,
  sessionId,
  firstName,
}: PastoralContactModalProps) {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      return; // Email is required
    }

    setSubmitting(true);

    try {
      // Save contact info to the conversation
      await fetch('/api/pastoral-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          firstName,
          email: email.trim(),
          phone: phone.trim(),
        }),
      });

      onClose();
    } catch (error) {
      console.error('Failed to save contact info:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="max-w-md w-full rounded-2xl shadow-2xl overflow-hidden"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderWidth: '2px',
          borderStyle: 'solid',
          borderColor: isCrisis ? '#dc2626' : '#f59e0b',
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-4"
          style={{
            backgroundColor: isCrisis ? '#dc2626' : '#f59e0b',
          }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white mb-1">
                {isCrisis ? '🤍 I Care About You' : '💬 Let Me Help Personally'}
              </h2>
              <p className="text-sm text-white/90">
                {isCrisis
                  ? "I'm genuinely concerned and want to support you personally"
                  : "This feels like something we should talk about face-to-face"}
              </p>
            </div>
            <button
              onClick={handleSkip}
              className="ml-2 p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-sm mb-4" style={{ color: 'var(--text-primary)' }}>
            {isCrisis ? (
              <>
                While the AI can provide guidance, I really want to be there for you personally.
                <strong className="block mt-2">Would you let me reach out to check on you?</strong>
              </>
            ) : (
              <>
                The AI did its best, but some things are better talked through in person.
                <strong className="block mt-2">Want to continue this conversation with me directly?</strong>
              </>
            )}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                required
                className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                style={{
                  backgroundColor: 'var(--input-bg)',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: 'var(--input-border)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Phone Number <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>(optional)</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 123-4567"
                className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                style={{
                  backgroundColor: 'var(--input-bg)',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: 'var(--input-border)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                🔒 Your contact info is kept private and only shared with Pastor Doug.
                You'll also be able to message back and forth through the app.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting || !email.trim()}
                className="flex-1 px-4 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                style={{
                  backgroundColor: isCrisis ? '#dc2626' : '#f59e0b',
                  color: 'white',
                }}
              >
                {submitting ? 'Saving...' : 'Yes, Please Reach Out'}
              </button>
            </div>

            <button
              type="button"
              onClick={handleSkip}
              className="w-full text-sm underline transition-colors"
              style={{ color: 'var(--text-secondary)' }}
            >
              No thanks, I prefer to stay anonymous
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
