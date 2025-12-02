'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, Loader2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import AdminAuth from '@/components/AdminAuth';

interface UserData {
  uid: string;
  email: string;
  displayName?: string;
  createdAt?: string;
  lastLoginAt?: string;
  lastLoginIP?: string;
  lastLoginLocation?: string;
  subscription?: {
    hasPromoAccess?: boolean;
    hasIosSubscription?: boolean;
    status?: string;
  };
  deviceInfo?: string;
  platform?: string;
}

export default function UsersListPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 50;

  const fetchUsers = async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/list?page=${pageNum}&limit=${pageSize}`);
      const data = await res.json();
      setUsers(data.users || []);
      setTotalCount(data.totalCount || 0);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchUser = async () => {
    if (!searchEmail.trim()) {
      fetchUsers(1);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users?email=${encodeURIComponent(searchEmail)}`);
      const data = await res.json();
      if (data.user) {
        setUsers([data.user]);
        setTotalCount(1);
      } else {
        setUsers([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error('Error searching user:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page);
  }, [page]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (user: UserData) => {
    if (user.subscription?.hasIosSubscription) {
      return <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-400">iOS Sub</span>;
    }
    if (user.subscription?.hasPromoAccess) {
      return <span className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-400">Promo</span>;
    }
    return <span className="text-xs px-2 py-0.5 rounded bg-gray-500/20 text-gray-400">Free</span>;
  };

  return (
    <AdminAuth>
      <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
        {/* Header */}
        <div className="sticky top-0 z-20 backdrop-blur-md" style={{ backgroundColor: 'rgba(var(--card-bg-rgb), 0.95)', borderBottom: '1px solid var(--card-border)' }}>
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link href="/admin" className="p-2 rounded-xl hover:bg-white/10 transition-colors">
                  <ArrowLeft className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                </Link>
                <div>
                  <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>All Users</h1>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{totalCount} total users</p>
                </div>
              </div>
              <button onClick={() => fetchUsers(page)} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} style={{ color: 'var(--text-secondary)' }} />
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Search */}
          <div className="flex gap-2 mb-4">
            <input
              type="email"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchUser()}
              placeholder="Search by email..."
              className="flex-1 px-4 py-3 rounded-xl text-sm"
              style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }}
            />
            <button
              onClick={searchUser}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-medium"
            >
              <Search className="w-5 h-5" />
            </button>
            {searchEmail && (
              <button
                onClick={() => { setSearchEmail(''); fetchUsers(1); }}
                className="px-4 py-3 rounded-xl"
                style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)' }}
              >
                Clear
              </button>
            )}
          </div>

          {/* Users Table */}
          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12">
                <p style={{ color: 'var(--text-secondary)' }}>No users found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                      <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--text-secondary)' }}>Email</th>
                      <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--text-secondary)' }}>Name</th>
                      <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--text-secondary)' }}>Status</th>
                      <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--text-secondary)' }}>Joined</th>
                      <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--text-secondary)' }}>Last Login</th>
                      <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--text-secondary)' }}>IP / Location</th>
                      <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--text-secondary)' }}>Platform</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.uid} className="hover:bg-white/5" style={{ borderBottom: '1px solid var(--card-border)' }}>
                        <td className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>{user.email}</td>
                        <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{user.displayName || '—'}</td>
                        <td className="px-4 py-3">{getStatusBadge(user)}</td>
                        <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>{formatDate(user.createdAt)}</td>
                        <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>{formatDate(user.lastLoginAt)}</td>
                        <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                          {user.lastLoginIP || '—'}
                          {user.lastLoginLocation && <span className="block text-[10px]">{user.lastLoginLocation}</span>}
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>{user.platform || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalCount > pageSize && (
              <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: '1px solid var(--card-border)' }}>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Showing {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, totalCount)} of {totalCount}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg disabled:opacity-50"
                    style={{ backgroundColor: 'var(--card-hover)' }}
                  >
                    <ChevronLeft className="w-4 h-4" style={{ color: 'var(--text-primary)' }} />
                  </button>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={page * pageSize >= totalCount}
                    className="p-2 rounded-lg disabled:opacity-50"
                    style={{ backgroundColor: 'var(--card-hover)' }}
                  >
                    <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-primary)' }} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Info Note */}
          <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              <strong className="text-amber-400">Note:</strong> IP and location data is captured on login.
              Users who signed up before this feature won't have location data until they log in again.
            </p>
          </div>
        </div>
      </div>
    </AdminAuth>
  );
}
