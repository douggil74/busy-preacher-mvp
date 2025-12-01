'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Home,
  BookOpen,
  MessageCircle,
  Heart,
  Library,
  GraduationCap,
  Calendar,
  Settings,
  User,
  HelpCircle,
  Info,
  Mail,
  ChevronRight,
  Sun,
  Moon,
  Menu,
  X,
  Languages
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface NavItem {
  id: string;
  icon: React.ElementType;
  label: string;
  href: string;
  color: string;
}

const mainNavItems: NavItem[] = [
  { id: 'home', icon: Home, label: 'Home', href: '/home', color: '#facc15' },
  { id: 'guidance', icon: MessageCircle, label: 'Ask the Pastor', href: '/pastoral-guidance', color: '#facc15' },
  { id: 'prayer', icon: Heart, label: 'Prayer Center', href: '/prayer', color: '#ef4444' },
  { id: 'library', icon: Library, label: 'My Library', href: '/library', color: '#60a5fa' },
  { id: 'courses', icon: GraduationCap, label: 'Study Courses', href: '/courses', color: '#22c55e' },
  { id: 'deep-study', icon: Languages, label: 'Deep Study', href: '/deep-study', color: '#a78bfa' },
  { id: 'reading', icon: Calendar, label: 'Reading Plans', href: '/reading-plans', color: '#f472b6' },
];

const menuItems: NavItem[] = [
  { id: 'account', icon: User, label: 'Account', href: '/account', color: '#94a3b8' },
  { id: 'about', icon: Info, label: 'About', href: '/about', color: '#94a3b8' },
  { id: 'help', icon: HelpCircle, label: 'Help', href: '/help', color: '#94a3b8' },
  { id: 'contact', icon: Mail, label: 'Contact', href: '/contact', color: '#94a3b8' },
];

export default function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated, signOut } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const mode = localStorage.getItem('bc-theme-mode') || 'dark';
    setIsDark(mode === 'dark');

    // Check if mobile
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    if (isDark) {
      root.style.setProperty('--bg-color', '#0f1729');
      root.style.setProperty('--card-bg', '#1a2332');
      root.style.setProperty('--card-border', '#2d3f5f');
      root.style.setProperty('--text-primary', '#e8f2f8');
      root.style.setProperty('--text-secondary', '#b8d4e6');
      root.style.setProperty('--accent-color', '#3b82f6');
      localStorage.setItem('bc-theme-mode', 'dark');
    } else {
      root.style.setProperty('--bg-color', '#f5f1e8');
      root.style.setProperty('--card-bg', '#ebe5d9');
      root.style.setProperty('--card-border', '#d4c9b3');
      root.style.setProperty('--text-primary', '#2d2520');
      root.style.setProperty('--text-secondary', '#5a4f46');
      root.style.setProperty('--accent-color', '#b8860b');
      localStorage.setItem('bc-theme-mode', 'light');
    }
    localStorage.setItem('bc-theme-user-set', 'true');
  }, [isDark, mounted]);

  const closeSidebar = () => {
    setSidebarOpen(false);
    setHoveredItem(null);
  };

  const isActive = (href: string) => {
    if (href === '/home') return pathname === '/home' || pathname === '/';
    return pathname === href || pathname?.startsWith(href + '/');
  };

  return (
    <>
      {/* Mobile Logo - Top Left */}
      {isMobile && (
        <Link href="/home" className="fixed top-4 left-4 z-50">
          <Image
            src="/logo.png"
            alt="Logo"
            width={36}
            height={36}
            className="object-contain"
          />
        </Link>
      )}

      {/* Top Right Controls - Theme Toggle & Hamburger */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        {/* Theme Toggle */}
        <button
          onClick={() => setIsDark(!isDark)}
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105"
          style={{
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
          }}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? (
            <Sun className="w-5 h-5" style={{ color: '#facc15' }} />
          ) : (
            <Moon className="w-5 h-5" style={{ color: '#60a5fa' }} />
          )}
        </button>

        {/* Hamburger Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105"
            style={{
              backgroundColor: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
            }}
          >
            {menuOpen ? (
              <X className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
            ) : (
              <Menu className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
            )}
          </button>

          {/* Dropdown Menu */}
          {menuOpen && (
            <div
              className="absolute right-0 mt-2 w-56 rounded-2xl p-2 shadow-lg max-h-[80vh] overflow-y-auto"
              style={{
                backgroundColor: 'var(--card-bg)',
                border: '1px solid var(--card-border)',
                backdropFilter: 'blur(20px)',
              }}
            >
              {/* User Info */}
              {isAuthenticated && user && (
                <>
                  <div className="px-3 py-2 mb-2 border-b" style={{ borderColor: 'var(--card-border)' }}>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {user.firstName}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {user.email}
                    </p>
                  </div>
                </>
              )}

              {/* Main Navigation - Only on Mobile */}
              {isMobile && (
                <>
                  <div className="px-3 py-1.5 mb-1">
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                      Navigate
                    </p>
                  </div>
                  {mainNavItems.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
                        style={{
                          backgroundColor: active ? `${item.color}20` : 'transparent',
                        }}
                      >
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${item.color}20` }}
                        >
                          <item.icon className="w-4 h-4" style={{ color: item.color }} />
                        </div>
                        <span className="text-sm font-medium" style={{ color: active ? item.color : 'var(--text-primary)' }}>
                          {item.label}
                        </span>
                      </Link>
                    );
                  })}
                  <div className="my-2 border-t" style={{ borderColor: 'var(--card-border)' }} />
                </>
              )}

              {/* Menu Items */}
              {menuItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl transition-all hover:bg-white/10"
                >
                  <item.icon className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                  <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                    {item.label}
                  </span>
                </Link>
              ))}

              {/* Settings */}
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('openSettings'));
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all hover:bg-white/10"
              >
                <Settings className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                  Settings
                </span>
              </button>

              {/* Sign Out */}
              {isAuthenticated && (
                <button
                  onClick={() => {
                    if (confirm('Sign out?')) {
                      signOut();
                    }
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all hover:bg-red-500/10 mt-1 border-t"
                  style={{ borderColor: 'var(--card-border)' }}
                >
                  <span className="text-sm" style={{ color: '#ef4444' }}>
                    Sign Out
                  </span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Left Sidebar - Hidden on Mobile */}
      {!isMobile && (
        <aside
        className={`
          fixed left-0 top-0 h-full z-50 transition-all duration-300 ease-out
          ${sidebarOpen ? 'w-64' : 'w-16'}
        `}
        style={{
          backgroundColor: 'color-mix(in srgb, var(--bg-color) 95%, black)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid var(--card-border)'
        }}
        onMouseEnter={() => setSidebarOpen(true)}
      >
        {/* Logo */}
        <div
          className="h-16 flex items-center px-3 border-b"
          style={{ borderColor: 'var(--card-border)' }}
        >
          <Link href="/home" className="flex items-center gap-3" onClick={closeSidebar}>
            <Image
              src="/logo.png"
              alt="Logo"
              width={40}
              height={40}
              className="object-contain flex-shrink-0"
            />
            <span
              className={`font-bold text-lg whitespace-nowrap transition-opacity duration-200 ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}
              style={{ color: 'var(--text-primary)' }}
            >
              Busy Christian
            </span>
          </Link>
        </div>

        {/* Main Navigation */}
        <nav className="p-2 space-y-1 mt-2">
          {mainNavItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={closeSidebar}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                  ${hoveredItem === item.id || active ? 'scale-[1.02]' : ''}
                `}
                style={{
                  backgroundColor: active
                    ? `${item.color}25`
                    : hoveredItem === item.id
                      ? `${item.color}15`
                      : 'transparent',
                  border: active
                    ? `1px solid ${item.color}50`
                    : '1px solid transparent'
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${item.color}20` }}
                >
                  <item.icon
                    className="w-4 h-4"
                    style={{ color: active || hoveredItem === item.id ? item.color : 'var(--text-secondary)' }}
                  />
                </div>
                <span
                  className={`font-medium whitespace-nowrap transition-opacity duration-200 ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}
                  style={{ color: active || hoveredItem === item.id ? item.color : 'var(--text-secondary)' }}
                >
                  {item.label}
                </span>
                {sidebarOpen && (active || hoveredItem === item.id) && (
                  <ChevronRight
                    className="w-4 h-4 ml-auto transition-all duration-200"
                    style={{ color: item.color }}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </aside>
      )}

      {/* Click-outside overlay when sidebar is open - Desktop only */}
      {!isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-40"
          style={{ left: '256px' }}
          onClick={closeSidebar}
        />
      )}
    </>
  );
}
