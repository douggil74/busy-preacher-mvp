'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  MessageCircle,
  Gift,
  Bell,
  Activity,
  Database,
  Settings,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  RefreshCw,
  Check,
  X,
  Eye,
  EyeOff,
  Key,
  Home,
  Loader2,
  Search,
  UserPlus,
  CreditCard,
  Clock,
  DollarSign,
  BookOpen,
  Send,
  TrendingUp,
  Calendar,
  UserCheck,
  Trash2,
} from 'lucide-react';
import AdminAuth from '@/components/AdminAuth';
import SetAdminBanner from '@/components/SetAdminBanner';
import AdminPushNotification from '@/components/AdminPushNotification';
import { setAdminPassword } from '@/lib/adminAuth';

interface Stats {
  users: { total: number; recentSignups: number; weeklySignups: number };
  subscriptions: { active: number; promoAccess: number; iosSubscriptions: number; total: number };
  content: { sermons: number };
  promoCodes: { total: number; active: number };
  moderation: { pendingPrayers: number };
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

interface ActivityItem {
  id: string;
  type: 'signup' | 'prayer' | 'promo' | 'subscription' | 'message';
  title: string;
  description: string;
  timestamp: string;
}

interface Sermon {
  id: string;
  title: string;
  date: string;
  scripture: string;
  content: string;
}

interface WhitelistEntry {
  email: string;
  addedAt: string | null;
  note?: string;
  isBuiltIn?: boolean;
}

export default function AdminConsole() {
  // Stats
  const [stats, setStats] = useState<Stats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Panel states
  const [expandedPanel, setExpandedPanel] = useState<string | null>('activity');

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

  // Activity feed
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(false);

  // Sermon search
  const [sermonQuery, setSermonQuery] = useState('');
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [searchingSermons, setSearchingSermons] = useState(false);

  // Whitelist management
  const [whitelistEmails, setWhitelistEmails] = useState<WhitelistEntry[]>([]);
  const [loadingWhitelist, setLoadingWhitelist] = useState(false);
  const [newWhitelistEmail, setNewWhitelistEmail] = useState('');
  const [newWhitelistNote, setNewWhitelistNote] = useState('');
  const [addingWhitelist, setAddingWhitelist] = useState(false);
  const [whitelistError, setWhitelistError] = useState('');

  // Settings
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  // Fetch all stats
  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (!data.error) {
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  // Fetch pending prayers
  const fetchPendingPrayers = async () => {
    setLoadingPrayers(true);
    try {
      const res = await fetch('/api/prayers?status=pending&limit=5');
      const data = await res.json();
      setPendingPrayers(data.prayers || []);
    } catch (error) {
      console.error('Error fetching prayers:', error);
    } finally {
      setLoadingPrayers(false);
    }
  };

  // Fetch promo codes
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

  // Fetch activity feed
  const fetchActivity = async () => {
    setLoadingActivity(true);
    try {
      const res = await fetch('/api/admin/activity?limit=10');
      const data = await res.json();
      setActivities(data.activities || []);
    } catch (error) {
      console.error('Error fetching activity:', error);
    } finally {
      setLoadingActivity(false);
    }
  };

  // Search user by email
  const searchUser = async () => {
    if (!userSearchEmail.trim()) return;
    setSearchingUser(true);
    setFoundUser(null);
    setUserSearchError('');
    try {
      const res = await fetch(`/api/admin/users?email=${encodeURIComponent(userSearchEmail)}`);
      const data = await res.json();
      if (data.user) {
        setFoundUser(data.user);
      } else {
        setUserSearchError('User not found');
      }
    } catch (error) {
      setUserSearchError('Search failed');
      console.error('Error searching user:', error);
    } finally {
      setSearchingUser(false);
    }
  };

  // Grant access to user
  const grantUserAccess = async (accessType: string) => {
    if (!foundUser) return;
    setGrantingAccess(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: foundUser.uid, accessType }),
      });
      const data = await res.json();
      if (data.success) {
        // Refresh user data
        searchUser();
      }
    } catch (error) {
      console.error('Error granting access:', error);
    } finally {
      setGrantingAccess(false);
    }
  };

  // Search sermons
  const searchSermons = async () => {
    setSearchingSermons(true);
    try {
      const url = sermonQuery
        ? `/api/admin/sermons/search?q=${encodeURIComponent(sermonQuery)}&limit=5`
        : '/api/admin/sermons/search?limit=5';
      const res = await fetch(url);
      const data = await res.json();
      setSermons(data.sermons || []);
    } catch (error) {
      console.error('Error searching sermons:', error);
    } finally {
      setSearchingSermons(false);
    }
  };

  // Fetch whitelist
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

  // Add to whitelist
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
        }),
      });
      const data = await res.json();
      if (data.error) {
        setWhitelistError(data.error);
      } else {
        setNewWhitelistEmail('');
        setNewWhitelistNote('');
        fetchWhitelist();
      }
    } catch (error) {
      setWhitelistError('Failed to add email');
      console.error('Error adding to whitelist:', error);
    } finally {
      setAddingWhitelist(false);
    }
  };

  // Remove from whitelist
  const removeFromWhitelist = async (email: string) => {
    if (!confirm(`Remove ${email} from whitelist?`)) return;
    try {
      await fetch(`/api/admin/whitelist?email=${encodeURIComponent(email)}`, { method: 'DELETE' });
      fetchWhitelist();
    } catch (error) {
      console.error('Error removing from whitelist:', error);
    }
  };

  // Approve/reject prayer
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

  // Create quick promo code
  const handleQuickPromo = async () => {
    if (!newPromoCode.trim()) return;
    setCreatingPromo(true);
    try {
      const res = await fetch('/api/admin/promo-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newPromoCode.toUpperCase(),
          type: newPromoType,
        }),
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

  // Toggle promo status
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

  // Delete promo
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

  // Change password
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

  // Refresh all
  const refreshAll = () => {
    fetchStats();
    fetchPendingPrayers();
    fetchPromoCodes();
    fetchActivity();
    fetchWhitelist();
  };

  useEffect(() => {
    refreshAll();
  }, []);

  const togglePanel = (panel: string) => {
    setExpandedPanel(expandedPanel === panel ? null : panel);
  };

  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'signup': return <UserPlus className="w-4 h-4 text-green-500" />;
      case 'prayer': return <Bell className="w-4 h-4 text-amber-500" />;
      case 'promo': return <Gift className="w-4 h-4 text-teal-500" />;
      case 'subscription': return <DollarSign className="w-4 h-4 text-purple-500" />;
      default: return <Activity className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <AdminAuth>
      <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
        {/* Header */}
        <div className="sticky top-0 z-20 backdrop-blur-md" style={{ backgroundColor: 'rgba(var(--card-bg-rgb), 0.9)', borderBottom: '1px solid var(--card-border)' }}>
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Admin Console</h1>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>The Busy Christian App</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={refreshAll} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="Refresh">
                  <RefreshCw className={`w-5 h-5 ${loadingStats ? 'animate-spin' : ''}`} style={{ color: 'var(--text-secondary)' }} />
                </button>
                <Link href="/account" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="Account / Subscription">
                  <CreditCard className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                </Link>
                <Link href="/" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="Home">
                  <Home className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Live Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-4">
            <StatCard label="Total Users" value={stats?.users.total || 0} icon={<Users className="w-4 h-4" />} color="blue" loading={loadingStats} />
            <StatCard label="Today" value={stats?.users.recentSignups || 0} icon={<TrendingUp className="w-4 h-4" />} color="green" suffix=" new" loading={loadingStats} />
            <StatCard label="Subscriptions" value={stats?.subscriptions.total || 0} icon={<DollarSign className="w-4 h-4" />} color="purple" loading={loadingStats} />
            <StatCard label="Sermons" value={stats?.content.sermons || 0} icon={<BookOpen className="w-4 h-4" />} color="amber" loading={loadingStats} />
            <StatCard label="Pending" value={stats?.moderation.pendingPrayers || 0} icon={<Bell className="w-4 h-4" />} color={stats?.moderation.pendingPrayers ? 'red' : 'green'} loading={loadingStats} />
            <StatCard label="Promos" value={`${stats?.promoCodes.active || 0}/${stats?.promoCodes.total || 0}`} icon={<Gift className="w-4 h-4" />} color="teal" loading={loadingStats} />
          </div>

          {/* Banner & Notifications */}
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <SetAdminBanner />
            <AdminPushNotification />
          </div>

          {/* Main Panels */}
          <div className="space-y-3">
            {/* Activity Feed */}
            <ConsolePanel title="Activity Feed" icon={<Clock className="w-5 h-5" />} expanded={expandedPanel === 'activity'} onToggle={() => togglePanel('activity')}>
              {loadingActivity ? (
                <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>
              ) : activities.length === 0 ? (
                <p className="text-center py-6 text-sm" style={{ color: 'var(--text-secondary)' }}>No recent activity</p>
              ) : (
                <div className="space-y-2">
                  {activities.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg" style={{ backgroundColor: 'var(--card-hover)' }}>
                      {getActivityIcon(item.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{item.title}</p>
                        <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{item.description}</p>
                      </div>
                      <span className="text-xs shrink-0" style={{ color: 'var(--text-secondary)' }}>{formatTimeAgo(item.timestamp)}</span>
                    </div>
                  ))}
                </div>
              )}
            </ConsolePanel>

            {/* User Lookup */}
            <ConsolePanel title="User Lookup" icon={<Search className="w-5 h-5" />} expanded={expandedPanel === 'users'} onToggle={() => togglePanel('users')}>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={userSearchEmail}
                    onChange={(e) => setUserSearchEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && searchUser()}
                    placeholder="Search by email..."
                    className="flex-1 px-3 py-2 rounded-lg text-sm"
                    style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }}
                  />
                  <button onClick={searchUser} disabled={searchingUser} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                    {searchingUser ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
                  </button>
                </div>

                {userSearchError && <p className="text-sm text-red-500">{userSearchError}</p>}

                {foundUser && (
                  <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--card-hover)' }}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{foundUser.email}</p>
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{foundUser.displayName || 'No name'}</p>
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Joined: {foundUser.createdAt ? new Date(foundUser.createdAt).toLocaleDateString() : 'Unknown'}</p>
                      </div>
                      <div className="text-right">
                        {foundUser.subscription?.hasPromoAccess && <span className="text-xs px-2 py-1 bg-green-500/10 text-green-500 rounded">Promo Access</span>}
                        {foundUser.subscription?.hasIosSubscription && <span className="text-xs px-2 py-1 bg-purple-500/10 text-purple-500 rounded ml-1">iOS Sub</span>}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <button onClick={() => grantUserAccess('free_forever')} disabled={grantingAccess} className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded text-xs font-medium disabled:opacity-50">
                        Grant Free Access
                      </button>
                      <button onClick={() => grantUserAccess('extend_trial')} disabled={grantingAccess} className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-medium disabled:opacity-50">
                        +30 Days Trial
                      </button>
                      <button onClick={() => grantUserAccess('revoke')} disabled={grantingAccess} className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-medium disabled:opacity-50">
                        Revoke Access
                      </button>
                    </div>
                    {foundUser.redeemedCodes && foundUser.redeemedCodes.length > 0 && (
                      <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>Codes used: {foundUser.redeemedCodes.join(', ')}</p>
                    )}
                  </div>
                )}
              </div>
            </ConsolePanel>

            {/* Whitelist Management */}
            <ConsolePanel title="Whitelist Management" icon={<UserCheck className="w-5 h-5" />} badge={whitelistEmails.length || undefined} badgeColor="teal" expanded={expandedPanel === 'whitelist'} onToggle={() => togglePanel('whitelist')}>
              <div className="space-y-4">
                {/* Add email form */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={newWhitelistEmail}
                      onChange={(e) => setNewWhitelistEmail(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addToWhitelist()}
                      placeholder="email@example.com"
                      className="flex-1 px-3 py-2 rounded-lg text-sm"
                      style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }}
                    />
                    <button onClick={addToWhitelist} disabled={addingWhitelist || !newWhitelistEmail.trim()} className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                      {addingWhitelist ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add'}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={newWhitelistNote}
                    onChange={(e) => setNewWhitelistNote(e.target.value)}
                    placeholder="Note (optional) - e.g. 'Pastor Smith'"
                    className="w-full px-3 py-2 rounded-lg text-sm"
                    style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }}
                  />
                  {whitelistError && <p className="text-sm text-red-500">{whitelistError}</p>}
                </div>

                {/* Whitelisted emails list */}
                {loadingWhitelist ? (
                  <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-teal-500" /></div>
                ) : whitelistEmails.length === 0 ? (
                  <p className="text-center py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>No emails in whitelist</p>
                ) : (
                  <div className="space-y-2">
                    {whitelistEmails.map((entry) => (
                      <div key={entry.email} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'var(--card-hover)' }}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>{entry.email}</p>
                            {entry.isBuiltIn && <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">built-in</span>}
                          </div>
                          {entry.note && <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{entry.note}</p>}
                          {entry.addedAt && <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Added {new Date(entry.addedAt).toLocaleDateString()}</p>}
                        </div>
                        {!entry.isBuiltIn && (
                          <button onClick={() => removeFromWhitelist(entry.email)} className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 ml-2" title="Remove">
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
                  Whitelisted users get premium access without subscription
                </p>
              </div>
            </ConsolePanel>

            {/* Prayer Moderation */}
            <ConsolePanel title="Prayer Moderation" icon={<Shield className="w-5 h-5" />} badge={pendingPrayers.length || undefined} badgeColor="amber" expanded={expandedPanel === 'moderation'} onToggle={() => togglePanel('moderation')}>
              {loadingPrayers ? (
                <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>
              ) : pendingPrayers.length === 0 ? (
                <div className="text-center py-6">
                  <Check className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <p style={{ color: 'var(--text-secondary)' }}>All caught up!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingPrayers.map((prayer) => (
                    <div key={prayer.id} className="p-3 rounded-lg" style={{ backgroundColor: 'var(--card-hover)' }}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{prayer.name || 'Anonymous'}</p>
                          <p className="text-sm mt-1 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{prayer.request}</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button onClick={() => handlePrayerAction(prayer.id, 'approve')} disabled={processingPrayer === prayer.id} className="p-2 bg-green-500/10 hover:bg-green-500/20 rounded-lg" title="Approve">
                            <Check className="w-4 h-4 text-green-500" />
                          </button>
                          <button onClick={() => handlePrayerAction(prayer.id, 'reject')} disabled={processingPrayer === prayer.id} className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg" title="Reject">
                            <X className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Link href="/admin/prayer-moderation" className="block text-center text-sm text-blue-500 hover:text-blue-400 py-2">View all →</Link>
                </div>
              )}
            </ConsolePanel>

            {/* Promo Codes */}
            <ConsolePanel title="Promo Codes" icon={<Gift className="w-5 h-5" />} badge={`${promoCodes.length}/10`} badgeColor="teal" expanded={expandedPanel === 'promos'} onToggle={() => togglePanel('promos')}>
              <div className="flex gap-2 mb-4">
                <input type="text" value={newPromoCode} onChange={(e) => setNewPromoCode(e.target.value.toUpperCase())} placeholder="CODE" className="flex-1 px-3 py-2 rounded-lg text-sm uppercase" style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }} />
                <select value={newPromoType} onChange={(e) => setNewPromoType(e.target.value)} className="px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }}>
                  <option value="free_forever">Free Forever</option>
                  <option value="free_trial_extension">+30 Days</option>
                  <option value="discount_percent">50% Off</option>
                </select>
                <button onClick={handleQuickPromo} disabled={creatingPromo || !newPromoCode.trim() || promoCodes.length >= 10} className="px-4 py-2 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white rounded-lg text-sm font-medium">
                  {creatingPromo ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add'}
                </button>
              </div>
              {loadingPromos ? (
                <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-blue-500" /></div>
              ) : promoCodes.length === 0 ? (
                <p className="text-center py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>No promo codes</p>
              ) : (
                <div className="space-y-2">
                  {promoCodes.map((promo) => (
                    <div key={promo.code} className={`flex items-center justify-between p-2 rounded-lg ${!promo.isActive ? 'opacity-50' : ''}`} style={{ backgroundColor: 'var(--card-hover)' }}>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{promo.code}</span>
                        <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-secondary)' }}>
                          {promo.type === 'free_forever' ? 'FREE' : promo.type === 'free_trial_extension' ? '+TRIAL' : 'DISCOUNT'}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{promo.currentUses}{promo.maxUses ? `/${promo.maxUses}` : ''}</span>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => togglePromoStatus(promo.code, promo.isActive)} className={`p-1.5 rounded ${promo.isActive ? 'bg-green-500/10' : 'bg-gray-500/10'}`}>
                          {promo.isActive ? <Check className="w-3.5 h-3.5 text-green-500" /> : <X className="w-3.5 h-3.5 text-gray-500" />}
                        </button>
                        <button onClick={() => deletePromo(promo.code)} className="p-1.5 rounded bg-red-500/10 hover:bg-red-500/20">
                          <X className="w-3.5 h-3.5 text-red-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ConsolePanel>

            {/* Sermon Search */}
            <ConsolePanel title="Sermon Search" icon={<BookOpen className="w-5 h-5" />} expanded={expandedPanel === 'sermons'} onToggle={() => togglePanel('sermons')}>
              <div className="flex gap-2 mb-4">
                <input type="text" value={sermonQuery} onChange={(e) => setSermonQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && searchSermons()} placeholder="Search sermons..." className="flex-1 px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }} />
                <button onClick={searchSermons} disabled={searchingSermons} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                  {searchingSermons ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
                </button>
              </div>
              {sermons.length > 0 && (
                <div className="space-y-2">
                  {sermons.map((sermon) => (
                    <div key={sermon.id} className="p-3 rounded-lg" style={{ backgroundColor: 'var(--card-hover)' }}>
                      <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{sermon.title}</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{sermon.scripture} • {sermon.date}</p>
                      <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{sermon.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </ConsolePanel>

            {/* Pastoral Messages */}
            <ConsolePanel title="Pastoral Messages" icon={<MessageCircle className="w-5 h-5" />} expanded={expandedPanel === 'messages'} onToggle={() => togglePanel('messages')}>
              <div className="text-center py-6">
                <MessageCircle className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--text-secondary)' }} />
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>View and respond to pastoral conversations</p>
                <Link href="/admin/pastoral-messages" className="inline-block mt-3 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg text-sm font-medium">Open Messages</Link>
              </div>
            </ConsolePanel>

            {/* Settings */}
            <ConsolePanel title="Settings" icon={<Settings className="w-5 h-5" />} expanded={expandedPanel === 'settings'} onToggle={() => togglePanel('settings')}>
              <div className="space-y-4">
                {/* Password */}
                <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--card-hover)' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Admin Password</span>
                    </div>
                    {!showPasswordForm && <button onClick={() => setShowPasswordForm(true)} className="text-sm text-blue-500">Change</button>}
                  </div>
                  {showPasswordForm && (
                    <form onSubmit={handlePasswordChange} className="mt-3 space-y-2">
                      {passwordMessage.text && <div className={`p-2 rounded text-sm ${passwordMessage.type === 'error' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>{passwordMessage.text}</div>}
                      <div className="relative">
                        <input type={showPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" className="w-full px-3 py-2 rounded-lg text-sm pr-10" style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }}>
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm" className="w-full px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }} />
                      <div className="flex gap-2">
                        <button type="submit" className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium">Update</button>
                        <button type="button" onClick={() => { setShowPasswordForm(false); setNewPassword(''); setConfirmPassword(''); }} className="px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)' }}>Cancel</button>
                      </div>
                    </form>
                  )}
                </div>
                {/* External Links */}
                <div className="grid grid-cols-2 gap-2">
                  <ExternalLinkCard href="https://supabase.com/dashboard/project/fteolzeggftsjevmseyn" label="Supabase" icon={<Database className="w-4 h-4 text-green-500" />} />
                  <ExternalLinkCard href="https://vercel.com/doug-gilfords-projects/busy-preacher-mvp" label="Vercel" icon={<Activity className="w-4 h-4 text-blue-500" />} />
                  <ExternalLinkCard href="https://console.firebase.google.com" label="Firebase" icon={<Database className="w-4 h-4 text-amber-500" />} />
                  <ExternalLinkCard href="https://squareup.com/dashboard" label="Square" icon={<DollarSign className="w-4 h-4 text-purple-500" />} />
                </div>
              </div>
            </ConsolePanel>
          </div>
        </div>
      </div>
    </AdminAuth>
  );
}

// Stat Card
function StatCard({ label, value, icon, color, suffix = '', loading }: { label: string; value: number | string; icon: React.ReactNode; color: string; suffix?: string; loading?: boolean }) {
  const colors: Record<string, string> = {
    blue: 'text-blue-500 bg-blue-500/10',
    green: 'text-green-500 bg-green-500/10',
    purple: 'text-purple-500 bg-purple-500/10',
    amber: 'text-amber-500 bg-amber-500/10',
    red: 'text-red-500 bg-red-500/10',
    teal: 'text-teal-500 bg-teal-500/10',
  };
  return (
    <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
      <div className="flex items-center gap-2 mb-1">
        <div className={`p-1 rounded ${colors[color]}`}>{icon}</div>
        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{label}</span>
      </div>
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      ) : (
        <p className={`text-xl font-bold ${colors[color].split(' ')[0]}`}>{value}{suffix}</p>
      )}
    </div>
  );
}

// Console Panel
function ConsolePanel({ title, icon, badge, badgeColor = 'blue', expanded, onToggle, children }: { title: string; icon: React.ReactNode; badge?: string | number; badgeColor?: string; expanded: boolean; onToggle: () => void; children: React.ReactNode }) {
  const badgeColors: Record<string, string> = {
    blue: 'bg-blue-500/10 text-blue-500',
    amber: 'bg-amber-500/10 text-amber-500',
    teal: 'bg-teal-500/10 text-teal-500',
    pink: 'bg-pink-500/10 text-pink-500',
  };
  return (
    <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
      <button onClick={onToggle} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
        <div className="flex items-center gap-3">
          <div style={{ color: 'var(--text-primary)' }}>{icon}</div>
          <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{title}</span>
          {badge !== undefined && <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeColors[badgeColor]}`}>{badge}</span>}
        </div>
        {expanded ? <ChevronUp className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} /> : <ChevronDown className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />}
      </button>
      {expanded && <div className="px-4 pb-4" style={{ borderTop: '1px solid var(--card-border)' }}><div className="pt-4">{children}</div></div>}
    </div>
  );
}

// External Link Card
function ExternalLinkCard({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" style={{ backgroundColor: 'var(--card-hover)' }}>
      {icon}
      <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{label}</span>
      <ExternalLink className="w-3 h-3 ml-auto" style={{ color: 'var(--text-secondary)' }} />
    </a>
  );
}
