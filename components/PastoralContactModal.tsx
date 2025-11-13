'use client';

import { useState, useEffect } from 'react';
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

  // Pre-fill with any saved contact info when modal opens
  useEffect(() => {
    if (isOpen) {
      const savedEmail = localStorage.getItem('bc-user-email') || '';
      const savedPhone = localStorage.getItem('bc-user-phone') || '';
      setEmail(savedEmail);
      setPhone(savedPhone);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      return; // Email is required
    }

    setSubmitting(true);

    try {
      // Save contact info to localStorage for future use
      localStorage.setItem('bc-user-email', email.trim());
      if (phone.trim()) {
        localStorage.setItem('bc-user-phone', phone.trim());
      }

      // Save contact info to the conversation in Supabase
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div
        className="max-w-md w-full rounded-2xl shadow-xl overflow-hidden"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: 'var(--card-border)',
        }}
      >
        {/* Header - Softer, more gentle */}
        <div
          className="px-6 py-5"
          style={{
            background: isCrisis
              ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' // Soft purple gradient for crisis
              : 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)', // Soft teal-blue for serious
          }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-white mb-1">
                {isCrisis ? "💙 I'm Here for You" : "🤝 Let's Talk"}
              </h2>
              <p className="text-sm text-white/90">
                {isCrisis
                  ? "I care about you and want to help personally"
                  : "This might be something we should talk through together"}
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

            <div className="rounded-lg p-3" style={{
              backgroundColor: 'color-mix(in srgb, var(--accent-color) 10%, transparent)',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'color-mix(in srgb, var(--accent-color) 30%, transparent)'
            }}>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                🔒 Your contact info is kept private and only shared with Pastor Doug.
                You'll also be able to message back and forth through the app.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting || !email.trim()}
                className="flex-1 px-4 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 hover:opacity-90"
                style={{
                  background: isCrisis
                    ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                    : 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
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
