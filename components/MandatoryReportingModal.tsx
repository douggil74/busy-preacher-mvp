'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

interface MandatoryReportingModalProps {
  isOpen: boolean;
  onSubmit: (info: {
    fullName: string;
    age: string;
    phone: string;
    address: string;
    googleEmail?: string;
  }) => void;
  sessionId: string;
  userEmail?: string;
}

export default function MandatoryReportingModal({
  isOpen,
  onSubmit,
  sessionId,
  userEmail,
}: MandatoryReportingModalProps) {
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Pre-fill email if signed in with Google
  useEffect(() => {
    if (isOpen && !fullName && !age && !phone && !address) {
      // Try to get saved info
      const savedName = localStorage.getItem('bc-user-fullname') || '';
      const savedAge = localStorage.getItem('bc-user-age') || '';
      const savedPhone = localStorage.getItem('bc-user-phone') || '';
      const savedAddress = localStorage.getItem('bc-user-address') || '';

      setFullName(savedName);
      setAge(savedAge);
      setPhone(savedPhone);
      setAddress(savedAddress);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // All fields are optional - just send whatever they provided
    setSubmitting(true);

    try {
      // Save to localStorage
      localStorage.setItem('bc-user-fullname', fullName.trim());
      localStorage.setItem('bc-user-age', age.trim());
      localStorage.setItem('bc-user-phone', phone.trim());
      localStorage.setItem('bc-user-address', address.trim());

      // Send to API
      await fetch('/api/mandatory-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          fullName: fullName.trim(),
          age: age.trim(),
          phone: phone.trim(),
          address: address.trim(),
          googleEmail: userEmail || null,
        }),
      });

      onSubmit({
        fullName: fullName.trim(),
        age: age.trim(),
        phone: phone.trim(),
        address: address.trim(),
        googleEmail: userEmail,
      });
    } catch (error) {
      console.error('Failed to submit mandatory report:', error);
      alert('Failed to submit information. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="max-w-md w-full rounded-2xl shadow-xl overflow-hidden"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: 'var(--card-border)',
        }}
      >
        {/* Header - Red for emergency/mandatory */}
        <div
          className="px-6 py-5"
          style={{
            background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
          }}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-white flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-white mb-1">
                Mandatory Reporting Required
              </h2>
              <p className="text-sm text-white/90">
                By law, I must report child abuse to authorities
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4 p-3 rounded-lg" style={{
            backgroundColor: 'color-mix(in srgb, #10b981 15%, var(--card-bg))',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: 'color-mix(in srgb, #10b981 30%, transparent)'
          }}>
            <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              <strong>✅ Pastor Doug has been notified</strong>
            </p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              He already has your conversation and technical information for authorities.
              <br/><br/>
              <strong>Optional:</strong> You can provide additional contact info below if you want him to reach out directly. Otherwise, you can skip this.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Full Name <span className="text-xs opacity-60">(optional)</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="First and Last Name"
                className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
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
                Age <span className="text-xs opacity-60">(optional)</span>
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Your age"
                min="0"
                max="17"
                className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
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
                Phone Number <span className="text-xs opacity-60">(optional)</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 123-4567"
                className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
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
                Address / Location <span className="text-xs opacity-60">(optional)</span>
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street address, city, and zip code"
                rows={3}
                className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                style={{
                  backgroundColor: 'var(--input-bg)',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: 'var(--input-border)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>

            {userEmail && (
              <div className="rounded-lg p-3" style={{
                backgroundColor: 'color-mix(in srgb, var(--accent-color) 10%, transparent)',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: 'color-mix(in srgb, var(--accent-color) 30%, transparent)'
              }}>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  ✓ Signed in as: <strong>{userEmail}</strong>
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !fullName.trim() || !age.trim() || !phone.trim() || !address.trim()}
              className="w-full px-4 py-3 rounded-lg font-semibold transition-all disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                color: 'white',
              }}
            >
              {submitting ? 'Sending...' : 'Send My Info (Optional)'}
            </button>

            <button
              type="button"
              onClick={() => onSubmit({ fullName: '', age: '', phone: '', address: '', googleEmail: userEmail })}
              className="w-full text-sm underline transition-colors"
              style={{ color: 'var(--text-secondary)' }}
            >
              Skip - Pastor already has what he needs
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
