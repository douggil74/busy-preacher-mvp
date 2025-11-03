'use client';

import { useState, useEffect } from 'react';
import { BookOpen, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { progressTracker } from '@/lib/progressTracker'; // ADD THIS IMPORT

interface Devotional {
  title: string;
  content: string;
  scripture: string;
  author: string;
  source: string;
}

interface DevotionalData {
  success: boolean;
  date: string;
  devotional: Devotional;
}

export function DailyDevotional() {
  const [devotional, setDevotional] = useState<DevotionalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDevotional();
  }, []);

  const fetchDevotional = async () => {
    try {
      setLoading(true);
const response = await fetch(`${window.location.origin}/api/devotional`);

      const data = await response.json();
      
      if (data.success) {
        setDevotional(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDevotional();
    setRefreshing(false);
  };

  // ADD THIS FUNCTION - Track when user reads devotional
  const handleExpand = () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
    
    // Track when user OPENS the devotional
    if (newExpandedState && devotional) {
      progressTracker.checkAndNotifyProgress();
      
      // Optional: You could also log the specific devotional they read
      console.log('📖 User read devotional:', devotional.devotional.scripture);
    }
  };

  if (loading || !devotional) {
    return null;
  }

  return (
    <section className="card">
      {/* Header with separate buttons */}
      <div className="flex items-center justify-between -m-2 p-2">
        <button
          onClick={handleExpand} // CHANGED: Use new handler
          className="flex-1 flex items-center gap-2 rounded-lg hover:bg-white/5 transition-colors text-left"
        >
          <BookOpen className="w-4 h-4 text-yellow-400" />
          <div>
            <span className="text-sm font-medium text-white">📖 Verse of the Day</span>
            <span className="text-xs text-white/50 ml-2">{devotional.devotional.scripture}</span>
          </div>
        </button>
        
        <div className="flex items-center gap-2">
          {isExpanded && (
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-1 rounded bg-white/5 hover:bg-white/10 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-3 h-3 text-white/60 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          )}
          <button
            onClick={handleExpand} // CHANGED: Use new handler
            className="p-1 hover:bg-white/5 rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-white/60" />
            ) : (
              <ChevronDown className="w-4 h-4 text-white/60" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-xs text-white/40 mb-3">{devotional.date}</p>
          
          <h4 className="text-base font-semibold text-white mb-2">
            {devotional.devotional.title}
          </h4>
          
          <a 
            href={`https://www.biblegateway.com/passage/?search=${encodeURIComponent(devotional.devotional.scripture)}&version=NIV`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-sm text-yellow-400 hover:text-yellow-300 underline underline-offset-2 mb-4"
          >
            {devotional.devotional.scripture}
          </a>
          
          <p className="text-sm text-white/80 leading-relaxed whitespace-pre-line mb-4">
            {devotional.devotional.content}
          </p>
          
          <p className="text-xs text-white/40 pt-3 border-t border-white/10">
            From {devotional.devotional.author}
          </p>
        </div>
      )}
    </section>
  );
}