'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function TestSquarePage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'monthly'>('annual');

  const handleTestCheckout = async () => {
    if (!user) {
      setResult('Error: Not signed in');
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/checkout/square', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          userEmail: user.email,
          userName: user.firstName || user.fullName,
          plan: selectedPlan,
        }),
      });

      const data = await response.json();

      if (data.error) {
        setResult(`Error: ${data.error}`);
      } else if (data.url) {
        setResult(`Success! Redirecting to Square checkout...`);
        // Redirect to Square checkout
        window.location.href = data.url;
      } else {
        setResult(`Unexpected response: ${JSON.stringify(data)}`);
      }
    } catch (error: any) {
      setResult(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Square Checkout Test</h1>

        {!user ? (
          <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400">
            Please sign in first to test checkout
          </div>
        ) : (
          <div className="space-y-6">
            {/* User Info */}
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
              <h2 className="text-lg font-semibold text-white mb-2">Logged in as:</h2>
              <p className="text-white/70">{user.email}</p>
              <p className="text-white/50 text-sm">UID: {user.uid}</p>
            </div>

            {/* Plan Selection */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-white">Select Plan:</h2>

              <button
                onClick={() => setSelectedPlan('annual')}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                  selectedPlan === 'annual'
                    ? 'border-yellow-400 bg-yellow-400/10'
                    : 'border-white/20 bg-white/5'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-bold text-white">Annual</span>
                    <p className="text-white/60 text-sm">$35.88/year</p>
                  </div>
                  <span className="text-yellow-400 font-bold">$2.99/mo</span>
                </div>
              </button>

              <button
                onClick={() => setSelectedPlan('monthly')}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                  selectedPlan === 'monthly'
                    ? 'border-yellow-400 bg-yellow-400/10'
                    : 'border-white/20 bg-white/5'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-bold text-white">Monthly</span>
                    <p className="text-white/60 text-sm">Billed monthly</p>
                  </div>
                  <span className="text-white font-bold">$3.99/mo</span>
                </div>
              </button>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleTestCheckout}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-slate-900 font-bold py-4 px-6 rounded-xl transition-all disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : `Test ${selectedPlan} Checkout`}
            </button>

            {/* Result */}
            {result && (
              <div className={`p-4 rounded-xl ${
                result.startsWith('Error')
                  ? 'bg-red-500/20 border border-red-500/30 text-red-400'
                  : 'bg-green-500/20 border border-green-500/30 text-green-400'
              }`}>
                {result}
              </div>
            )}

            {/* Square Sandbox Test Cards */}
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
              <h3 className="text-blue-400 font-semibold mb-2">Square Sandbox Test Cards:</h3>
              <div className="space-y-1 text-white/70 text-sm font-mono">
                <p>Success: 4532 0123 4567 8901</p>
                <p>Decline: 4000 0000 0000 0002</p>
                <p>CVV: Any 3 digits</p>
                <p>Exp: Any future date</p>
                <p>ZIP: Any 5 digits</p>
              </div>
            </div>

            {/* Environment Info */}
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-white/50 text-sm">
              <p>Environment: <span className="text-yellow-400">Sandbox</span></p>
              <p className="mt-1">No real charges will be made</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
