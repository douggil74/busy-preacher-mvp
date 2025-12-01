'use client';

import { useState } from 'react';
import { X, Mail, MessageSquare, Bug, Lightbulb, HelpCircle, Send } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const contactReasons = [
  { id: 'bug', label: 'Bug Report', icon: Bug, color: '#ef4444' },
  { id: 'feature', label: 'Feature Idea', icon: Lightbulb, color: '#facc15' },
  { id: 'question', label: 'Question', icon: HelpCircle, color: '#3b82f6' },
  { id: 'feedback', label: 'Feedback', icon: MessageSquare, color: '#22c55e' },
];

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const email = 'thebusychristianapp@gmail.com';

  const handleSendEmail = () => {
    const subject = selectedReason
      ? `[${contactReasons.find(r => r.id === selectedReason)?.label}] The Busy Christian App`
      : 'The Busy Christian App - Contact';
    const body = message || '';

    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    onClose();
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-md rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full transition-colors hover:bg-white/10"
        >
          <X className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
            style={{ backgroundColor: 'var(--accent-color)', opacity: 0.2 }}
          >
            <Mail className="w-7 h-7" style={{ color: 'var(--accent-color)' }} />
          </div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Contact Us
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            We'd love to hear from you
          </p>
        </div>

        {/* Reason Selection */}
        <div className="mb-4">
          <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
            What's this about?
          </p>
          <div className="grid grid-cols-2 gap-2">
            {contactReasons.map((reason) => (
              <button
                key={reason.id}
                onClick={() => setSelectedReason(reason.id)}
                className="flex items-center gap-2 p-3 rounded-xl transition-all"
                style={{
                  backgroundColor: selectedReason === reason.id
                    ? `${reason.color}20`
                    : 'var(--bg-color)',
                  border: selectedReason === reason.id
                    ? `2px solid ${reason.color}`
                    : '1px solid var(--card-border)',
                }}
              >
                <reason.icon
                  className="w-4 h-4"
                  style={{ color: selectedReason === reason.id ? reason.color : 'var(--text-secondary)' }}
                />
                <span
                  className="text-sm font-medium"
                  style={{ color: selectedReason === reason.id ? reason.color : 'var(--text-primary)' }}
                >
                  {reason.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Message Input */}
        <div className="mb-4">
          <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
            Your message (optional)
          </p>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us more..."
            rows={3}
            className="w-full p-3 rounded-xl resize-none text-sm"
            style={{
              backgroundColor: 'var(--bg-color)',
              border: '1px solid var(--card-border)',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        {/* Send Button */}
        <button
          onClick={handleSendEmail}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all hover:scale-[1.02]"
          style={{
            backgroundColor: 'var(--accent-color)',
            color: 'var(--bg-color)',
          }}
        >
          <Send className="w-4 h-4" />
          Open Email App
        </button>

        {/* Email Display */}
        <div className="mt-4 text-center">
          <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
            Or email us directly at:
          </p>
          <button
            onClick={handleCopyEmail}
            className="text-sm font-medium underline underline-offset-2 hover:opacity-80 transition-opacity"
            style={{ color: 'var(--accent-color)' }}
            title="Click to copy"
          >
            {email}
          </button>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            (tap to copy)
          </p>
        </div>

        {/* Response Time Note */}
        <div
          className="mt-4 p-3 rounded-xl text-center"
          style={{
            backgroundColor: 'var(--accent-color)',
            opacity: 0.1,
          }}
        >
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            We typically respond within 24-48 hours
          </p>
        </div>
      </div>
    </div>
  );
}
