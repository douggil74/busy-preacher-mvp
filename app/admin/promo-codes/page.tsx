'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Gift, Plus, Trash2, Edit2, Users, Check, X, Loader2 } from 'lucide-react';
import AdminAuth from '@/components/AdminAuth';

interface PromoCode {
  code: string;
  type: 'free_forever' | 'free_trial_extension' | 'discount_percent';
  description?: string;
  value?: number;
  trialDays?: number;
  maxUses?: number;
  currentUses: number;
  expiresAt?: string | null;
  createdAt: string;
  isActive: boolean;
  usedBy: string[];
}

const PROMO_TYPES = [
  { value: 'free_forever', label: 'Free Forever', description: 'Lifetime free access' },
  { value: 'free_trial_extension', label: 'Extended Trial', description: 'Add extra trial days' },
  { value: 'discount_percent', label: 'Percent Discount', description: 'Percentage off subscription' },
];

export default function AdminPromoCodes() {
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [viewingUsers, setViewingUsers] = useState<string | null>(null);
  const [maxCodes, setMaxCodes] = useState(10);

  // Form state
  const [newCode, setNewCode] = useState('');
  const [newType, setNewType] = useState<'free_forever' | 'free_trial_extension' | 'discount_percent'>('free_forever');
  const [newDescription, setNewDescription] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newTrialDays, setNewTrialDays] = useState('');
  const [newMaxUses, setNewMaxUses] = useState('');
  const [newExpiresAt, setNewExpiresAt] = useState('');
  const [saving, setSaving] = useState(false);

  // Fetch promo codes
  const fetchCodes = async () => {
    try {
      const res = await fetch('/api/admin/promo-codes');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setCodes(data.codes || []);
      setMaxCodes(data.maxCodes || 10);
    } catch (err) {
      setError('Failed to load promo codes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCodes();
  }, []);

  // Create new promo code
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const body: Record<string, unknown> = {
        code: newCode,
        type: newType,
        description: newDescription || undefined,
      };

      if (newType === 'discount_percent' && newValue) {
        body.value = parseInt(newValue);
      }
      if (newType === 'free_trial_extension' && newTrialDays) {
        body.trialDays = parseInt(newTrialDays);
      }
      if (newMaxUses) {
        body.maxUses = parseInt(newMaxUses);
      }
      if (newExpiresAt) {
        body.expiresAt = newExpiresAt;
      }

      const res = await fetch('/api/admin/promo-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setSuccess(`Promo code "${data.code}" created successfully!`);
      setShowCreateForm(false);
      resetForm();
      fetchCodes();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create promo code');
    } finally {
      setSaving(false);
    }
  };

  // Toggle active status
  const handleToggleActive = async (code: string, isActive: boolean) => {
    try {
      const res = await fetch('/api/admin/promo-codes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, isActive: !isActive }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      fetchCodes();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update promo code');
    }
  };

  // Delete promo code
  const handleDelete = async (code: string) => {
    if (!confirm(`Are you sure you want to delete "${code}"? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/promo-codes?code=${encodeURIComponent(code)}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setSuccess(`Promo code "${code}" deleted successfully!`);
      fetchCodes();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete promo code');
    }
  };

  const resetForm = () => {
    setNewCode('');
    setNewType('free_forever');
    setNewDescription('');
    setNewValue('');
    setNewTrialDays('');
    setNewMaxUses('');
    setNewExpiresAt('');
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'free_forever':
        return 'from-green-500 to-green-600';
      case 'free_trial_extension':
        return 'from-blue-500 to-blue-600';
      case 'discount_percent':
        return 'from-purple-500 to-purple-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getTypeLabel = (type: string) => {
    return PROMO_TYPES.find((t) => t.value === type)?.label || type;
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <AdminAuth>
      <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
        {/* Header */}
        <div
          className="sticky top-0 z-10 backdrop-blur-sm"
          style={{
            backgroundColor: 'var(--card-bg)',
            borderBottomWidth: '1px',
            borderBottomStyle: 'solid',
            borderBottomColor: 'var(--card-border)',
          }}
        >
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
              </Link>
              <div>
                <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  Promo Codes
                </h1>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {codes.length} of {maxCodes} codes used
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-500 text-sm">
              {error}
              <button onClick={() => setError('')} className="float-right">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500 rounded-lg text-green-500 text-sm">
              {success}
              <button onClick={() => setSuccess('')} className="float-right">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Create Button */}
          {!showCreateForm && codes.length < maxCodes && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="w-full mb-6 p-4 rounded-xl border-2 border-dashed border-blue-500/50 hover:border-blue-500 hover:bg-blue-500/5 transition-all flex items-center justify-center gap-2"
              style={{ color: 'var(--text-primary)' }}
            >
              <Plus className="w-5 h-5 text-blue-500" />
              <span className="font-medium">Create New Promo Code</span>
            </button>
          )}

          {/* Create Form */}
          {showCreateForm && (
            <div
              className="mb-6 rounded-xl p-6"
              style={{
                backgroundColor: 'var(--card-bg)',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: 'var(--card-border)',
              }}
            >
              <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                Create New Promo Code
              </h2>

              <form onSubmit={handleCreate} className="space-y-4">
                {/* Code */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Code *
                  </label>
                  <input
                    type="text"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                    className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                    style={{
                      backgroundColor: 'var(--input-bg)',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      borderColor: 'var(--input-border)',
                      color: 'var(--text-primary)',
                    }}
                    placeholder="e.g., BLESSED2024"
                    required
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Type *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {PROMO_TYPES.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setNewType(type.value as typeof newType)}
                        className={`p-3 rounded-lg border-2 text-left transition-all ${
                          newType === type.value
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-transparent hover:border-gray-300'
                        }`}
                        style={{
                          backgroundColor: newType === type.value ? undefined : 'var(--card-hover)',
                        }}
                      >
                        <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                          {type.label}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          {type.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Type-specific fields */}
                {newType === 'discount_percent' && (
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                      Discount Percentage *
                    </label>
                    <input
                      type="number"
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      min="1"
                      max="100"
                      className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{
                        backgroundColor: 'var(--input-bg)',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        borderColor: 'var(--input-border)',
                        color: 'var(--text-primary)',
                      }}
                      placeholder="e.g., 50 for 50% off"
                      required
                    />
                  </div>
                )}

                {newType === 'free_trial_extension' && (
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                      Extra Trial Days *
                    </label>
                    <input
                      type="number"
                      value={newTrialDays}
                      onChange={(e) => setNewTrialDays(e.target.value)}
                      min="1"
                      max="365"
                      className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{
                        backgroundColor: 'var(--input-bg)',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        borderColor: 'var(--input-border)',
                        color: 'var(--text-primary)',
                      }}
                      placeholder="e.g., 30 for 30 extra days"
                      required
                    />
                  </div>
                )}

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Description
                  </label>
                  <input
                    type="text"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{
                      backgroundColor: 'var(--input-bg)',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      borderColor: 'var(--input-border)',
                      color: 'var(--text-primary)',
                    }}
                    placeholder="e.g., Friends & family access"
                  />
                </div>

                {/* Max Uses */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Max Uses (leave empty for unlimited)
                  </label>
                  <input
                    type="number"
                    value={newMaxUses}
                    onChange={(e) => setNewMaxUses(e.target.value)}
                    min="1"
                    className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{
                      backgroundColor: 'var(--input-bg)',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      borderColor: 'var(--input-border)',
                      color: 'var(--text-primary)',
                    }}
                    placeholder="e.g., 100"
                  />
                </div>

                {/* Expiration Date */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Expiration Date (leave empty for no expiration)
                  </label>
                  <input
                    type="date"
                    value={newExpiresAt}
                    onChange={(e) => setNewExpiresAt(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{
                      backgroundColor: 'var(--input-bg)',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      borderColor: 'var(--input-border)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-6 py-3 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Gift className="w-5 h-5" />
                    )}
                    Create Code
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      resetForm();
                    }}
                    className="px-6 py-3 rounded-lg font-medium transition-all"
                    style={{
                      backgroundColor: 'var(--card-hover)',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      borderColor: 'var(--card-border)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          )}

          {/* Promo Codes List */}
          {!loading && codes.length === 0 && (
            <div
              className="text-center py-12 rounded-xl"
              style={{
                backgroundColor: 'var(--card-bg)',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: 'var(--card-border)',
              }}
            >
              <Gift className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-secondary)' }} />
              <p style={{ color: 'var(--text-secondary)' }}>No promo codes yet</p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Create your first code to get started
              </p>
            </div>
          )}

          {!loading && codes.length > 0 && (
            <div className="space-y-4">
              {codes.map((code) => (
                <div
                  key={code.code}
                  className={`rounded-xl p-4 transition-all ${!code.isActive ? 'opacity-60' : ''}`}
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: 'var(--card-border)',
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className={`p-2 bg-gradient-to-br ${getTypeColor(code.type)} rounded-lg text-white`}
                        >
                          <Gift className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                            {code.code}
                          </h3>
                          <span
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: 'var(--card-hover)',
                              color: 'var(--text-secondary)',
                            }}
                          >
                            {getTypeLabel(code.type)}
                            {code.type === 'discount_percent' && code.value && ` (${code.value}%)`}
                            {code.type === 'free_trial_extension' && code.trialDays && ` (+${code.trialDays} days)`}
                          </span>
                        </div>
                      </div>

                      {code.description && (
                        <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                          {code.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
                        <span>
                          Uses: {code.currentUses}
                          {code.maxUses && ` / ${code.maxUses}`}
                        </span>
                        <span>Expires: {formatDate(code.expiresAt)}</span>
                        <span>Created: {formatDate(code.createdAt)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* View Users */}
                      {code.usedBy.length > 0 && (
                        <button
                          onClick={() => setViewingUsers(viewingUsers === code.code ? null : code.code)}
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
                          title="View users"
                        >
                          <Users className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                          <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                            {code.usedBy.length}
                          </span>
                        </button>
                      )}

                      {/* Toggle Active */}
                      <button
                        onClick={() => handleToggleActive(code.code, code.isActive)}
                        className={`p-2 rounded-lg transition-colors ${
                          code.isActive
                            ? 'bg-green-500/10 hover:bg-green-500/20'
                            : 'bg-gray-500/10 hover:bg-gray-500/20'
                        }`}
                        title={code.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {code.isActive ? (
                          <Check className="w-5 h-5 text-green-500" />
                        ) : (
                          <X className="w-5 h-5 text-gray-500" />
                        )}
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(code.code)}
                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5 text-red-500" />
                      </button>
                    </div>
                  </div>

                  {/* Users who used this code */}
                  {viewingUsers === code.code && code.usedBy.length > 0 && (
                    <div
                      className="mt-4 pt-4"
                      style={{
                        borderTopWidth: '1px',
                        borderTopStyle: 'solid',
                        borderTopColor: 'var(--card-border)',
                      }}
                    >
                      <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                        Used by ({code.usedBy.length}):
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {code.usedBy.map((email, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-2 py-1 rounded"
                            style={{
                              backgroundColor: 'var(--card-hover)',
                              color: 'var(--text-secondary)',
                            }}
                          >
                            {email}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Info */}
          <div
            className="mt-6 p-4 rounded-lg text-sm"
            style={{
              backgroundColor: 'var(--card-hover)',
              color: 'var(--text-secondary)',
            }}
          >
            <p className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Promo Code Types:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <strong>Free Forever</strong> - Grants permanent free access
              </li>
              <li>
                <strong>Extended Trial</strong> - Adds extra days to the user&apos;s free trial
              </li>
              <li>
                <strong>Percent Discount</strong> - Percentage off subscription price
              </li>
            </ul>
          </div>
        </div>
      </div>
    </AdminAuth>
  );
}
