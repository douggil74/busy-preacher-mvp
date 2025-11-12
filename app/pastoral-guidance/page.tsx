'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Loader2, MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Playfair_Display } from 'next/font/google';
import { card, button, input, typography, cn } from '@/lib/ui-constants';
import { PastorNote } from '@/components/PastorNote';
import PastoralContactModal from '@/components/PastoralContactModal';
import PastoralInbox from '@/components/PastoralInbox';
import { useAuth } from '@/contexts/AuthContext';
import { SignInPrompt } from '@/components/SignInPrompt';

const playfair = Playfair_Display({
  weight: ["600", "700"],
  subsets: ["latin"],
  display: "swap",
});

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function PastoralGuidancePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [isCrisisModal, setIsCrisisModal] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Get user's first name from localStorage
    const name = localStorage.getItem('bc-user-name') || 'Anonymous';
    setFirstName(name);

    // Get or create session ID
    let session = localStorage.getItem('bc-pastoral-session-id');
    if (!session) {
      session = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('bc-pastoral-session-id', session);
    }
    setSessionId(session);
  }, []);

  // Create or get conversation when session ID is available
  useEffect(() => {
    const createConversation = async () => {
      if (!sessionId || !firstName) return;

      try {
        const response = await fetch('/api/pastoral-conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, firstName }),
        });

        const data = await response.json();
        if (data.conversation) {
          setConversationId(data.conversation.id);
        }
      } catch (error) {
        console.error('Failed to create conversation:', error);
      }
    };

    createConversation();
  }, [sessionId, firstName]);

  const getUserEmail = () => {
    return localStorage.getItem('bc-user-email') || undefined;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/pastoral-guidance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userMessage.content,
          conversationHistory: messages.slice(-4), // Send last 4 messages for context
          userName: firstName,
          userEmail: getUserEmail(),
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.answer,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Check for crisis/serious keywords
      const crisisKeywords = /\b(suicid|kill myself|end my life|want to die|self harm|hurt myself)\b/i;
      const seriousKeywords = /\b(abuse|being hurt|molest|assault|overdose|divorce|leaving god|walk away from faith|addiction|alcoholic|pornography|terminal|cancer|died|death of|lost my|job loss)\b/i;

      const isCrisis = crisisKeywords.test(userMessage.content);
      const isSerious = !isCrisis && seriousKeywords.test(userMessage.content);

      // Save messages to pastoral_messages table
      if (conversationId) {
        try {
          // Save user message
          await fetch('/api/pastoral-messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              conversationId,
              sender: 'user',
              message: userMessage.content,
              isAiResponse: false,
              flaggedSerious: isCrisis || isSerious,
            }),
          });

          // Save AI response
          await fetch('/api/pastoral-messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              conversationId,
              sender: 'assistant',
              message: data.answer,
              isAiResponse: true,
              flaggedSerious: isCrisis || isSerious,
            }),
          });
        } catch (saveError) {
          console.error('Failed to save messages:', saveError);
        }
      }

      // Show contact modal for crisis or serious situations
      if (isCrisis || isSerious) {
        setIsCrisisModal(isCrisis);
        setShowContactModal(true);
      }

      // Log the question for learning and improvement (privacy-safe)
      try {
        await fetch('/api/guidance-logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: firstName,
            question: userMessage.content,
            answer: data.answer,
            flagged: isCrisis || isSerious,
          }),
        });
      } catch (logError) {
        console.error('Failed to log question:', logError);
        // Don't show error to user - logging is non-critical
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Auth gate for Ask the Pastor
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-primary)' }}>
        <div className="max-w-md w-full">
          <div className="rounded-2xl p-8 shadow-2xl text-center" style={{
            backgroundColor: 'var(--card-bg)',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: 'var(--card-border)'
          }}>
            <div className="mb-6">
              <div className="inline-flex p-4 bg-gradient-to-br from-amber-500/10 to-amber-600/10 rounded-full mb-4">
                <MessageCircle className="w-12 h-12 text-amber-500" />
              </div>
            </div>
            <h2 className={`${playfair.className} ${typography.h2} mb-3`} style={{ color: 'var(--text-primary)' }}>
              Ask the Pastor
            </h2>
            <p className={cn(typography.body, 'mb-6')} style={{ color: 'var(--text-secondary)' }}>
              Sign in to receive personalized biblical guidance and wisdom for life's questions.
            </p>
            <button
              onClick={() => setShowSignIn(true)}
              className="w-full inline-flex items-center justify-center gap-3 rounded-lg bg-white text-gray-900 px-6 py-3 font-semibold hover:bg-gray-100 transition-all shadow-lg mb-4"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </button>
            <p className={cn(typography.xs)} style={{ color: 'var(--text-secondary)' }}>
              You can still access devotionals and reading plans without signing in
            </p>
          </div>

          <SignInPrompt
            isOpen={showSignIn}
            onClose={() => setShowSignIn(false)}
            message="Sign in to access pastoral guidance"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => router.push('/')}
          className="mb-6 flex items-center gap-2 text-sm transition-colors"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="text-center mb-8">
          <h1 className={cn(playfair.className, typography.h1, 'mb-3')} style={{ color: 'var(--text-primary)' }}>
            Ask the Pastor
          </h1>
          <div className="h-[2px] w-24 bg-gradient-to-r from-yellow-400 to-amber-400 mx-auto mb-4"></div>
          <p className={cn(typography.body, 'mb-4')} style={{ color: 'var(--text-secondary)' }}>
            Biblical wisdom and guidance for life's questions - ask anything on your heart
          </p>
          <div className="max-w-3xl mx-auto">
            <PastorNote variant="encouragement" />
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="max-w-4xl mx-auto px-4 py-4 pb-20">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="inline-flex p-3 bg-gradient-to-br from-amber-500/10 to-amber-600/10 rounded-full mb-3">
              <MessageCircle className="w-10 h-10 text-amber-500" />
            </div>
            <h2 className={cn(typography.h3, 'mb-2')} style={{ color: 'var(--text-primary)' }}>
              What's on your heart today?
            </h2>
            <p className={cn(typography.small, 'mb-6 max-w-md mx-auto')} style={{ color: 'var(--text-secondary)' }}>
              No question is too big or too small. Let's talk about what's going on in your life.
            </p>

            {/* Safety Disclaimer */}
            <div className="max-w-2xl mx-auto mb-6 p-4 rounded-xl text-left" style={{
              backgroundColor: 'var(--card-bg)',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'var(--card-border)'
            }}>
              <p className={cn(typography.small, 'mb-2')} style={{ color: 'var(--text-primary)' }}>
                <strong>Important:</strong> This is AI-assisted spiritual guidance based on pastoral teachings.
              </p>
              <p className={cn(typography.xs)} style={{ color: 'var(--text-secondary)' }}>
                • Not a substitute for professional counseling or medical care<br/>
                • For crisis situations, please call 988 (Suicide & Crisis Lifeline) or 911<br/>
                • Seek licensed professional help for serious mental health concerns
              </p>
            </div>

            {/* Example Questions */}
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px flex-1" style={{ backgroundColor: 'var(--card-border)' }}></div>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Example Questions
                </p>
                <div className="h-px flex-1" style={{ backgroundColor: 'var(--card-border)' }}></div>
              </div>
              <div className="grid gap-2">
                {[
                  "How do I deal with anxiety and fear?",
                  "What does the Bible say about forgiveness?",
                  "How can I grow closer to God?",
                  "How do I handle conflict in relationships?",
                ].map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(suggestion)}
                    className={cn(button.secondary, 'text-left')}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2`}
              >
                <div className="flex flex-col" style={{ maxWidth: '70%' }}>
                  {message.role === 'assistant' && (
                    <p className="text-xs font-medium mb-1 ml-2" style={{ color: 'var(--text-secondary)' }}>
                      Pastor
                    </p>
                  )}
                  <div
                    className={cn(
                      'px-4 py-2.5 shadow-sm',
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-t-2xl rounded-bl-2xl rounded-br-md'
                        : 'rounded-t-2xl rounded-br-2xl rounded-bl-md'
                    )}
                    style={message.role === 'assistant' ? {
                      backgroundColor: 'var(--card-bg)',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      borderColor: 'var(--card-border)',
                      color: 'var(--text-primary)'
                    } : undefined}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  </div>
                  <p
                    className="text-xs mt-1 px-2"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start items-end gap-2">
                <div className="rounded-t-2xl rounded-br-2xl rounded-bl-md px-4 py-3" style={{
                  backgroundColor: 'var(--card-bg)',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: 'var(--card-border)'
                }}>
                  <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="fixed bottom-4 left-0 right-0 backdrop-blur-sm rounded-t-2xl shadow-xl" style={{
        backgroundColor: 'var(--card-bg)',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'var(--card-border)'
      }}>
        <div className="max-w-4xl mx-auto px-4 py-3">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message Pastor..."
              disabled={isLoading}
              className="flex-1 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 transition-all duration-200 disabled:opacity-50"
              style={{
                backgroundColor: 'var(--input-bg)',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: 'var(--input-border)',
                color: 'var(--text-primary)'
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={cn(button.primary, 'flex items-center gap-2')}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Pastoral Inbox - Shows messages from pastor */}
      {sessionId && (
        <PastoralInbox sessionId={sessionId} firstName={firstName} />
      )}

      {/* Contact Modal - Shown for crisis/serious situations */}
      <PastoralContactModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        isCrisis={isCrisisModal}
        sessionId={sessionId}
        firstName={firstName}
      />
    </div>
  );
}
