// app/test-signin/page.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SignInPrompt } from '@/components/SignInPrompt';

export default function TestSignInPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [showSignIn, setShowSignIn] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-playfair text-4xl text-yellow-400 mb-6">
          Google Sign-In Test
        </h1>

        {isAuthenticated ? (
          // User is signed in
          <div className="space-y-6">
            <div className="bg-neutral-900 rounded-lg border border-yellow-400/20 p-6">
              <h2 className="text-2xl font-semibold mb-4 text-yellow-400">
                ✅ You're Signed In!
              </h2>
              
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  {user?.photoURL && (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-16 h-16 rounded-full border-2 border-yellow-400/30"
                    />
                  )}
                  <div>
                    <p className="text-xl font-semibold">{user?.displayName || 'Anonymous'}</p>
                    <p className="text-neutral-400">{user?.email}</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-neutral-800">
                  <p className="text-sm text-neutral-400 mb-2">User ID:</p>
                  <p className="text-xs font-mono bg-neutral-800 p-2 rounded break-all">
                    {user?.uid}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
              <p className="text-green-400">
                🎉 Success! Now check the top-right corner of the page - you should see your profile picture!
              </p>
            </div>

            <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-4">
              <h3 className="font-semibold mb-2">Next Steps:</h3>
              <ul className="space-y-2 text-sm text-neutral-300">
                <li>✓ Check header - profile picture should be visible</li>
                <li>✓ Click profile picture - see dropdown menu</li>
                <li>✓ Click "Sign Out" to test sign-out</li>
                <li>✓ Go to Prayer page to use authentication</li>
              </ul>
            </div>
          </div>
        ) : (
          // User is NOT signed in
          <div className="space-y-6">
            <div className="bg-neutral-900 rounded-lg border border-yellow-400/20 p-6">
              <h2 className="text-2xl font-semibold mb-4">
                Test Google Sign-In
              </h2>
              
              <p className="text-neutral-300 mb-6">
                Click the button below to test the Google Sign-In flow. After signing in, you'll see your profile information here.
              </p>

              <button
                onClick={() => setShowSignIn(true)}
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-neutral-900 font-semibold py-4 px-6 rounded-lg transition-all text-lg"
              >
                🔐 Test Google Sign-In
              </button>
            </div>

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
              <p className="text-sm text-blue-300">
                💡 <strong>Tip:</strong> After signing in, check the top-right corner of the page - your profile picture will appear!
              </p>
            </div>

            <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-4">
              <h3 className="font-semibold mb-2">What to expect:</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-neutral-300">
                <li>Click "Test Google Sign-In" button</li>
                <li>Sign-in modal will appear</li>
                <li>Click "Continue with Google"</li>
                <li>Google OAuth popup opens</li>
                <li>Select your Google account</li>
                <li>Popup closes automatically</li>
                <li>Your profile info appears here</li>
                <li>Profile picture appears in header</li>
              </ol>
            </div>
          </div>
        )}

        <SignInPrompt
          isOpen={showSignIn}
          onClose={() => setShowSignIn(false)}
          message="Test your Google Sign-In integration"
        />
      </div>
    </div>
  );
}