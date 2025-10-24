// app/components/SmartLoader.tsx
// Drop this file into your project exactly as-is

import React, { useState, useEffect } from 'react';

type LoaderType = 'translations' | 'commentary' | 'videos' | 'tools';

interface SmartLoaderProps {
  type: LoaderType;
  duration?: number;
  className?: string;
}

const LOADING_MESSAGES: Record<LoaderType, string[]> = {
  translations: [
    "Fetching Bible translations...",
    "Comparing ESV, NIV, NASB...",
    "Loading passage text...",
    "Almost ready..."
  ],
  commentary: [
    "Opening Matthew Henry's commentary...",
    "Consulting John Gill's insights...",
    "Loading Albert Barnes' notes...",
    "Gathering wisdom from the past..."
  ],
  videos: [
    "Curating teaching videos...",
    "Filtering by trusted teachers...",
    "Finding quality content...",
    "Preparing video resources..."
  ],
  tools: [
    "Loading study resources...",
    "Preparing cross-references...",
    "Gathering study questions...",
    "Almost there..."
  ]
};

const LOADER_ICONS: Record<LoaderType, string> = {
  translations: "📖",
  commentary: "📚", 
  videos: "📺",
  tools: "🔧"
};

export const SmartLoader: React.FC<SmartLoaderProps> = ({ 
  type, 
  duration = 2000,
  className = "" 
}) => {
  const [messageIndex, setMessageIndex] = useState(0);
  const messages = LOADING_MESSAGES[type];
  const icon = LOADER_ICONS[type];

  useEffect(() => {
    if (messages.length <= 1) return;
    
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, duration);

    return () => clearInterval(interval);
  }, [messages.length, duration]);

  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 ${className}`}>
      {/* Animated Icon */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-yellow-400/20 rounded-full animate-ping"></div>
        <div className="relative bg-yellow-400/30 p-6 rounded-full border-2 border-yellow-400/50">
          <div className="text-5xl animate-pulse">{icon}</div>
        </div>
      </div>

      {/* Loading Message */}
      <div className="text-center space-y-3">
        <p className="text-lg font-medium text-white/90 light:text-black/90 transition-all duration-300">
          {messages[messageIndex]}
        </p>
        <div className="flex items-center justify-center space-x-1">
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-xs mt-6 bg-white/10 rounded-full h-1 overflow-hidden">
        <div 
          className="h-full bg-yellow-400 rounded-full animate-pulse" 
          style={{ 
            width: '60%',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }}
        ></div>
      </div>
    </div>
  );
};

// Simple inline loader for small areas
export const MiniLoader: React.FC<{ text?: string }> = ({ text = "Loading..." }) => (
  <div className="flex items-center justify-center space-x-2 py-2">
    <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-400 border-t-transparent"></div>
    <span className="text-sm text-white/60 light:text-black/60">{text}</span>
  </div>
);