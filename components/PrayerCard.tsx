'use client';

import { Prayer, formatPrayerDate } from '@/lib/prayerStorage';

type Props = {
  prayer: Prayer;
  onEdit: (p: Prayer) => void;
  onDelete: (id: string) => void;
  onMarkAnswered: (p: Prayer) => void;
};

export function PrayerCard({ prayer, onEdit, onDelete, onMarkAnswered }: Props) {
  const isAnswered = prayer.isAnswered;

  return (
    <div
      className={`rounded-3xl p-6 border border-white/10 bg-white/5 backdrop-blur-sm transition-all shadow-md hover:shadow-lg ${
        isAnswered ? 'border-green-400/40 bg-green-900/20' : 'hover:border-yellow-400/30'
      }`}
    >
      {/* Badges */}
      <div className="mb-3 flex items-center gap-2">
        {isAnswered && (
          <span className="inline-block rounded-full bg-green-400/20 border border-green-400/30 text-green-400 text-xs px-3 py-1">
            Answered
          </span>
        )}
        {prayer.isShared && (
          <span className="inline-flex items-center gap-1 rounded-full bg-white/10 border border-white/15 text-white/70 text-xs px-3 py-1">
            🌍 Shared
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className={`text-xl font-semibold mb-2 ${isAnswered ? 'text-green-300' : 'text-white'}`}>
        {prayer.title}
      </h3>

      {/* Description */}
      {prayer.description && (
        <p className="text-white/70 text-sm mb-4">{prayer.description}</p>
      )}

      {/* Tags */}
      {prayer.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {prayer.tags.map((tag) => (
            <span
              key={tag}
              className="inline-block rounded-full bg-white/5 border border-white/10 text-white/60 text-xs px-3 py-1"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Meta */}
      <div className="text-xs text-white/50 mb-4">
        {isAnswered
          ? `Answered ${prayer.dateAnswered ? formatPrayerDate(prayer.dateAnswered) : ''}`
          : `Added ${formatPrayerDate(prayer.dateAdded)}`}
      </div>

      {/* Actions */}
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
            if (window.confirm(`Delete prayer "${prayer.title}"?`)) onDelete(prayer.id);
          }}
          className="rounded-2xl border border-red-400/30 bg-red-900/20 px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-900/30 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
