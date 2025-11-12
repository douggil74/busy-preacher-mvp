'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Loader2, MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { card, button, input, typography, cn } from '@/lib/ui-constants';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={cn(typography.h3, 'text-slate-900 dark:text-white')}>Pastoral Guidance</h1>
              <p className={cn(typography.xs, 'text-slate-600 dark:text-slate-400')}>Biblical wisdom and guidance</p>
            </div>
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
            <h2 className={cn(typography.h3, 'mb-2 text-slate-900 dark:text-white')}>How can I help you today?</h2>
            <p className={cn(typography.small, 'text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto')}>
              Ask any question about faith, life challenges, relationships, or spiritual growth.
            </p>

            {/* Safety Disclaimer */}
            <div className="max-w-2xl mx-auto mb-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 text-left">
              <p className={cn(typography.small, 'text-blue-900 dark:text-blue-200 mb-2')}>
                <strong>Important:</strong> This is AI-assisted spiritual guidance based on pastoral teachings.
              </p>
              <p className={cn(typography.xs, 'text-blue-800 dark:text-blue-300')}>
                • Not a substitute for professional counseling or medical care<br/>
                • For crisis situations, please call 988 (Suicide & Crisis Lifeline) or 911<br/>
                • Seek licensed professional help for serious mental health concerns
              </p>
            </div>

            {/* Suggested Questions */}
            <div className="grid gap-2 max-w-2xl mx-auto">
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
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={cn(
                    'max-w-[80%] rounded-2xl px-4 py-3',
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-white'
                      : 'bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-100'
                  )}
                >
                  <p className={cn(typography.body, 'whitespace-pre-wrap')}>{message.content}</p>
                  <p
                    className={cn(
                      typography.xs,
                      'mt-2',
                      message.role === 'user' ? 'text-amber-100' : 'text-slate-500 dark:text-slate-500'
                    )}
                  >
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className={cn(card.default, 'rounded-2xl px-4 py-3')}>
                  <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="fixed bottom-4 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-t-2xl shadow-xl">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="What's on your heart?"
              disabled={isLoading}
              className="flex-1 px-4 py-3 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/20 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 transition-all duration-200 disabled:opacity-50"
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
