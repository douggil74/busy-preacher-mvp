'use client';

import { Prayer, formatPrayerDate } from '@/lib/prayerStorage';

interface PrayerCardProps {
  prayer: Prayer;
  onEdit: (prayer: Prayer) => void;
  onDelete: (id: string) => void;
  onMarkAnswered: (prayer: Prayer) => void;
}

export function PrayerCard({ prayer, onEdit, onDelete, onMarkAnswered }: PrayerCardProps) {
  const isAnswered = prayer.isAnswered;
  
  return (
    <div 
      className={`
        card rounded-2xl p-6 transition-all
        ${isAnswered 
          ? 'border-green-400/30 bg-green-900/20' 
          : ''
        }
      `}
    >
      {isAnswered && (
        <div className="mb-4">
          <span className="inline-block rounded-full bg-green-400/20 border border-green-400/30 text-green-400 text-xs px-3 py-1">
            Answered
          </span>
        </div>
      )}
      
      <h3 className={`text-xl font-semibold mb-3 ${isAnswered ? 'text-green-300' : 'text-white'}`}>
        {prayer.title}
      </h3>
      
      {prayer.description && (
        <p className="text-white/70 text-sm mb-4 leading-relaxed">
          {prayer.description}
        </p>
      )}
      
      {prayer.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {prayer.tags.map(tag => (
            <span 
              key={tag}
              className="inline-block rounded-full bg-white/5 border border-white/10 text-white/70 text-xs px-3 py-1"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      
      {prayer.linkedPassage && (
        <div className="mb-4">
          <a 
            href={`/deep-study?passage=${encodeURIComponent(prayer.linkedPassage)}`}
            className="text-sm text-[#FFD966] hover:text-[#FFD966]/80 transition-colors underline"
          >
            {prayer.linkedPassage}
          </a>
        </div>
      )}
      
      <div className="text-xs text-white/50 mb-4">
        {isAnswered 
          ? `Answered ${formatPrayerDate(prayer.dateAnswered!)}` 
          : `Started ${formatPrayerDate(prayer.dateAdded)}`
        }
      </div>
      
      {isAnswered && prayer.answerNotes && (
        <div className="mb-4 rounded-2xl border border-green-400/30 bg-green-900/20 p-4">
          <p className="text-xs font-semibold text-green-400 mb-2">How God Answered:</p>
          <p className="text-sm text-green-300/90 leading-relaxed">{prayer.answerNotes}</p>
        </div>
      )}
      
      <div className="flex gap-3 pt-4 border-t border-white/10">
        {!isAnswered && (
          <button
            onClick={() => onMarkAnswered(prayer)}
            className="flex-1 rounded-2xl border-2 border-green-400/30 bg-green-400/10 px-4 py-2.5 text-sm font-medium text-green-400 hover:bg-green-400/20 transition-colors"
          >
            Mark Answered
          </button>
        )}
        
        <button
          onClick={() => onEdit(prayer)}
          className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/80 hover:bg-white/10 transition-colors"
        >
          Edit
        </button>
        
        <button
          onClick={() => {
            if (window.confirm(`Delete prayer "${prayer.title}"?`)) {
              onDelete(prayer.id);
            }
          }}
          className="rounded-2xl border border-red-400/30 bg-red-900/20 px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-900/30 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
