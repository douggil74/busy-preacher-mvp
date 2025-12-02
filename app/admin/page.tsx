'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  RefreshCw,
  Check,
  X,
  Eye,
  EyeOff,
  Loader2,
  Search,
  Trash2,
  Pencil,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import AdminAuth from '@/components/AdminAuth';
import SetAdminBanner from '@/components/SetAdminBanner';
import AdminPushNotification from '@/components/AdminPushNotification';
import AdminToastManager from '@/components/AdminToastManager';
import { setAdminPassword } from '@/lib/adminAuth';

interface Stats {
  users: { total: number; recentSignups: number; weeklySignups: number };
  subscriptions: { active: number; promoAccess: number; iosSubscriptions: number; total: number };
  content: { sermons: number };
  promoCodes: { total: number; active: number };
  moderation: { pendingPrayers: number };
  pastoralGuidance?: {
    totalConversations: number;
    totalMessages: number;
    weeklyConversations: number;
    weeklyMessages: number;
    helpfulCount: number;
    notHelpfulCount: number;
  };
}

interface PrayerRequest {
  id: string;
  name: string;
  request: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface PromoCode {
  code: string;
  type: string;
  isActive: boolean;
  currentUses: number;
  maxUses?: number;
}

interface UserResult {
  uid: string;
  email: string;
  displayName?: string;
  createdAt?: string;
  subscription?: {
    hasPromoAccess?: boolean;
    hasIosSubscription?: boolean;
    status?: string;
  };
  redeemedCodes?: string[];
}

interface WhitelistEntry {
  email: string;
  addedAt: string | null;
  note?: string;
  role?: 'owner' | 'developer' | 'admin' | 'user';
  isBuiltIn?: boolean;
}

type ActiveSection = 'dashboard' | 'users' | 'prayers' | 'promos' | 'whitelist' | 'toasts' | 'messages' | 'settings';

export default function AdminConsole() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('dashboard');
  const [stats, setStats] = useState<Stats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Prayer moderation
  const [pendingPrayers, setPendingPrayers] = useState<PrayerRequest[]>([]);
  const [loadingPrayers, setLoadingPrayers] = useState(false);
  const [processingPrayer, setProcessingPrayer] = useState<string | null>(null);

  // Promo codes
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loadingPromos, setLoadingPromos] = useState(false);
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoType, setNewPromoType] = useState('free_forever');
  const [creatingPromo, setCreatingPromo] = useState(false);

  // User lookup
  const [userSearchEmail, setUserSearchEmail] = useState('');
  const [searchingUser, setSearchingUser] = useState(false);
  const [foundUser, setFoundUser] = useState<UserResult | null>(null);
  const [userSearchError, setUserSearchError] = useState('');
  const [grantingAccess, setGrantingAccess] = useState(false);

  // Whitelist
  const [whitelistEmails, setWhitelistEmails] = useState<WhitelistEntry[]>([]);
  const [loadingWhitelist, setLoadingWhitelist] = useState(false);
  const [newWhitelistEmail, setNewWhitelistEmail] = useState('');
  const [newWhitelistNote, setNewWhitelistNote] = useState('');
  const [newWhitelistRole, setNewWhitelistRole] = useState<'user' | 'admin' | 'developer' | 'owner'>('user');
  const [addingWhitelist, setAddingWhitelist] = useState(false);
  const [whitelistError, setWhitelistError] = useState('');
  const [editingWhitelistEmail, setEditingWhitelistEmail] = useState<string | null>(null);
  const [editWhitelistRole, setEditWhitelistRole] = useState<'user' | 'admin' | 'developer' | 'owner'>('user');
  const [editWhitelistNote, setEditWhitelistNote] = useState('');
  const [updatingWhitelist, setUpdatingWhitelist] = useState(false);

  // Settings
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  // Fetch functions
  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (!data.error) setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchPendingPrayers = async () => {
    setLoadingPrayers(true);
    try {
      const res = await fetch('/api/prayers?status=pending&limit=10');
      const data = await res.json();
      setPendingPrayers(data.prayers || []);
    } catch (error) {
      console.error('Error fetching prayers:', error);
    } finally {
      setLoadingPrayers(false);
    }
  };

  const fetchPromoCodes = async () => {
    setLoadingPromos(true);
    try {
      const res = await fetch('/api/admin/promo-codes');
      const data = await res.json();
      setPromoCodes(data.codes || []);
    } catch (error) {
      console.error('Error fetching promo codes:', error);
    } finally {
      setLoadingPromos(false);
    }
  };

  const fetchWhitelist = async () => {
    setLoadingWhitelist(true);
    try {
      const res = await fetch('/api/admin/whitelist');
      const data = await res.json();
      setWhitelistEmails(data.emails || []);
    } catch (error) {
      console.error('Error fetching whitelist:', error);
    } finally {
      setLoadingWhitelist(false);
    }
  };

  const searchUser = async () => {
    if (!userSearchEmail.trim()) return;
    setSearchingUser(true);
    setFoundUser(null);
    setUserSearchError('');
    try {
      const res = await fetch(`/api/admin/users?email=${encodeURIComponent(userSearchEmail)}`);
      const data = await res.json();
      if (data.user) setFoundUser(data.user);
      else setUserSearchError('User not found');
    } catch (error) {
      setUserSearchError('Search failed');
    } finally {
      setSearchingUser(false);
    }
  };

  const grantUserAccess = async (accessType: string) => {
    if (!foundUser) return;
    setGrantingAccess(true);
    try {
      await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: foundUser.uid, accessType }),
      });
      searchUser();
    } catch (error) {
      console.error('Error granting access:', error);
    } finally {
      setGrantingAccess(false);
    }
  };

  const handlePrayerAction = async (id: string, action: 'approve' | 'reject') => {
    setProcessingPrayer(id);
    try {
      await fetch(`/api/prayers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action === 'approve' ? 'approved' : 'rejected' }),
      });
      setPendingPrayers((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error('Error updating prayer:', error);
    } finally {
      setProcessingPrayer(null);
    }
  };

  const handleQuickPromo = async () => {
    if (!newPromoCode.trim()) return;
    setCreatingPromo(true);
    try {
      const res = await fetch('/api/admin/promo-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: newPromoCode.toUpperCase(), type: newPromoType }),
      });
      const data = await res.json();
      if (data.success) {
        setNewPromoCode('');
        fetchPromoCodes();
        fetchStats();
      }
    } catch (error) {
      console.error('Error creating promo:', error);
    } finally {
      setCreatingPromo(false);
    }
  };

  const togglePromoStatus = async (code: string, isActive: boolean) => {
    try {
      await fetch('/api/admin/promo-codes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, isActive: !isActive }),
      });
      fetchPromoCodes();
    } catch (error) {
      console.error('Error toggling promo:', error);
    }
  };

  const deletePromo = async (code: string) => {
    if (!confirm(`Delete "${code}"?`)) return;
    try {
      await fetch(`/api/admin/promo-codes?code=${encodeURIComponent(code)}`, { method: 'DELETE' });
      fetchPromoCodes();
      fetchStats();
    } catch (error) {
      console.error('Error deleting promo:', error);
    }
  };

  const addToWhitelist = async () => {
    if (!newWhitelistEmail.trim()) return;
    setAddingWhitelist(true);
    setWhitelistError('');
    try {
      const res = await fetch('/api/admin/whitelist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newWhitelistEmail.toLowerCase().trim(),
          note: newWhitelistNote.trim(),
          role: newWhitelistRole,
        }),
      });
      const data = await res.json();
      if (data.error) setWhitelistError(data.error);
      else {
        setNewWhitelistEmail('');
        setNewWhitelistNote('');
        setNewWhitelistRole('user');
        fetchWhitelist();
      }
    } catch (error) {
      setWhitelistError('Failed to add email');
    } finally {
      setAddingWhitelist(false);
    }
  };

  const removeFromWhitelist = async (email: string) => {
    if (!confirm(`Remove ${email}?`)) return;
    try {
      await fetch(`/api/admin/whitelist?email=${encodeURIComponent(email)}`, { method: 'DELETE' });
      fetchWhitelist();
    } catch (error) {
      console.error('Error removing from whitelist:', error);
    }
  };

  const startEditingWhitelist = (entry: WhitelistEntry) => {
    setEditingWhitelistEmail(entry.email);
    setEditWhitelistRole((entry.role || 'user') as 'user' | 'admin' | 'developer' | 'owner');
    setEditWhitelistNote(entry.note || '');
  };

  const cancelEditingWhitelist = () => {
    setEditingWhitelistEmail(null);
    setEditWhitelistRole('user');
    setEditWhitelistNote('');
  };

  const updateWhitelist = async () => {
    if (!editingWhitelistEmail) return;
    setUpdatingWhitelist(true);
    setWhitelistError('');
    try {
      const res = await fetch('/api/admin/whitelist', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: editingWhitelistEmail,
          role: editWhitelistRole,
          note: editWhitelistNote,
        }),
      });
      const data = await res.json();
      if (data.error) setWhitelistError(data.error);
      else {
        cancelEditingWhitelist();
        fetchWhitelist();
      }
    } catch (error) {
      setWhitelistError('Failed to update');
    } finally {
      setUpdatingWhitelist(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage({ type: '', text: '' });
    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Min 6 characters' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Passwords must match' });
      return;
    }
    try {
      await setAdminPassword(newPassword);
      setPasswordMessage({ type: 'success', text: 'Updated!' });
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setShowPasswordForm(false);
        setPasswordMessage({ type: '', text: '' });
      }, 1500);
    } catch {
      setPasswordMessage({ type: 'error', text: 'Failed' });
    }
  };

  const refreshAll = () => {
    fetchStats();
    fetchPendingPrayers();
    fetchPromoCodes();
    fetchWhitelist();
  };

  useEffect(() => {
    refreshAll();
  }, []);

  // Navigation items with emojis for teen-friendly UI
  const navItems = [
    { id: 'dashboard', emoji: '🏠', label: 'Dashboard' },
    { id: 'users', emoji: '👥', label: 'Users' },
    { id: 'prayers', emoji: '🙏', label: 'Prayers', badge: stats?.moderation?.pendingPrayers },
    { id: 'promos', emoji: '🎁', label: 'Promos' },
    { id: 'whitelist', emoji: '✅', label: 'VIP List' },
    { id: 'toasts', emoji: '💬', label: 'Toasts' },
    { id: 'messages', emoji: '💭', label: 'Pastor AI' },
    { id: 'settings', emoji: '⚙️', label: 'Settings' },
  ];

  return (
    <AdminAuth>
      <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
        {/* Header */}
        <div className="sticky top-0 z-20 backdrop-blur-md" style={{ backgroundColor: 'rgba(var(--card-bg-rgb), 0.95)', borderBottom: '1px solid var(--card-border)' }}>
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-xl">
                  🎮
                </div>
                <div>
                  <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Control Center</h1>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>The Busy Christian App</p>
                </div>
              </div>
              <button onClick={refreshAll} className="p-2 rounded-xl hover:bg-white/10 transition-colors" title="Refresh">
                  <RefreshCw className={`w-5 h-5 ${loadingStats ? 'animate-spin' : ''}`} style={{ color: 'var(--text-secondary)' }} />
                </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Quick Nav - Big Emoji Buttons */}
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2 mb-6">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as ActiveSection)}
                className={`relative p-3 rounded-2xl flex flex-col items-center gap-1 transition-all hover:scale-105 ${
                  activeSection === item.id
                    ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 ring-2 ring-purple-500'
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                <span className="text-2xl">{item.emoji}</span>
                <span className="text-[10px] font-medium" style={{ color: activeSection === item.id ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                  {item.label}
                </span>
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Dashboard Section */}
          {activeSection === 'dashboard' && (
            <div className="space-y-4">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard emoji="👥" label="Total Users" value={stats?.users.total || 0} color="blue" loading={loadingStats} />
                <StatCard emoji="🆕" label="New Today" value={stats?.users.recentSignups || 0} color="green" loading={loadingStats} />
                <StatCard emoji="💎" label="Subscribers" value={stats?.subscriptions.total || 0} color="purple" loading={loadingStats} />
                <StatCard emoji="🙏" label="Pending" value={stats?.moderation.pendingPrayers || 0} color={stats?.moderation.pendingPrayers ? 'red' : 'green'} loading={loadingStats} />
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SetAdminBanner />
                <AdminPushNotification />
              </div>

              {/* Quick Links */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <QuickLink emoji="🖼️" label="Scenes" href="/admin/scenes" />
                <QuickLink emoji="📜" label="Legal Docs" href="/admin/legal" />
                <QuickLink emoji="🔥" label="Firebase" href="https://console.firebase.google.com" external />
                <QuickLink emoji="▲" label="Vercel" href="https://vercel.com" external />
              </div>
            </div>
          )}

          {/* Users Section */}
          {activeSection === 'users' && (
            <div className="space-y-4">
              <SectionHeader emoji="👥" title="Find a User" subtitle="Search by email to manage their account" />

              {/* View All Users Link */}
              <Link
                href="/admin/users"
                className="flex items-center justify-between p-4 rounded-2xl transition-all hover:scale-[1.02]"
                style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📋</span>
                  <div>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>View All Users</p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>See full list with IP & location data</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
              </Link>

              <div className="p-4 rounded-2xl" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={userSearchEmail}
                    onChange={(e) => setUserSearchEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && searchUser()}
                    placeholder="Enter email address..."
                    className="flex-1 px-4 py-3 rounded-xl text-sm"
                    style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }}
                  />
                  <button
                    onClick={searchUser}
                    disabled={searchingUser}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl font-medium disabled:opacity-50 transition-all"
                  >
                    {searchingUser ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                  </button>
                </div>

                {userSearchError && <p className="text-red-500 text-sm mt-3">{userSearchError}</p>}

                {foundUser && (
                  <div className="mt-4 p-4 rounded-xl" style={{ backgroundColor: 'var(--card-hover)' }}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{foundUser.email}</p>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{foundUser.displayName || 'No name set'}</p>
                        <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                          Joined: {foundUser.createdAt ? new Date(foundUser.createdAt).toLocaleDateString() : 'Unknown'}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        {foundUser.subscription?.hasPromoAccess && (
                          <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-lg">Promo</span>
                        )}
                        {foundUser.subscription?.hasIosSubscription && (
                          <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded-lg">iOS</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <ActionButton onClick={() => grantUserAccess('free_forever')} disabled={grantingAccess} color="green">
                        🎁 Free Forever
                      </ActionButton>
                      <ActionButton onClick={() => grantUserAccess('extend_trial')} disabled={grantingAccess} color="blue">
                        ⏰ +30 Days
                      </ActionButton>
                      <ActionButton onClick={() => grantUserAccess('revoke')} disabled={grantingAccess} color="red">
                        ❌ Revoke
                      </ActionButton>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Prayers Section */}
          {activeSection === 'prayers' && (
            <div className="space-y-4">
              <SectionHeader emoji="🙏" title="Prayer Requests" subtitle="Review and approve community prayers" />

              {loadingPrayers ? (
                <LoadingState />
              ) : pendingPrayers.length === 0 ? (
                <EmptyState emoji="✨" message="All caught up! No pending prayers." />
              ) : (
                <div className="space-y-3">
                  {pendingPrayers.map((prayer) => (
                    <div key={prayer.id} className="p-4 rounded-2xl" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{prayer.name || 'Anonymous'}</p>
                          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{prayer.request}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handlePrayerAction(prayer.id, 'approve')}
                            disabled={processingPrayer === prayer.id}
                            className="p-3 bg-green-500/20 hover:bg-green-500/30 rounded-xl transition-colors"
                          >
                            <Check className="w-5 h-5 text-green-500" />
                          </button>
                          <button
                            onClick={() => handlePrayerAction(prayer.id, 'reject')}
                            disabled={processingPrayer === prayer.id}
                            className="p-3 bg-red-500/20 hover:bg-red-500/30 rounded-xl transition-colors"
                          >
                            <X className="w-5 h-5 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Promos Section */}
          {activeSection === 'promos' && (
            <div className="space-y-4">
              <SectionHeader emoji="🎁" title="Promo Codes" subtitle="Create and manage discount codes" />

              <div className="p-4 rounded-2xl" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={newPromoCode}
                    onChange={(e) => setNewPromoCode(e.target.value.toUpperCase())}
                    placeholder="CODE"
                    className="flex-1 px-4 py-3 rounded-xl text-sm uppercase font-mono"
                    style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }}
                  />
                  <select
                    value={newPromoType}
                    onChange={(e) => setNewPromoType(e.target.value)}
                    className="px-4 py-3 rounded-xl text-sm"
                    style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }}
                  >
                    <option value="free_forever">Free Forever</option>
                    <option value="free_trial_extension">+30 Days</option>
                    <option value="discount_percent">50% Off</option>
                  </select>
                  <button
                    onClick={handleQuickPromo}
                    disabled={creatingPromo || !newPromoCode.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white rounded-xl font-medium disabled:opacity-50 transition-all"
                  >
                    {creatingPromo ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create'}
                  </button>
                </div>

                {loadingPromos ? (
                  <LoadingState />
                ) : promoCodes.length === 0 ? (
                  <EmptyState emoji="🎫" message="No promo codes yet" />
                ) : (
                  <div className="space-y-2">
                    {promoCodes.map((promo) => (
                      <div
                        key={promo.code}
                        className={`flex items-center justify-between p-3 rounded-xl ${!promo.isActive ? 'opacity-50' : ''}`}
                        style={{ backgroundColor: 'var(--card-hover)' }}
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold" style={{ color: 'var(--text-primary)' }}>{promo.code}</span>
                          <span className="text-xs px-2 py-1 rounded-lg bg-purple-500/20 text-purple-400">
                            {promo.type === 'free_forever' ? 'FREE' : promo.type === 'free_trial_extension' ? '+30 DAYS' : '50% OFF'}
                          </span>
                          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                            {promo.currentUses} uses
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => togglePromoStatus(promo.code, promo.isActive)}
                            className={`p-2 rounded-lg ${promo.isActive ? 'bg-green-500/20' : 'bg-gray-500/20'}`}
                          >
                            {promo.isActive ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-gray-500" />}
                          </button>
                          <button onClick={() => deletePromo(promo.code)} className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30">
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Whitelist Section */}
          {activeSection === 'whitelist' && (
            <div className="space-y-4">
              <SectionHeader emoji="✅" title="VIP List" subtitle="Premium access for special people" />

              <div className="p-4 rounded-2xl" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
                <div className="space-y-3 mb-4">
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={newWhitelistEmail}
                      onChange={(e) => setNewWhitelistEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="flex-1 px-4 py-3 rounded-xl text-sm"
                      style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }}
                    />
                    <select
                      value={newWhitelistRole}
                      onChange={(e) => setNewWhitelistRole(e.target.value as 'user' | 'admin' | 'developer' | 'owner')}
                      className="px-4 py-3 rounded-xl text-sm"
                      style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="developer">Developer</option>
                      <option value="owner">Owner</option>
                    </select>
                    <button
                      onClick={addToWhitelist}
                      disabled={addingWhitelist || !newWhitelistEmail.trim()}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium disabled:opacity-50"
                    >
                      {addingWhitelist ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Add'}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={newWhitelistNote}
                    onChange={(e) => setNewWhitelistNote(e.target.value)}
                    placeholder="Note (optional)"
                    className="w-full px-4 py-3 rounded-xl text-sm"
                    style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }}
                  />
                  {whitelistError && <p className="text-red-500 text-sm">{whitelistError}</p>}
                </div>

                {loadingWhitelist ? (
                  <LoadingState />
                ) : whitelistEmails.length === 0 ? (
                  <EmptyState emoji="📋" message="VIP list is empty" />
                ) : (
                  <div className="space-y-2">
                    {whitelistEmails.map((entry) => {
                      const roleColors: Record<string, string> = {
                        owner: 'bg-purple-500/20 text-purple-400',
                        developer: 'bg-blue-500/20 text-blue-400',
                        admin: 'bg-amber-500/20 text-amber-400',
                        user: 'bg-green-500/20 text-green-400',
                      };
                      const isEditing = editingWhitelistEmail === entry.email;

                      if (isEditing) {
                        return (
                          <div key={entry.email} className="p-3 rounded-xl space-y-2" style={{ backgroundColor: 'var(--card-hover)', border: '2px solid var(--accent-primary, #8b5cf6)' }}>
                            <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{entry.email}</p>
                            <div className="flex gap-2">
                              <select
                                value={editWhitelistRole}
                                onChange={(e) => setEditWhitelistRole(e.target.value as 'user' | 'admin' | 'developer' | 'owner')}
                                className="flex-1 px-3 py-2 rounded-lg text-sm"
                                style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }}
                              >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                                <option value="developer">Developer</option>
                                <option value="owner">Owner</option>
                              </select>
                              <input
                                type="text"
                                value={editWhitelistNote}
                                onChange={(e) => setEditWhitelistNote(e.target.value)}
                                placeholder="Note"
                                className="flex-1 px-3 py-2 rounded-lg text-sm"
                                style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }}
                              />
                            </div>
                            <div className="flex gap-2 justify-end">
                              <button onClick={cancelEditingWhitelist} className="px-4 py-2 rounded-lg text-sm" style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)' }}>
                                Cancel
                              </button>
                              <button
                                onClick={updateWhitelist}
                                disabled={updatingWhitelist}
                                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm disabled:opacity-50"
                              >
                                {updatingWhitelist ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                              </button>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div key={entry.email} className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: 'var(--card-hover)' }}>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>{entry.email}</p>
                              <span className={`text-xs px-2 py-0.5 rounded-lg ${roleColors[entry.role || 'user']}`}>
                                {entry.role || 'user'}
                              </span>
                            </div>
                            {entry.note && <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{entry.note}</p>}
                          </div>
                          {!entry.isBuiltIn && (
                            <div className="flex gap-1 ml-2">
                              <button onClick={() => startEditingWhitelist(entry)} className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30">
                                <Pencil className="w-4 h-4 text-blue-500" />
                              </button>
                              <button onClick={() => removeFromWhitelist(entry.email)} className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30">
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Toasts Section */}
          {activeSection === 'toasts' && (
            <div className="p-4 rounded-2xl" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
              <AdminToastManager />
            </div>
          )}

          {/* Messages Section */}
          {activeSection === 'messages' && (
            <div className="space-y-4">
              <SectionHeader emoji="💭" title="Pastor AI Stats" subtitle="Anonymous usage statistics" />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard emoji="💬" label="Total Convos" value={stats?.pastoralGuidance?.totalConversations || 0} color="blue" loading={loadingStats} />
                <StatCard emoji="📝" label="Messages" value={stats?.pastoralGuidance?.totalMessages || 0} color="purple" loading={loadingStats} />
                <StatCard emoji="👍" label="Helpful" value={stats?.pastoralGuidance?.helpfulCount || 0} color="green" loading={loadingStats} />
                <StatCard emoji="👎" label="Not Helpful" value={stats?.pastoralGuidance?.notHelpfulCount || 0} color="red" loading={loadingStats} />
              </div>

              <div className="p-4 rounded-2xl text-center" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
                <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                  Content is private. Only anonymous stats are shown.
                </p>
                <Link
                  href="/admin/pastoral-messages"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-medium"
                >
                  View Flagged Messages
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          {/* Settings Section */}
          {activeSection === 'settings' && (
            <div className="space-y-4">
              <SectionHeader emoji="⚙️" title="Settings" subtitle="Admin configuration" />

              {/* Password */}
              <div className="p-4 rounded-2xl" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🔐</span>
                    <div>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Admin Password</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Change your admin login</p>
                    </div>
                  </div>
                  {!showPasswordForm && (
                    <button onClick={() => setShowPasswordForm(true)} className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-xl font-medium">
                      Change
                    </button>
                  )}
                </div>
                {showPasswordForm && (
                  <form onSubmit={handlePasswordChange} className="mt-4 space-y-3">
                    {passwordMessage.text && (
                      <div className={`p-3 rounded-xl text-sm ${passwordMessage.type === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                        {passwordMessage.text}
                      </div>
                    )}
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="New password"
                        className="w-full px-4 py-3 rounded-xl text-sm pr-12"
                        style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                        {showPassword ? <EyeOff className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} /> : <Eye className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />}
                      </button>
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm password"
                      className="w-full px-4 py-3 rounded-xl text-sm"
                      style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }}
                    />
                    <div className="flex gap-2">
                      <button type="submit" className="flex-1 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-medium">
                        Update
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowPasswordForm(false); setNewPassword(''); setConfirmPassword(''); }}
                        className="px-6 py-3 rounded-xl font-medium"
                        style={{ backgroundColor: 'var(--card-hover)', color: 'var(--text-primary)' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* External Links */}
              <div className="grid grid-cols-2 gap-3">
                <QuickLink emoji="🔥" label="Firebase Console" href="https://console.firebase.google.com" external />
                <QuickLink emoji="▲" label="Vercel Dashboard" href="https://vercel.com" external />
                <QuickLink emoji="💾" label="Supabase" href="https://supabase.com/dashboard" external />
                <QuickLink emoji="💳" label="Square Dashboard" href="https://squareup.com/dashboard" external />
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminAuth>
  );
}

// Helper Components
function StatCard({ emoji, label, value, color, loading }: { emoji: string; label: string; value: number | string; color: string; loading?: boolean }) {
  const colors: Record<string, string> = {
    blue: 'from-blue-500/20 to-cyan-500/20 text-blue-400',
    green: 'from-green-500/20 to-emerald-500/20 text-green-400',
    purple: 'from-purple-500/20 to-pink-500/20 text-purple-400',
    red: 'from-red-500/20 to-orange-500/20 text-red-400',
  };
  return (
    <div className={`p-4 rounded-2xl bg-gradient-to-br ${colors[color]}`} style={{ border: '1px solid var(--card-border)' }}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{emoji}</span>
        <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</span>
      </div>
      {loading ? (
        <Loader2 className="w-6 h-6 animate-spin" />
      ) : (
        <p className="text-2xl font-bold">{value}</p>
      )}
    </div>
  );
}

function SectionHeader({ emoji, title, subtitle }: { emoji: string; title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-3 mb-2">
      <span className="text-3xl">{emoji}</span>
      <div>
        <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h2>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{subtitle}</p>
      </div>
    </div>
  );
}

function QuickLink({ emoji, label, href, external }: { emoji: string; label: string; href: string; external?: boolean }) {
  const Component = external ? 'a' : Link;
  const props = external ? { href, target: '_blank', rel: 'noopener noreferrer' } : { href };
  return (
    <Component
      {...props}
      className="flex items-center gap-3 p-4 rounded-2xl transition-all hover:scale-[1.02]"
      style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
    >
      <span className="text-2xl">{emoji}</span>
      <span className="font-medium flex-1" style={{ color: 'var(--text-primary)' }}>{label}</span>
      {external ? <ExternalLink className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} /> : <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />}
    </Component>
  );
}

function ActionButton({ onClick, disabled, color, children }: { onClick: () => void; disabled?: boolean; color: string; children: React.ReactNode }) {
  const colors: Record<string, string> = {
    green: 'from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600',
    blue: 'from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600',
    red: 'from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600',
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 bg-gradient-to-r ${colors[color]} text-white rounded-xl text-sm font-medium disabled:opacity-50 transition-all`}
    >
      {children}
    </button>
  );
}

function LoadingState() {
  return (
    <div className="flex justify-center py-8">
      <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
    </div>
  );
}

function EmptyState({ emoji, message }: { emoji: string; message: string }) {
  return (
    <div className="text-center py-8">
      <span className="text-4xl mb-3 block">{emoji}</span>
      <p style={{ color: 'var(--text-secondary)' }}>{message}</p>
    </div>
  );
}
