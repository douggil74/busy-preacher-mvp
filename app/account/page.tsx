'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { usePlatform } from '@/hooks/usePlatform';
import { getUserSubscription, Subscription } from '@/lib/subscription';
import { Playfair_Display } from 'next/font/google';

const playfair = Playfair_Display({
  weight: ['600', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export default function AccountPage() {
  const router = useRouter();
  const { user, signOut, isLoading: authLoading } = useAuth();
  const { isApp, isPaid, isInTrial, trialDaysRemaining, isLoading: platformLoading } = usePlatform();

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancellingSubscription, setCancellingSubscription] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    async function loadSubscription() {
      if (user?.uid) {
        const sub = await getUserSubscription(user.uid);
        setSubscription(sub);
      }
      setLoading(false);
    }
    loadSubscription();
  }, [user]);

  // Redirect if not logged in (only after auth has finished loading)
  useEffect(() => {
    if (!authLoading && !loading && !platformLoading && !user) {
      router.push('/home');
    }
  }, [user, authLoading, loading, platformLoading, router]);

  const handleCancelSubscription = async () => {
    if (!user?.uid || !subscription) return;

    setCancellingSubscription(true);
    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid }),
      });

      if (response.ok) {
        // Refresh subscription data
        const sub = await getUserSubscription(user.uid);
        setSubscription(sub);
        setShowCancelConfirm(false);
        alert('Your subscription has been cancelled. You will have access until the end of your billing period.');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Cancel error:', error);
      alert('Failed to cancel subscription. Please try again.');
    } finally {
      setCancellingSubscription(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const getSubscriptionStatus = () => {
    if (isApp) {
      return { label: 'iOS App', color: 'text-green-400', bg: 'bg-green-500/20' };
    }
    if (subscription?.status === 'active') {
      return { label: 'Active', color: 'text-green-400', bg: 'bg-green-500/20' };
    }
    if (subscription?.status === 'canceled') {
      return { label: 'Cancelled', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    }
    if (isInTrial) {
      return { label: 'Free Trial', color: 'text-blue-400', bg: 'bg-blue-500/20' };
    }
    return { label: 'Inactive', color: 'text-red-400', bg: 'bg-red-500/20' };
  };

  if (authLoading || loading || platformLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  // Show loading while redirecting
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  const status = getSubscriptionStatus();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className={`${playfair.className} text-xl font-bold text-yellow-400`}>Account</h1>
          <div className="w-16"></div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Profile Section */}
        <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Profile
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white/60">Name</span>
              <span className="text-white">{user.firstName || user.fullName || 'Not set'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60">Email</span>
              <span className="text-white">{user.email || 'Not set'}</span>
            </div>
            {user.phone && (
              <div className="flex justify-between items-center">
                <span className="text-white/60">Phone</span>
                <span className="text-white">{user.phone}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-white/60">Member since</span>
              <span className="text-white">{formatDate(user.createdAt)}</span>
            </div>
          </div>
        </section>

        {/* Subscription Section */}
        <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Subscription
          </h2>

          <div className="space-y-4">
            {/* Status Badge */}
            <div className="flex justify-between items-center">
              <span className="text-white/60">Status</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.bg} ${status.color}`}>
                {status.label}
              </span>
            </div>

            {/* Trial Info */}
            {isInTrial && !isApp && (
              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                <div className="flex items-center gap-2 text-blue-400 mb-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">Free Trial</span>
                </div>
                <p className="text-white/70 text-sm">
                  {trialDaysRemaining > 0
                    ? `You have ${trialDaysRemaining} day${trialDaysRemaining === 1 ? '' : 's'} left in your free trial.`
                    : 'Your free trial has ended.'}
                </p>
                {!subscription && (
                  <button
                    onClick={() => router.push('/home')}
                    className="mt-3 w-full py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-semibold rounded-lg transition-colors"
                  >
                    Subscribe Now
                  </button>
                )}
              </div>
            )}

            {/* iOS App User */}
            {isApp && (
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                <div className="flex items-center gap-2 text-green-400 mb-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-medium">iOS App Premium</span>
                </div>
                <p className="text-white/70 text-sm">
                  You have full access through the iOS app. Manage your subscription in the App Store settings.
                </p>
              </div>
            )}

            {/* Active Subscription Details */}
            {subscription && subscription.status === 'active' && !isApp && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-white/60">Plan</span>
                  <span className="text-white">
                    {subscription.currentPeriodEnd &&
                      new Date(subscription.currentPeriodEnd).getTime() - new Date(subscription.currentPeriodStart).getTime() > 60 * 24 * 60 * 60 * 1000
                      ? 'Annual ($35.88/year)'
                      : 'Monthly ($3.99/month)'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60">Next billing date</span>
                  <span className="text-white">{formatDate(subscription.currentPeriodEnd)}</span>
                </div>

                {/* Cancel Button */}
                {!showCancelConfirm ? (
                  <button
                    onClick={() => setShowCancelConfirm(true)}
                    className="w-full py-2 text-red-400 hover:text-red-300 text-sm transition-colors"
                  >
                    Cancel subscription
                  </button>
                ) : (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl space-y-3">
                    <p className="text-white/80 text-sm">
                      Are you sure you want to cancel? You'll lose access at the end of your billing period.
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowCancelConfirm(false)}
                        className="flex-1 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                      >
                        Keep subscription
                      </button>
                      <button
                        onClick={handleCancelSubscription}
                        disabled={cancellingSubscription}
                        className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50"
                      >
                        {cancellingSubscription ? 'Cancelling...' : 'Yes, cancel'}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Cancelled Subscription */}
            {subscription?.status === 'canceled' && (
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                <p className="text-white/70 text-sm mb-3">
                  Your subscription is cancelled. You have access until {formatDate(subscription.currentPeriodEnd)}.
                </p>
                <button
                  onClick={() => router.push('/home')}
                  className="w-full py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-semibold rounded-lg transition-colors"
                >
                  Resubscribe
                </button>
              </div>
            )}

            {/* No Subscription (Trial Expired) */}
            {!subscription && !isInTrial && !isApp && (
              <div className="p-4 bg-white/5 border border-white/20 rounded-xl">
                <p className="text-white/70 text-sm mb-3">
                  Subscribe to unlock all features.
                </p>
                <button
                  onClick={() => router.push('/home')}
                  className="w-full py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-semibold rounded-lg transition-colors"
                >
                  Subscribe Now
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Payment Method Section (if has subscription) */}
        {subscription && subscription.status === 'active' && !isApp && (
          <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Payment Method
            </h2>
            <p className="text-white/60 text-sm mb-3">
              Payments are processed securely via Square.
            </p>
            <button
              onClick={() => {
                // For now, redirect to checkout to update card
                alert('To update your payment method, please contact support at pastor.doug@thebusychristian.app');
              }}
              className="w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              Update payment method
            </button>
          </section>
        )}

        {/* Help Section */}
        <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Help & Support
          </h2>
          <div className="space-y-3">
            <a
              href="/help"
              className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <span className="text-white">Help Center</span>
              <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
            <a
              href="/privacy"
              className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <span className="text-white">Privacy Policy</span>
              <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
            <a
              href="mailto:pastor.doug@thebusychristian.app"
              className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <span className="text-white">Contact Support</span>
              <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </section>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className="w-full py-4 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400 rounded-2xl transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>

        {/* Version */}
        <p className="text-center text-white/30 text-xs">
          The Busy Christian v1.0.0
        </p>
      </main>
    </div>
  );
}
