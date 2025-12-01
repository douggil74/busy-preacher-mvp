'use client';

import { useState, useEffect } from 'react';
import { X, BookOpen, RefreshCw } from 'lucide-react';

// Collection of inspirational verses
const dailyVerses = [
  { reference: "Psalm 23:1", text: "The Lord is my shepherd; I shall not want." },
  { reference: "Jeremiah 29:11", text: "For I know the plans I have for you, declares the Lord, plans for welfare and not for evil, to give you a future and a hope." },
  { reference: "Philippians 4:13", text: "I can do all things through him who strengthens me." },
  { reference: "Isaiah 41:10", text: "Fear not, for I am with you; be not dismayed, for I am your God; I will strengthen you, I will help you, I will uphold you with my righteous right hand." },
  { reference: "Romans 8:28", text: "And we know that for those who love God all things work together for good, for those who are called according to his purpose." },
  { reference: "Proverbs 3:5-6", text: "Trust in the Lord with all your heart, and do not lean on your own understanding. In all your ways acknowledge him, and he will make straight your paths." },
  { reference: "Matthew 11:28", text: "Come to me, all who labor and are heavy laden, and I will give you rest." },
  { reference: "John 3:16", text: "For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life." },
  { reference: "Psalm 46:1", text: "God is our refuge and strength, a very present help in trouble." },
  { reference: "2 Corinthians 12:9", text: "But he said to me, 'My grace is sufficient for you, for my power is made perfect in weakness.'" },
  { reference: "Joshua 1:9", text: "Have I not commanded you? Be strong and courageous. Do not be frightened, and do not be dismayed, for the Lord your God is with you wherever you go." },
  { reference: "Psalm 27:1", text: "The Lord is my light and my salvation; whom shall I fear? The Lord is the stronghold of my life; of whom shall I be afraid?" },
  { reference: "Romans 15:13", text: "May the God of hope fill you with all joy and peace in believing, so that by the power of the Holy Spirit you may abound in hope." },
  { reference: "Psalm 119:105", text: "Your word is a lamp to my feet and a light to my path." },
  { reference: "Isaiah 40:31", text: "But they who wait for the Lord shall renew their strength; they shall mount up with wings like eagles; they shall run and not be weary; they shall walk and not faint." },
  { reference: "1 Peter 5:7", text: "Casting all your anxieties on him, because he cares for you." },
  { reference: "Hebrews 11:1", text: "Now faith is the assurance of things hoped for, the conviction of things not seen." },
  { reference: "Psalm 34:8", text: "Oh, taste and see that the Lord is good! Blessed is the man who takes refuge in him!" },
  { reference: "John 14:27", text: "Peace I leave with you; my peace I give to you. Not as the world gives do I give to you. Let not your hearts be troubled, neither let them be afraid." },
  { reference: "Lamentations 3:22-23", text: "The steadfast love of the Lord never ceases; his mercies never come to an end; they are new every morning; great is your faithfulness." },
  { reference: "Galatians 5:22-23", text: "But the fruit of the Spirit is love, joy, peace, patience, kindness, goodness, faithfulness, gentleness, self-control." },
  { reference: "Psalm 37:4", text: "Delight yourself in the Lord, and he will give you the desires of your heart." },
  { reference: "Ephesians 2:8-9", text: "For by grace you have been saved through faith. And this is not your own doing; it is the gift of God, not a result of works, so that no one may boast." },
  { reference: "1 John 4:19", text: "We love because he first loved us." },
  { reference: "Psalm 91:1-2", text: "He who dwells in the shelter of the Most High will abide in the shadow of the Almighty. I will say to the Lord, 'My refuge and my fortress, my God, in whom I trust.'" },
  { reference: "James 1:5", text: "If any of you lacks wisdom, let him ask God, who gives generously to all without reproach, and it will be given him." },
  { reference: "Matthew 6:33", text: "But seek first the kingdom of God and his righteousness, and all these things will be added to you." },
  { reference: "Colossians 3:23", text: "Whatever you do, work heartily, as for the Lord and not for men." },
  { reference: "Psalm 100:4-5", text: "Enter his gates with thanksgiving, and his courts with praise! Give thanks to him; bless his name! For the Lord is good; his steadfast love endures forever." },
  { reference: "2 Timothy 1:7", text: "For God gave us a spirit not of fear but of power and love and self-control." },
  { reference: "1 Thessalonians 5:16-18", text: "Rejoice always, pray without ceasing, give thanks in all circumstances; for this is the will of God in Christ Jesus for you." },
];

// Get verse based on day of year (changes daily)
function getDailyVerse() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return dailyVerses[dayOfYear % dailyVerses.length];
}

interface DailyVerseCardProps {
  onDismiss?: () => void;
  onStudyVerse?: (reference: string) => void;
}

export default function DailyVerseCard({ onDismiss, onStudyVerse }: DailyVerseCardProps) {
  const [verse, setVerse] = useState(getDailyVerse());
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if dismissed today
    const lastDismissed = localStorage.getItem('bc-daily-verse-dismissed');
    if (lastDismissed) {
      const dismissedDate = new Date(lastDismissed);
      const today = new Date();
      if (dismissedDate.toDateString() === today.toDateString()) {
        setDismissed(true);
      }
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('bc-daily-verse-dismissed', new Date().toISOString());
    onDismiss?.();
  };

  const handleStudy = () => {
    onStudyVerse?.(verse.reference);
  };

  if (dismissed) return null;

  return (
    <div
      className="rounded-2xl p-5 relative overflow-hidden transition-all duration-300 hover:scale-[1.01]"
      style={{
        background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent-color) 12%, var(--card-bg)) 0%, var(--card-bg) 100%)',
        border: '1px solid color-mix(in srgb, var(--accent-color) 25%, transparent)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
      }}
    >
      {/* Decorative glow */}
      <div
        className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-15 pointer-events-none"
        style={{ backgroundColor: 'var(--accent-color)' }}
      />

      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 p-1.5 rounded-lg transition-all hover:bg-white/10 z-20"
        style={{ color: 'var(--text-secondary)' }}
        title="Dismiss for today"
        aria-label="Dismiss verse of the day"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-4 h-4" style={{ color: 'var(--accent-color)' }} />
          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: 'var(--accent-color)' }}
          >
            Verse of the Day
          </span>
        </div>

        {/* Verse Text */}
        <p
          className="text-base md:text-lg leading-relaxed mb-3 italic"
          style={{ color: 'var(--text-primary)' }}
        >
          "{verse.text}"
        </p>

        {/* Reference & Action */}
        <div className="flex items-center justify-between">
          <span
            className="text-sm font-medium"
            style={{ color: 'var(--text-secondary)' }}
          >
            — {verse.reference} (ESV)
          </span>

          <button
            onClick={handleStudy}
            className="text-xs font-medium px-3 py-1.5 rounded-lg transition-all hover:scale-105"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--accent-color) 15%, transparent)',
              border: '1px solid color-mix(in srgb, var(--accent-color) 30%, transparent)',
              color: 'var(--accent-color)',
            }}
          >
            Study This Verse →
          </button>
        </div>
      </div>
    </div>
  );
}
