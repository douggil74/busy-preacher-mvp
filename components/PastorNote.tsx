'use client';

import { useEffect, useState } from 'react';
import { getPastorNote, getEncouragingWord } from '@/lib/personalMessages';

interface PastorNoteProps {
  variant?: 'note' | 'encouragement';
  className?: string;
}

export function PastorNote({ variant = 'note', className = '' }: PastorNoteProps) {
  const [message, setMessage] = useState('');

  useEffect(() => {
    setMessage(variant === 'note' ? getPastorNote() : getEncouragingWord());
  }, [variant]);

  if (!message) return null;

  return (
    <div className={`p-4 bg-yellow-400/10 border border-yellow-400/30 rounded-xl ${className}`}>
      <p className="text-white/90 text-sm italic">{message}</p>
    </div>
  );
}
