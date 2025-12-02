'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Phone, MessageCircle, ExternalLink } from 'lucide-react';

interface CrisisDisclaimerModalProps {
  isOpen: boolean;
  onAccept: () => void;
  userName?: string;
}

export default function CrisisDisclaimerModal({ isOpen, onAccept, userName }: CrisisDisclaimerModalProps) {
  const [agreed, setAgreed] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div
        className="relative w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        style={{
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
        }}
      >
        {/* Header */}
        <div className="p-6 text-center" style={{ borderBottom: '1px solid var(--card-border)' }}>
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/10 flex items-center justify-center">
            <MessageCircle className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Before You Begin
          </h2>
          {userName && (
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Welcome, {userName}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Crisis Alert Box */}
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-red-500">In a Crisis?</p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                  This is not an emergency service. If you're in immediate danger:
                </p>
                <div className="mt-3 space-y-2">
                  <a
                    href="tel:911"
                    className="flex items-center gap-2 text-sm font-medium text-red-500 hover:text-red-400"
                  >
                    <Phone className="w-4 h-4" />
                    Call 911 for emergencies
                  </a>
                  <a
                    href="tel:988"
                    className="flex items-center gap-2 text-sm font-medium text-red-500 hover:text-red-400"
                  >
                    <Phone className="w-4 h-4" />
                    Call 988 - Suicide & Crisis Lifeline
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* What This Is */}
          <div>
            <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              What This Feature Is
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              AI-assisted spiritual guidance based on biblical principles. A tool for exploring faith
              questions and finding encouragement.
            </p>
          </div>

          {/* What This Is NOT */}
          <div>
            <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              What This Feature Is NOT
            </h3>
            <ul className="space-y-1.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <li className="flex items-start gap-2">
                <span className="text-red-400">✗</span>
                Professional mental health counseling or therapy
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400">✗</span>
                Medical advice or diagnosis
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400">✗</span>
                A substitute for licensed professional care
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400">✗</span>
                An emergency response service
              </li>
            </ul>
          </div>

          {/* Important Notes */}
          <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Important to Know
            </h3>
            <ul className="space-y-1.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <li className="flex items-start gap-2">
                <span className="text-amber-400">•</span>
                AI may not recognize all signs of crisis
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400">•</span>
                Conversations may be monitored for safety
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400">•</span>
                Reports of child abuse trigger mandatory reporting
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400">•</span>
                Seek professional help for serious mental health concerns
              </li>
            </ul>
          </div>

          {/* Agreement Checkbox */}
          <label className="flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-colors hover:bg-white/5"
            style={{ border: agreed ? '2px solid var(--accent-color)' : '2px solid var(--card-border)' }}
          >
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 w-5 h-5 rounded border-2 text-amber-500 focus:ring-amber-500 focus:ring-offset-0 cursor-pointer"
              style={{ borderColor: 'var(--card-border)', backgroundColor: 'var(--bg-primary)' }}
            />
            <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
              I understand this is AI spiritual guidance, not professional counseling,
              and I will call 988 or 911 if I am in crisis.
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="p-6" style={{ borderTop: '1px solid var(--card-border)' }}>
          <button
            onClick={onAccept}
            disabled={!agreed}
            className="w-full py-4 rounded-xl font-semibold text-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              backgroundColor: agreed ? 'var(--accent-color)' : 'var(--card-border)',
              color: agreed ? 'white' : 'var(--text-secondary)',
            }}
          >
            Continue to Guidance
          </button>

          {/* Links */}
          <div className="flex items-center justify-center gap-4 mt-4">
            <Link
              href="/legal"
              target="_blank"
              className="text-xs flex items-center gap-1 hover:underline"
              style={{ color: 'var(--text-secondary)' }}
            >
              Full Disclaimer
              <ExternalLink className="w-3 h-3" />
            </Link>
            <Link
              href="/privacy"
              target="_blank"
              className="text-xs flex items-center gap-1 hover:underline"
              style={{ color: 'var(--text-secondary)' }}
            >
              Privacy Policy
              <ExternalLink className="w-3 h-3" />
            </Link>
            <Link
              href="/terms"
              target="_blank"
              className="text-xs flex items-center gap-1 hover:underline"
              style={{ color: 'var(--text-secondary)' }}
            >
              Terms
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
