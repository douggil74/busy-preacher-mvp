'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Loader2, MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Playfair_Display } from 'next/font/google';
import { card, button, input, typography, cn } from '@/lib/ui-constants';
import { PastorNote } from '@/components/PastorNote';

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [firstName, setFirstName] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Get user's first name from localStorage
    const name = localStorage.getItem('bc-user-name') || 'Anonymous';
    setFirstName(name);
  }, []);

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

      // Log the question for learning and improvement (privacy-safe)
      try {
        await fetch('/api/guidance-logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: firstName,
            question: userMessage.content,
            answer: data.answer,
            flagged: false,
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
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white text-xs font-bold mb-1">
                    P
                  </div>
                )}
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
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold mb-1">
                    {firstName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start items-end gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white text-xs font-bold mb-1">
                  P
                </div>
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
    </div>
  );
}
