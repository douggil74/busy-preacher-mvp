'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

interface Message {
  id: number;
  sender: string;
  message: string;
  created_at: string;
  is_ai_response: boolean;
}

interface PastoralInboxProps {
  sessionId: string;
  firstName: string;
}

export default function PastoralInbox({ sessionId, firstName }: PastoralInboxProps) {
  const [hasUnread, setHasUnread] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  // Check for unread messages
  useEffect(() => {
    const checkUnread = async () => {
      try {
        const response = await fetch(`/api/pastoral-messages?sessionId=${sessionId}`);
        const data = await response.json();

        if (data.conversation) {
          setConversationId(data.conversation.id);
          setHasUnread(data.hasUnread);
          setMessages(data.messages || []);
        }
      } catch (error) {
        console.error('Failed to check unread messages:', error);
      }
    };

    checkUnread();
    // Check every 30 seconds
    const interval = setInterval(checkUnread, 30000);
    return () => clearInterval(interval);
  }, [sessionId]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || !conversationId) return;

    setSending(true);

    try {
      const response = await fetch('/api/pastoral-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          sender: 'user',
          message: reply.trim(),
        }),
      });

      if (response.ok) {
        const { message: newMessage } = await response.json();
        setMessages([...messages, newMessage]);
        setReply('');
      }
    } catch (error) {
      console.error('Failed to send reply:', error);
    } finally {
      setSending(false);
    }
  };

  if (!hasUnread && !isOpen) return null;

  return (
    <>
      {/* Floating notification badge */}
      {hasUnread && !isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-6 z-40 flex items-center gap-2 px-4 py-3 bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all animate-pulse"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="font-semibold">Virtual Pastor sent you a message!</span>
        </button>
      )}

      {/* Message inbox panel */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-40 w-96 max-h-[600px] flex flex-col rounded-2xl shadow-2xl overflow-hidden" style={{
          backgroundColor: 'var(--card-bg)',
          borderWidth: '2px',
          borderStyle: 'solid',
          borderColor: 'var(--card-border)',
        }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-br from-amber-500 to-amber-600">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
                P
              </div>
              <div>
                <h3 className="font-bold text-white">Virtual Pastor</h3>
                <p className="text-xs text-white/80">Private conversation</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{
            maxHeight: '400px',
          }}>
            {messages.filter(m => !m.is_ai_response).map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-lg ${
                    msg.sender === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-100'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Reply input */}
          <form onSubmit={handleSendReply} className="border-t p-3" style={{
            borderColor: 'var(--card-border)',
          }}>
            <div className="flex gap-2">
              <input
                type="text"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Reply to Virtual Pastor..."
                disabled={sending}
                className="flex-1 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                style={{
                  backgroundColor: 'var(--input-bg)',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: 'var(--input-border)',
                  color: 'var(--text-primary)',
                }}
              />
              <button
                type="submit"
                disabled={!reply.trim() || sending}
                className="px-3 py-2 bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
