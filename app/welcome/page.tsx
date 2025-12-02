// app/welcome/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Playfair_Display } from "next/font/google";
import { UserPlus, LogIn, ArrowRight, Mail, Phone } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ConfirmationResult } from "firebase/auth";

const playfair = Playfair_Display({
  weight: ["600", "700"],
  subsets: ["latin"],
  display: "swap",
});

type AuthMode = "choice" | "signin" | "signup";
type AuthMethod = "email" | "phone";

export default function WelcomePage() {
  const router = useRouter();
  const { user, signInWithEmail, signUpWithEmail, resetPassword, sendPhoneCode, verifyPhoneCode } = useAuth();

  const [mode, setMode] = useState<AuthMode>("choice");
  const [authMethod, setAuthMethod] = useState<AuthMethod>("email");

  // Email auth state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [isReset, setIsReset] = useState(false);

  // Phone auth state
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneFirstName, setPhoneFirstName] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [phoneStep, setPhoneStep] = useState<"enter" | "verify">("enter");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // If already authenticated, redirect to home
  useEffect(() => {
    if (user) {
      router.replace("/home");
    }
  }, [user, router]);

  // Check if returning user (has logged in before)
  useEffect(() => {
    const hasLoggedInBefore = localStorage.getItem("bc-has-logged-in");
    if (hasLoggedInBefore === "true") {
      // Returning user - show sign in by default
      setMode("signin");
    }
  }, []);

  const formatPhoneDisplay = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (isReset) {
        await resetPassword(email);
        setSuccessMessage("Password reset email sent! Check your inbox.");
        setIsReset(false);
      } else if (mode === "signin") {
        await signInWithEmail(email, password);
        localStorage.setItem("bc-has-logged-in", "true");
        localStorage.setItem("onboarding_completed", "true");
        router.push("/home");
      } else if (mode === "signup") {
        if (!firstName.trim()) {
          setError("Please enter your first name");
          setLoading(false);
          return;
        }
        await signUpWithEmail(email, password, firstName.trim(), firstName.trim());
        localStorage.setItem("bc-has-logged-in", "true");
        localStorage.setItem("bc-user-name", firstName.trim());
        // New users go to onboarding to learn about the app
        router.push("/onboarding");
      }
    } catch (err: any) {
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthError = (err: any) => {
    console.error("Auth error:", err.code, err.message);
    switch (err.code) {
      case "auth/invalid-email":
        setError("Please enter a valid email address");
        break;
      case "auth/user-not-found":
        setError("No account found with this email");
        break;
      case "auth/wrong-password":
      case "auth/invalid-credential":
      case "auth/invalid-login-credentials":
        setError("Invalid email or password");
        break;
      case "auth/email-already-in-use":
        setError("An account already exists with this email");
        break;
      case "auth/weak-password":
        setError("Password must be at least 6 characters");
        break;
      case "auth/too-many-requests":
        setError("Too many attempts. Please try again later.");
        break;
      default:
        setError(err.message || "Something went wrong");
    }
  };

  const handleSendPhoneCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const name = mode === "signup" ? phoneFirstName : phoneFirstName || "User";
      if (mode === "signup" && !name.trim()) {
        setError("Please enter your first name");
        setLoading(false);
        return;
      }

      const numbers = phoneNumber.replace(/\D/g, "");
      if (numbers.length !== 10) {
        setError("Please enter a valid 10-digit phone number");
        setLoading(false);
        return;
      }

      const result = await sendPhoneCode(numbers, "welcome-recaptcha-container");
      setConfirmationResult(result);
      setPhoneStep("verify");
      setSuccessMessage("Code sent! Check your messages.");
    } catch (err: any) {
      if (err.code === "auth/invalid-phone-number") {
        setError("Invalid phone number");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many attempts. Try again later.");
      } else {
        setError("Failed to send code");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!confirmationResult) {
        setError("Session expired. Please request a new code.");
        setPhoneStep("enter");
        return;
      }

      const name = mode === "signup" ? phoneFirstName.trim() : (phoneFirstName.trim() || "User");
      await verifyPhoneCode(confirmationResult, verificationCode, name);
      localStorage.setItem("bc-has-logged-in", "true");
      if (name) localStorage.setItem("bc-user-name", name);

      if (mode === "signup") {
        router.push("/onboarding");
      } else {
        localStorage.setItem("onboarding_completed", "true");
        router.push("/home");
      }
    } catch (err: any) {
      if (err.code === "auth/invalid-verification-code") {
        setError("Invalid code");
      } else {
        setError("Verification failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const resetAuthState = () => {
    setEmail("");
    setPassword("");
    setFirstName("");
    setPhoneNumber("");
    setPhoneFirstName("");
    setVerificationCode("");
    setConfirmationResult(null);
    setPhoneStep("enter");
    setError(null);
    setSuccessMessage(null);
    setIsReset(false);
  };

  // Initial choice screen
  if (mode === "choice") {
    return (
      <main
        className="min-h-screen flex flex-col items-center justify-center p-6"
        style={{ backgroundColor: "var(--bg-color)" }}
      >
        {/* Logo */}
        <div className="mb-8">
          <Image
            src="/logo.webp"
            alt="The Busy Christian"
            width={120}
            height={120}
            priority
            className="drop-shadow-lg"
          />
        </div>

        {/* Welcome Text */}
        <h1
          className={`${playfair.className} text-3xl font-bold text-center mb-2`}
          style={{ color: "var(--text-primary)" }}
        >
          Welcome
        </h1>
        <p
          className="text-center mb-10 max-w-xs"
          style={{ color: "var(--text-secondary)" }}
        >
          Your journey to deeper faith starts here
        </p>

        {/* Choice Buttons */}
        <div className="w-full max-w-sm space-y-4">
          <button
            onClick={() => { resetAuthState(); setMode("signup"); }}
            className="w-full py-4 px-6 rounded-2xl font-semibold flex items-center justify-between transition-all hover:scale-[1.02] shadow-lg"
            style={{
              backgroundColor: "var(--accent-color)",
              color: "var(--bg-color)",
            }}
          >
            <div className="flex items-center gap-3">
              <UserPlus className="w-5 h-5" />
              <span>I'm new here</span>
            </div>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={() => { resetAuthState(); setMode("signin"); }}
            className="w-full py-4 px-6 rounded-2xl font-semibold flex items-center justify-between transition-all hover:scale-[1.02]"
            style={{
              backgroundColor: "var(--card-bg)",
              border: "2px solid var(--card-border)",
              color: "var(--text-primary)",
            }}
          >
            <div className="flex items-center gap-3">
              <LogIn className="w-5 h-5" />
              <span>I have an account</span>
            </div>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </main>
    );
  }

  // Auth form (signin or signup)
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ backgroundColor: "var(--bg-color)" }}
    >
      {/* Logo */}
      <div className="mb-6">
        <Image
          src="/logo.webp"
          alt="The Busy Christian"
          width={80}
          height={80}
          priority
          className="drop-shadow-lg"
        />
      </div>

      {/* Header */}
      <h1
        className={`${playfair.className} text-2xl font-bold text-center mb-1`}
        style={{ color: "var(--text-primary)" }}
      >
        {isReset ? "Reset Password" : mode === "signup" ? "Create Account" : "Welcome Back"}
      </h1>
      <p
        className="text-center mb-6 text-sm"
        style={{ color: "var(--text-secondary)" }}
      >
        {isReset
          ? "Enter your email to reset your password"
          : mode === "signup"
          ? "Join our community of believers"
          : "Sign in to continue your journey"}
      </p>

      {/* Auth Method Toggle */}
      {!isReset && (
        <div className="flex gap-2 mb-4 w-full max-w-sm">
          <button
            onClick={() => setAuthMethod("email")}
            className="flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
            style={{
              backgroundColor: authMethod === "email"
                ? "color-mix(in srgb, var(--accent-color) 20%, transparent)"
                : "transparent",
              border: authMethod === "email"
                ? "2px solid var(--accent-color)"
                : "2px solid var(--card-border)",
              color: authMethod === "email" ? "var(--accent-color)" : "var(--text-secondary)",
            }}
          >
            <Mail className="w-4 h-4" />
            Email
          </button>
          <button
            onClick={() => setAuthMethod("phone")}
            className="flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
            style={{
              backgroundColor: authMethod === "phone"
                ? "color-mix(in srgb, var(--accent-color) 20%, transparent)"
                : "transparent",
              border: authMethod === "phone"
                ? "2px solid var(--accent-color)"
                : "2px solid var(--card-border)",
              color: authMethod === "phone" ? "var(--accent-color)" : "var(--text-secondary)",
            }}
          >
            <Phone className="w-4 h-4" />
            Phone
          </button>
        </div>
      )}

      {/* Error/Success Messages */}
      {error && (
        <div
          className="mb-4 p-3 rounded-lg text-sm w-full max-w-sm"
          style={{
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            color: "#ef4444",
          }}
        >
          {error}
        </div>
      )}
      {successMessage && (
        <div
          className="mb-4 p-3 rounded-lg text-sm w-full max-w-sm"
          style={{
            backgroundColor: "rgba(34, 197, 94, 0.1)",
            border: "1px solid rgba(34, 197, 94, 0.3)",
            color: "#22c55e",
          }}
        >
          {successMessage}
        </div>
      )}

      {/* Forms */}
      <div className="w-full max-w-sm">
        {/* Email Auth */}
        {(authMethod === "email" || isReset) && (
          <form onSubmit={handleEmailSubmit} className="space-y-3">
            {mode === "signup" && !isReset && (
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                className="w-full px-4 py-3 rounded-xl outline-none transition-all"
                style={{
                  backgroundColor: "var(--input-bg)",
                  border: "2px solid var(--input-border)",
                  color: "var(--input-text)",
                }}
                required
              />
            )}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full px-4 py-3 rounded-xl outline-none transition-all"
              style={{
                backgroundColor: "var(--input-bg)",
                border: "2px solid var(--input-border)",
                color: "var(--input-text)",
              }}
              required
            />
            {!isReset && (
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-3 rounded-xl outline-none transition-all"
                style={{
                  backgroundColor: "var(--input-bg)",
                  border: "2px solid var(--input-border)",
                  color: "var(--input-text)",
                }}
                required
                minLength={6}
              />
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold transition-all hover:scale-[1.02] disabled:opacity-50 flex items-center justify-center gap-2"
              style={{
                backgroundColor: "var(--accent-color)",
                color: "var(--bg-color)",
              }}
            >
              {loading
                ? "Please wait..."
                : isReset
                ? "Send Reset Email"
                : mode === "signup"
                ? "Create Account"
                : "Sign In"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Phone Auth */}
        {authMethod === "phone" && !isReset && (
          <>
            {phoneStep === "enter" ? (
              <form onSubmit={handleSendPhoneCode} className="space-y-3">
                {mode === "signup" && (
                  <input
                    type="text"
                    value={phoneFirstName}
                    onChange={(e) => setPhoneFirstName(e.target.value)}
                    placeholder="First name"
                    className="w-full px-4 py-3 rounded-xl outline-none transition-all"
                    style={{
                      backgroundColor: "var(--input-bg)",
                      border: "2px solid var(--input-border)",
                      color: "var(--input-text)",
                    }}
                    required
                  />
                )}
                <input
                  type="tel"
                  value={formatPhoneDisplay(phoneNumber)}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="(555) 555-5555"
                  className="w-full px-4 py-3 rounded-xl outline-none transition-all"
                  style={{
                    backgroundColor: "var(--input-bg)",
                    border: "2px solid var(--input-border)",
                    color: "var(--input-text)",
                  }}
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-semibold transition-all hover:scale-[1.02] disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: "var(--accent-color)",
                    color: "var(--bg-color)",
                  }}
                >
                  {loading ? "Sending..." : "Send Code"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyCode} className="space-y-3">
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="123456"
                  className="w-full px-4 py-3 rounded-xl outline-none text-center text-2xl tracking-widest"
                  style={{
                    backgroundColor: "var(--input-bg)",
                    border: "2px solid var(--input-border)",
                    color: "var(--input-text)",
                  }}
                  maxLength={6}
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-semibold transition-all hover:scale-[1.02] disabled:opacity-50"
                  style={{
                    backgroundColor: "var(--accent-color)",
                    color: "var(--bg-color)",
                  }}
                >
                  {loading ? "Verifying..." : "Verify"}
                </button>
                <button
                  type="button"
                  onClick={() => setPhoneStep("enter")}
                  className="w-full text-sm py-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Use different number
                </button>
              </form>
            )}
          </>
        )}

        {/* Invisible reCAPTCHA container */}
        <div id="welcome-recaptcha-container"></div>

        {/* Links */}
        <div className="mt-6 text-center space-y-3">
          {!isReset && mode === "signin" && (
            <button
              onClick={() => setIsReset(true)}
              className="text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              Forgot password?
            </button>
          )}
          {isReset && (
            <button
              onClick={() => setIsReset(false)}
              className="text-sm"
              style={{ color: "var(--accent-color)" }}
            >
              Back to sign in
            </button>
          )}

          {/* Switch mode */}
          <div className="pt-2 border-t" style={{ borderColor: "var(--card-border)" }}>
            <button
              onClick={() => {
                resetAuthState();
                setMode(mode === "signin" ? "signup" : "signin");
              }}
              className="text-sm"
              style={{ color: "var(--accent-color)" }}
            >
              {mode === "signin"
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>

          {/* Back to choice */}
          <button
            onClick={() => { resetAuthState(); setMode("choice"); }}
            className="text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            Back
          </button>
        </div>
      </div>
    </main>
  );
}
