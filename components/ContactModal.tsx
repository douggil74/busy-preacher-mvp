'use client';

import { useState, useEffect } from 'react';
import { X, Send } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Pre-fill with any saved contact info when modal opens
  useEffect(() => {
    if (isOpen) {
      const savedEmail = localStorage.getItem('bc-user-email') || '';
      const savedName = localStorage.getItem('bc-user-name') || '';
      setEmail(savedEmail);
      setName(savedName);
      setMessage('');
      setSubmitted(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !message.trim()) {
      return;
    }

    setSubmitting(true);

    try {
      // Save contact info to localStorage
      localStorage.setItem('bc-user-email', email.trim());
      if (name.trim()) {
        localStorage.setItem('bc-user-name', name.trim());
      }

      // Send the contact form
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        // Fallback to mailto
        const subject = 'The Busy Christian App - Contact';
        const body = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
        window.location.href = `mailto:thebusychristianapp@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        onClose();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Fallback to mailto
      const subject = 'The Busy Christian App - Contact';
      const body = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
      window.location.href = `mailto:thebusychristianapp@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      onClose();
    } finally {
      setSubmitting(false);
    }
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
        {/* Header */}
        <div
          className="px-6 py-5"
          style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-white mb-1">
                📬 Get in Touch
              </h2>
              <p className="text-sm text-white/90">
                Questions, ideas, or feedback? We'd love to hear from you.
              </p>
            </div>
            <button
              onClick={onClose}
              className="ml-2 p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {submitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✓</span>
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                Message Sent!
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                We'll get back to you within 24-48 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Your Name <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>(optional)</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John"
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
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="What's on your mind? Bug reports, feature ideas, questions..."
                  required
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
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
                  📧 We typically respond within 24-48 hours. Thanks for your patience!
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting || !email.trim() || !message.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 hover:opacity-90"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: 'white',
                }}
              >
                <Send className="w-4 h-4" />
                {submitting ? 'Sending...' : 'Send Message'}
              </button>

              <p className="text-center text-xs" style={{ color: 'var(--text-secondary)' }}>
                Or email us directly at{' '}
                <a
                  href="mailto:thebusychristianapp@gmail.com"
                  className="underline hover:opacity-80"
                  style={{ color: 'var(--accent-color)' }}
                >
                  thebusychristianapp@gmail.com
                </a>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
