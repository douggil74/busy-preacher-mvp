'use client';

import { useState } from 'react';
import {
  BookOpen,
  MessageCircle,
  Heart,
  Search,
  Languages,
  Calendar,
  Settings,
  User,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

// Sample Layout - Clean design with left sidebar popout
// Uses only elements from your existing home page

export default function SampleHomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const navItems = [
    { id: 'guidance', icon: MessageCircle, label: 'Ask the Pastor', color: '#facc15' },
    { id: 'prayer', icon: Heart, label: 'Prayer Community', color: '#ef4444' },
    { id: 'devotion', icon: BookOpen, label: 'Create Devotion', color: '#22c55e' },
    { id: 'search', icon: Search, label: 'Keyword Search', color: '#60a5fa' },
    { id: 'word', icon: Languages, label: 'Word Lookup', color: '#a78bfa' },
    { id: 'reading', icon: Calendar, label: 'Reading Plan', color: '#f472b6' },
  ];

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--bg-color)' }}>

      {/* ========================================
          LEFT SIDEBAR - Collapsible with Popouts
          ======================================== */}
      <aside
        className={`
          fixed left-0 top-0 h-full z-40 transition-all duration-300 ease-out
          ${sidebarOpen ? 'w-64' : 'w-16'}
        `}
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid var(--card-border)'
        }}
        onMouseEnter={() => setSidebarOpen(true)}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b" style={{ borderColor: 'var(--card-border)' }}>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'var(--accent-color)' }}
          >
            <BookOpen className="w-5 h-5" style={{ color: 'var(--bg-color)' }} />
          </div>
          <span
            className={`ml-3 font-bold text-lg whitespace-nowrap transition-opacity duration-200 ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}
            style={{ color: 'var(--text-primary)' }}
          >
            Busy Christian
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="p-2 space-y-1 mt-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onMouseEnter={() => setHoveredItem(item.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200
                ${hoveredItem === item.id ? 'scale-[1.02]' : ''}
              `}
              style={{
                backgroundColor: hoveredItem === item.id ? `${item.color}20` : 'transparent',
                border: hoveredItem === item.id ? `1px solid ${item.color}40` : '1px solid transparent'
              }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: `${item.color}20`,
                }}
              >
                <item.icon className="w-4 h-4" style={{ color: item.color }} />
              </div>
              <span
                className={`font-medium whitespace-nowrap transition-opacity duration-200 ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}
                style={{ color: hoveredItem === item.id ? item.color : 'var(--text-secondary)' }}
              >
                {item.label}
              </span>
              {sidebarOpen && (
                <ChevronRight
                  className={`w-4 h-4 ml-auto transition-all duration-200 ${hoveredItem === item.id ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}
                  style={{ color: item.color }}
                />
              )}
            </button>
          ))}
        </nav>

        {/* Bottom Items */}
        <div className="absolute bottom-0 left-0 right-0 p-2 border-t" style={{ borderColor: 'var(--card-border)' }}>
          <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all hover:bg-white/5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-white/10">
              <User className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
            </div>
            <span
              className={`font-medium whitespace-nowrap transition-opacity duration-200 ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}
              style={{ color: 'var(--text-secondary)' }}
            >
              Account
            </span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all hover:bg-white/5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-white/10">
              <Settings className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
            </div>
            <span
              className={`font-medium whitespace-nowrap transition-opacity duration-200 ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}
              style={{ color: 'var(--text-secondary)' }}
            >
              Settings
            </span>
          </button>
        </div>
      </aside>

      {/* ========================================
          MAIN CONTENT
          ======================================== */}
      <main
        className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}
        onClick={() => {
          setSidebarOpen(false);
          setHoveredItem(null);
        }}
      >
        <div className="max-w-4xl mx-auto px-6 py-8 pb-24">

          {/* Greeting Card */}
          <section
            className="rounded-2xl p-6 mb-8 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(250, 204, 21, 0.1) 0%, rgba(250, 204, 21, 0.02) 100%)',
              border: '1px solid rgba(250, 204, 21, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
            }}
          >
            {/* Decorative glow */}
            <div
              className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20"
              style={{ backgroundColor: 'var(--accent-color)' }}
            />

            <div className="relative z-10">
              <h1
                className="text-2xl md:text-3xl font-bold mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
                Good Morning, Pastor
              </h1>
              <p
                className="text-lg mb-6"
                style={{ color: 'var(--text-secondary)' }}
              >
                What Scripture is speaking to you today?
              </p>

              {/* Today's Reading Widget Placeholder */}
              <div
                className="rounded-xl p-4"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--card-border)'
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="w-5 h-5" style={{ color: 'var(--accent-color)' }} />
                  <span
                    className="text-sm font-medium"
                    style={{ color: 'var(--accent-color)' }}
                  >
                    TODAY'S READING
                  </span>
                </div>
                <p style={{ color: 'var(--text-primary)' }}>Psalm 23:1-6</p>
                <p
                  className="text-sm mt-1"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  "The Lord is my shepherd; I shall not want..."
                </p>
              </div>
            </div>
          </section>

          {/* Create Devotion Section */}
          <section
            className="rounded-2xl p-6 mb-6"
            style={{
              backgroundColor: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
            }}
          >
            <h2
              className="text-xl font-semibold mb-1"
              style={{ color: 'var(--accent-color)' }}
            >
              Create Your Own Devotion
            </h2>
            <p
              className="text-sm mb-6"
              style={{ color: 'var(--text-secondary)' }}
            >
              Generate AI-powered Bible studies with pastoral insights
            </p>

            <div className="space-y-4">
              <div>
                <label
                  className="block text-sm mb-2"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Passage (ESV)
                </label>
                <input
                  placeholder="e.g., John 11:25"
                  className="w-full rounded-xl px-4 py-3 outline-none transition-all"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '2px solid var(--card-border)',
                    color: 'var(--text-primary)'
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              <div>
                <label
                  className="block text-sm mb-2"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Topic (optional)
                </label>
                <input
                  placeholder="e.g., Finding peace in hard times"
                  className="w-full rounded-xl px-4 py-3 outline-none transition-all"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '2px solid var(--card-border)',
                    color: 'var(--text-primary)'
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              <button
                className="w-full rounded-xl px-6 py-3 font-semibold transition-all hover:scale-[1.01]"
                style={{
                  backgroundColor: 'var(--accent-color)',
                  color: 'var(--bg-color)'
                }}
              >
                Generate Study
              </button>
            </div>
          </section>

          {/* Keyword Search Section */}
          <section
            className="rounded-2xl p-6"
            style={{
              backgroundColor: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
            }}
          >
            <h2
              className="text-xl font-semibold mb-1"
              style={{ color: 'var(--accent-color)' }}
            >
              Keyword Search
            </h2>
            <p
              className="text-sm mb-6"
              style={{ color: 'var(--text-secondary)' }}
            >
              Search all of Scripture by topic or word
            </p>

            <div className="flex gap-3">
              <input
                placeholder="e.g., love, forgiveness, faith"
                className="flex-1 rounded-xl px-4 py-3 outline-none transition-all"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '2px solid var(--card-border)',
                  color: 'var(--text-primary)'
                }}
                onClick={(e) => e.stopPropagation()}
              />
              <button
                className="rounded-xl px-6 py-3 font-semibold transition-all hover:scale-[1.02]"
                style={{
                  backgroundColor: 'rgba(96, 165, 250, 0.2)',
                  border: '1px solid rgba(96, 165, 250, 0.4)',
                  color: '#60a5fa'
                }}
              >
                <Search className="w-5 h-5" />
              </button>
            </div>

            {/* Quick searches */}
            <div className="flex flex-wrap gap-2 mt-4">
              {['Faith', 'Hope', 'Peace', 'Grace', 'Love'].map((word) => (
                <button
                  key={word}
                  className="px-3 py-1.5 rounded-lg text-sm transition-all hover:scale-105"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--card-border)',
                    color: 'var(--text-secondary)'
                  }}
                >
                  {word}
                </button>
              ))}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
