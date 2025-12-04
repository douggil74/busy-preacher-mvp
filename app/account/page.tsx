'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { usePlatform } from '@/hooks/usePlatform';
import { getUserSubscription, Subscription } from '@/lib/subscription';
import { APP_VERSION } from '@/lib/version';
import { Camera, User, Mail, Calendar, CreditCard, FileText, HelpCircle, Shield, LogOut, ChevronRight, Clock, CheckCircle, XCircle, AlertCircle, RotateCcw, Settings, Trash2 } from 'lucide-react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { isFromIOSApp } from '@/lib/platform-detector';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface PaymentRecord {
  id: string;
  date: string;
  amount: string;
  status: 'success' | 'failed' | 'pending' | 'refund';
  description: string;
}

export default function AccountPage() {
  const router = useRouter();
  const { user, signOut, isLoading: authLoading } = useAuth();
  const { isApp, isPaid, isInTrial, trialDaysRemaining, isWhitelisted, isLoading: platformLoading } = usePlatform();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancellingSubscription, setCancellingSubscription] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>([]);
  const [memberSince, setMemberSince] = useState<Date | null>(null);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);

  // Promo code state
  const [promoCode, setPromoCode] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoMessage, setPromoMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);

  // iOS native state
  const [isNative, setIsNative] = useState(false);

  // Detect iOS native on mount
  useEffect(() => {
    setIsNative(isFromIOSApp());
  }, []);

  useEffect(() => {
    async function loadData() {
      if (user?.uid) {
        // Load subscription
        const sub = await getUserSubscription(user.uid);
        setSubscription(sub);

        // Load profile data
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.photoURL) setProfilePic(data.photoURL);
            if (data.createdAt) {
              const date = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
              setMemberSince(date);
            }
          }
        } catch (e) {
          console.error('Error loading profile:', e);
        }

        // Load payment history from subscription
        if (sub && sub.paidAt) {
          const history: PaymentRecord[] = [];
          history.push({
            id: '1',
            date: formatDate(sub.paidAt),
            amount: sub.plan === 'annual' ? '$35.88' : '$3.99',
            status: 'success',
            description: `${sub.plan === 'annual' ? 'Annual' : 'Monthly'} Subscription`,
          });
          setPaymentHistory(history);
        }
        // No payment history for users without payments
      }
      setLoading(false);
    }
    loadData();
  }, [user]);

  useEffect(() => {
    if (!authLoading && !loading && !platformLoading && !user) {
      router.push('/home');
    }
  }, [user, authLoading, loading, platformLoading, router]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.uid) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }

    setUploadingPhoto(true);
    try {
      const storage = getStorage();
      const storageRef = ref(storage, `profile-photos/${user.uid}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      // Update Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        photoURL: downloadURL,
      });

      setProfilePic(downloadURL);
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Failed to upload photo. Please try again.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handlePromoCode = async () => {
    if (!promoCode.trim() || !user) return;

    setPromoLoading(true);
    setPromoMessage(null);

    try {
      const response = await fetch('/api/promo/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: promoCode.trim().toUpperCase(),
          userId: user.uid,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setPromoMessage({ type: 'error', text: data.error || 'Invalid promo code' });
        return;
      }

      setPromoMessage({
        type: 'success',
        text: data.promo?.hasForeverAccess
          ? 'You now have lifetime access!'
          : 'Promo code applied successfully!'
      });
      setPromoCode('');

      // Reload after a moment to reflect changes
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      setPromoMessage({ type: 'error', text: 'Failed to apply promo code' });
    } finally {
      setPromoLoading(false);
    }
  };

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
        const sub = await getUserSubscription(user.uid);
        setSubscription(sub);
        setShowCancelConfirm(false);
        alert('Your subscription has been cancelled. You will have access until the end of your billing period.');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to cancel subscription');
      }
    } catch (error) {
      alert('Failed to cancel subscription. Please try again.');
    } finally {
      setCancellingSubscription(false);
    }
  };

  const handleSubscribe = async () => {
    if (!user) return;

    // On iOS, use RevenueCat for In-App Purchase
    if (isNative) {
      setIsCheckingOut(true);
      try {
        const { initializeRevenueCat, getOfferings, purchasePackage } = await import('@/lib/revenuecat');
        await initializeRevenueCat(user.uid);
        const offerings = await getOfferings();

        // Find annual package (preferred) or monthly
        const annualPkg = offerings.find((p: any) => p.product.identifier.includes('annual'));
        const monthlyPkg = offerings.find((p: any) => p.product.identifier.includes('monthly'));
        const pkgToPurchase = annualPkg || monthlyPkg;

        if (!pkgToPurchase) {
          alert('Unable to load subscription options. Please try again.');
          setIsCheckingOut(false);
          return;
        }

        const customerInfo = await purchasePackage(pkgToPurchase);
        if (customerInfo) {
          alert('Subscription successful!');
          window.location.reload();
        }
      } catch (error) {
        console.error('iOS purchase failed:', error);
        alert('Purchase failed. Please try again.');
        setIsCheckingOut(false);
      }
      return;
    }

    // On web, use Square
    setIsCheckingOut(true);
    try {
      const response = await fetch('/api/checkout/square', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          userEmail: user.email,
          plan: 'annual',
        }),
      });

      const { url, error } = await response.json();

      if (error) throw new Error(error);
      if (url) window.location.href = url;
    } catch (error) {
      alert('Failed to start checkout. Please try again.');
      setIsCheckingOut(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const handleDeleteAccount = async () => {
    if (!user?.uid || deleteConfirmText !== 'DELETE') return;

    setDeletingAccount(true);
    try {
      const response = await fetch('/api/account/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid }),
      });

      if (response.ok) {
        // Sign out and redirect
        await signOut();
        // Clear local storage
        localStorage.clear();
        router.push('/');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete account. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account. Please try again.');
    } finally {
      setDeletingAccount(false);
    }
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (authLoading || loading || platformLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--accent-color)' }}></div>
      </div>
    );
  }

  // Determine access type - iOS app users can be in trial or subscribed
  // isPaid from usePlatform already checks iOS IAP via hasActiveIosSubscription
  const hasIosSubscription = isPaid && isNative && !isInTrial; // Paid iOS user who's not just in trial
  const hasActiveAccess = isPaid || isWhitelisted || (subscription?.status === 'active');
  const accessType = isWhitelisted ? 'Admin' : hasIosSubscription ? 'iOS Subscriber' : subscription?.status === 'active' ? 'Subscriber' : isInTrial ? `Free Trial (${trialDaysRemaining} days left)` : 'None';

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <header style={{ borderBottom: '1px solid var(--card-border)' }}>
        <div className="max-w-xl mx-auto px-4 md:pl-52 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="text-sm flex items-center gap-1 transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>v{APP_VERSION}</span>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-8">
        {/* Profile Section */}
        <section className="mb-8">
          <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
            <div className="flex items-center gap-4">
              {/* Profile Picture */}
              <div className="relative">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden"
                  style={{ backgroundColor: 'var(--accent-color)', color: 'var(--bg-color)' }}
                >
                  {profilePic ? (
                    <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold">
                      {getInitials(user.firstName || user.email || 'U')}
                    </span>
                  )}
                </div>
                {/* Hide photo upload on iOS native - file picker causes lockup */}
                {!isNative && (
                  <>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingPhoto}
                      className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                      style={{ backgroundColor: 'var(--card-bg)', border: '2px solid var(--card-border)' }}
                      title="Change photo"
                    >
                      {uploadingPhoto ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2" style={{ borderColor: 'var(--accent-color)' }} />
                      ) : (
                        <Camera className="w-3.5 h-3.5" style={{ color: 'var(--text-secondary)' }} />
                      )}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <h1 className="text-xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                  {user.firstName || 'User'}
                </h1>
                <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                  {user.email}
                </p>
                <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Member since {memberSince ? formatDate(memberSince) : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Preferences Button */}
        <section className="mb-6">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('openSettings'))}
            className="w-full rounded-xl p-4 flex items-center justify-between transition-colors hover:opacity-80"
            style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
          >
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5" style={{ color: 'var(--accent-color)' }} />
              <div className="text-left">
                <span className="text-sm font-medium block" style={{ color: 'var(--text-primary)' }}>Preferences</span>
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Study style, notifications, data & privacy</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
          </button>
        </section>

        {/* Subscription Status Card */}
        <section className="mb-6">
          <h2 className="text-sm font-medium mb-3 px-1" style={{ color: 'var(--text-secondary)' }}>Subscription</h2>
          <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Status</span>
              <span className={`text-sm font-medium px-2.5 py-1 rounded-full ${
                hasActiveAccess
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-white/10'
              }`} style={!hasActiveAccess ? { color: 'var(--text-secondary)' } : undefined}>
                {accessType}
              </span>
            </div>

            {/* Trial Info */}
            {isInTrial && !hasActiveAccess && (
              <div className="mb-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <p className="text-blue-400 text-sm">
                    {trialDaysRemaining > 0
                      ? `${trialDaysRemaining} day${trialDaysRemaining === 1 ? '' : 's'} left in free trial`
                      : 'Your free trial has ended'}
                  </p>
                </div>
              </div>
            )}

            {/* Active Subscription Details */}
            {subscription?.status === 'active' && !isApp && (
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--text-secondary)' }}>Plan</span>
                  <span style={{ color: 'var(--text-primary)' }}>
                    {subscription.plan === 'annual' ? 'Annual ($35.88/yr)' : 'Monthly ($3.99/mo)'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--text-secondary)' }}>Next billing</span>
                  <span style={{ color: 'var(--text-primary)' }}>{formatDate(subscription.currentPeriodEnd)}</span>
                </div>
                {subscription.paidAt && (
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--text-secondary)' }}>Last payment</span>
                    <span style={{ color: 'var(--text-primary)' }}>{formatDate(subscription.paidAt)}</span>
                  </div>
                )}
              </div>
            )}

            {/* iOS App - Trial Info */}
            {isNative && isInTrial && !hasIosSubscription && (
              <div className="mb-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <p className="text-blue-400 text-sm font-medium">
                    {trialDaysRemaining > 0
                      ? `${trialDaysRemaining} day${trialDaysRemaining === 1 ? '' : 's'} left in free trial`
                      : 'Your free trial has ended'}
                  </p>
                </div>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Subscribe to continue enjoying all features after your trial ends.
                </p>
              </div>
            )}

            {/* iOS App Subscribe Button */}
            {isNative && !hasIosSubscription && (
              <button
                onClick={handleSubscribe}
                disabled={isCheckingOut}
                className="w-full py-3 font-medium rounded-lg transition-colors disabled:opacity-50 mb-4"
                style={{ backgroundColor: 'var(--accent-color)', color: 'var(--bg-color)' }}
              >
                {isCheckingOut ? 'Loading...' : 'Subscribe - $2.99/mo'}
              </button>
            )}

            {/* iOS App Subscription Management */}
            {isNative && hasIosSubscription && (
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                Manage your subscription in iOS Settings &gt; Apple ID &gt; Subscriptions
              </p>
            )}

            {/* Whitelisted Message */}
            {isWhitelisted && (
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                You have admin access with full features enabled.
              </p>
            )}

            {/* Subscribe Button */}
            {!hasActiveAccess && !isInTrial && (
              <button
                onClick={handleSubscribe}
                disabled={isCheckingOut}
                className="w-full py-3 font-medium rounded-lg transition-colors disabled:opacity-50"
                style={{ backgroundColor: 'var(--accent-color)', color: 'var(--bg-color)' }}
              >
                {isCheckingOut ? 'Loading...' : 'Subscribe - $2.99/mo'}
              </button>
            )}

            {/* Trial Subscribe Button */}
            {isInTrial && !hasActiveAccess && (
              <button
                onClick={handleSubscribe}
                disabled={isCheckingOut}
                className="w-full py-3 font-medium rounded-lg transition-colors disabled:opacity-50"
                style={{ backgroundColor: 'var(--accent-color)', color: 'var(--bg-color)' }}
              >
                {isCheckingOut ? 'Loading...' : 'Subscribe Now'}
              </button>
            )}

            {/* Cancel Subscription */}
            {subscription?.status === 'active' && !isApp && !isWhitelisted && (
              <>
                {!showCancelConfirm ? (
                  <button
                    onClick={() => setShowCancelConfirm(true)}
                    className="w-full mt-3 text-red-400/80 hover:text-red-400 text-sm transition-colors"
                  >
                    Cancel subscription
                  </button>
                ) : (
                  <div className="mt-4 p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                    <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                      Are you sure? You'll have access until {formatDate(subscription.currentPeriodEnd)}.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowCancelConfirm(false)}
                        className="flex-1 py-2 text-sm rounded-lg transition-colors"
                        style={{ backgroundColor: 'var(--card-hover)', color: 'var(--text-primary)' }}
                      >
                        Keep Subscription
                      </button>
                      <button
                        onClick={handleCancelSubscription}
                        disabled={cancellingSubscription}
                        className="flex-1 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50"
                      >
                        {cancellingSubscription ? 'Cancelling...' : 'Cancel'}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Cancelled Subscription */}
            {subscription?.status === 'canceled' && (
              <div className="mt-4 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                <p className="text-yellow-400/80 text-sm mb-2">
                  Cancelled. Access until {formatDate(subscription.currentPeriodEnd)}.
                </p>
                <button
                  onClick={handleSubscribe}
                  disabled={isCheckingOut}
                  className="w-full py-2 font-medium rounded-lg text-sm transition-colors disabled:opacity-50"
                  style={{ backgroundColor: 'var(--accent-color)', color: 'var(--bg-color)' }}
                >
                  {isCheckingOut ? 'Loading...' : 'Resubscribe'}
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Payment History */}
        <section className="mb-6">
          <button
            onClick={() => setShowPaymentHistory(!showPaymentHistory)}
            className="w-full rounded-xl p-4 flex items-center justify-between transition-colors"
            style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
          >
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5" style={{ color: 'var(--accent-color)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Payment History</span>
              {paymentHistory.length > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
                  {paymentHistory.length}
                </span>
              )}
            </div>
            <ChevronRight
              className={`w-5 h-5 transition-transform ${showPaymentHistory ? 'rotate-90' : ''}`}
              style={{ color: 'var(--text-secondary)' }}
            />
          </button>

          {showPaymentHistory && (
            <div className="mt-2 rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
              {paymentHistory.length === 0 ? (
                <div className="p-6 text-center">
                  <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-30" style={{ color: 'var(--text-secondary)' }} />
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No payment history yet</p>
                  {isWhitelisted && (
                    <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Admin accounts have complimentary access</p>
                  )}
                </div>
              ) : (
                paymentHistory.map((payment, index) => (
                  <div
                    key={payment.id}
                    className="p-4 flex items-center justify-between"
                    style={index > 0 ? { borderTop: '1px solid var(--card-border)' } : undefined}
                  >
                    <div className="flex items-center gap-3">
                      {payment.status === 'success' ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : payment.status === 'failed' ? (
                        <XCircle className="w-5 h-5 text-red-400" />
                      ) : payment.status === 'refund' ? (
                        <RotateCcw className="w-5 h-5 text-blue-400" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-yellow-400" />
                      )}
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                          {payment.description}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          {payment.date}
                        </p>
                      </div>
                    </div>
                    <span className={`text-sm font-medium ${payment.status === 'refund' ? 'text-green-400' : ''}`} style={payment.status !== 'refund' ? { color: 'var(--text-primary)' } : undefined}>
                      {payment.amount}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </section>

        {/* Promo Code Section */}
        {!hasActiveAccess && (
          <section className="mb-6">
            <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
              <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>Have a promo code?</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="Enter code"
                  className="flex-1 rounded-lg px-3 py-2 text-sm placeholder-white/30 focus:outline-none uppercase"
                  style={{
                    backgroundColor: 'var(--input-bg)',
                    border: '1px solid var(--input-border)',
                    color: 'var(--text-primary)'
                  }}
                  disabled={promoLoading}
                  onKeyDown={(e) => e.key === 'Enter' && handlePromoCode()}
                />
                <button
                  onClick={handlePromoCode}
                  disabled={promoLoading || !promoCode.trim()}
                  className="px-4 py-2 text-sm rounded-lg transition-colors disabled:opacity-50"
                  style={{ backgroundColor: 'var(--card-hover)', color: 'var(--text-primary)' }}
                >
                  {promoLoading ? '...' : 'Apply'}
                </button>
              </div>
              {promoMessage && (
                <p className={`mt-2 text-sm ${promoMessage.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                  {promoMessage.text}
                </p>
              )}
            </div>
          </section>
        )}

        {/* Quick Links */}
        <section className="mb-6">
          <h2 className="text-sm font-medium mb-3 px-1" style={{ color: 'var(--text-secondary)' }}>Help & Info</h2>
          <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
            <Link
              href="/help"
              className="flex items-center justify-between p-4 transition-colors hover:bg-white/5"
              style={{ borderBottom: '1px solid var(--card-border)' }}
            >
              <div className="flex items-center gap-3">
                <HelpCircle className="w-5 h-5" style={{ color: 'var(--accent-color)' }} />
                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Help & Guide</span>
              </div>
              <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
            </Link>
            <Link
              href="/about"
              className="flex items-center justify-between p-4 transition-colors hover:bg-white/5"
              style={{ borderBottom: '1px solid var(--card-border)' }}
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5" style={{ color: 'var(--accent-color)' }} />
                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>About</span>
              </div>
              <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
            </Link>
            <Link
              href="/privacy"
              className="flex items-center justify-between p-4 transition-colors hover:bg-white/5"
              style={{ borderBottom: '1px solid var(--card-border)' }}
            >
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5" style={{ color: 'var(--accent-color)' }} />
                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Privacy Policy</span>
              </div>
              <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
            </Link>
            <a
              href="mailto:thebusychristianapp@gmail.com"
              className="flex items-center justify-between p-4 transition-colors hover:bg-white/5"
            >
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5" style={{ color: 'var(--accent-color)' }} />
                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Contact Support</span>
              </div>
              <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
            </a>
          </div>
        </section>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className="w-full py-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
          style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
        >
          <LogOut className="w-5 h-5 text-red-400" />
          <span className="text-red-400 font-medium">Sign Out</span>
        </button>

        {/* Delete Account */}
        <section className="mt-8">
          <h2 className="text-sm font-medium mb-3 px-1 text-red-400/70">Danger Zone</h2>
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full py-4 rounded-xl flex items-center justify-center gap-2 transition-colors border border-red-500/30 hover:border-red-500/50"
              style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
            >
              <Trash2 className="w-5 h-5 text-red-400" />
              <span className="text-red-400 font-medium">Delete Account</span>
            </button>
          ) : (
            <div className="rounded-xl p-5 border border-red-500/30" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="font-medium text-red-400">Delete Account Permanently</h3>
                  <p className="text-xs text-red-400/70">This action cannot be undone</p>
                </div>
              </div>

              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  This will permanently delete:
                </p>
                <ul className="text-sm mt-2 space-y-1" style={{ color: 'var(--text-secondary)' }}>
                  <li>• Your account and profile</li>
                  <li>• All saved prayers and devotionals</li>
                  <li>• Reading progress and history</li>
                  <li>• Any active subscriptions</li>
                </ul>
              </div>

              <div className="mb-4">
                <label className="text-sm mb-2 block" style={{ color: 'var(--text-secondary)' }}>
                  Type <strong className="text-red-400">DELETE</strong> to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value.toUpperCase())}
                  placeholder="DELETE"
                  className="w-full rounded-lg px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  style={{
                    backgroundColor: 'var(--input-bg)',
                    border: '1px solid var(--input-border)',
                    color: 'var(--text-primary)'
                  }}
                  disabled={deletingAccount}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmText('');
                  }}
                  className="flex-1 py-3 text-sm rounded-lg transition-colors"
                  style={{ backgroundColor: 'var(--card-hover)', color: 'var(--text-primary)' }}
                  disabled={deletingAccount}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== 'DELETE' || deletingAccount}
                  className="flex-1 py-3 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deletingAccount ? 'Deleting...' : 'Delete Forever'}
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Footer */}
        <p className="text-center text-xs mt-8" style={{ color: 'var(--text-secondary)' }}>
          The Busy Christian &middot; Made with faith
        </p>
      </main>
    </div>
  );
}
