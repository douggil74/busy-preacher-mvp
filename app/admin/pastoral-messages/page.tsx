'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, MessageCircle, Send, Mail, Phone, AlertTriangle, Clock, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AdminAuth from '@/components/AdminAuth';

interface Conversation {
  id: string;
  session_id: string;
  first_name: string;
  contact_email: string | null;
  contact_phone: string | null;
  contact_provided_at: string | null;
  has_unread_from_pastor: boolean;
  last_activity: string;
  created_at: string;
  latest_message: {
    message: string;
    created_at: string;
    sender: string;
    flagged_serious: boolean;
  } | null;
  unread_count: number;
}

interface Message {
  id: number;
  sender: string;
  message: string;
  created_at: string;
  is_ai_response: boolean;
  flagged_serious: boolean;
}

export default function PastoralMessagesPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState<'all' | 'flagged' | 'contact'>('all');

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [filter]);

  const fetchConversations = async () => {
    try {
      let url = '/api/pastoral-conversations?limit=100';
      if (filter === 'flagged') url += '&flaggedOnly=true';
      if (filter === 'contact') url += '&hasContact=true';

      const response = await fetch(url);
      const data = await response.json();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/pastoral-messages?conversationId=${conversationId}`);
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const handleSelectConversation = (conv: Conversation) => {
    setSelectedConv(conv);
    fetchMessages(conv.id);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || !selectedConv) return;

    setSending(true);

    try {
      const response = await fetch('/api/pastoral-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConv.id,
          sender: 'pastor',
          message: reply.trim(),
        }),
      });

      if (response.ok) {
        const { message: newMessage } = await response.json();
        setMessages([...messages, newMessage]);
        setReply('');
        fetchConversations(); // Refresh list
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const flaggedCount = conversations.filter(c => c.latest_message?.flagged_serious).length;
  const contactProvidedCount = conversations.filter(c => c.contact_email).length;

  return (
    <AdminAuth>
      <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
        {/* Header */}
        <div className="sticky top-0 z-10 backdrop-blur-sm" style={{
          backgroundColor: 'var(--card-bg)',
          borderBottomWidth: '1px',
          borderBottomStyle: 'solid',
          borderBottomColor: 'var(--card-border)'
        }}>
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin')}
                className="p-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: 'var(--card-hover)',
                  color: 'var(--text-secondary)'
                }}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  Pastoral Messages
                </h1>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  View and respond to pastoral guidance conversations
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="rounded-lg p-4" style={{
              backgroundColor: 'var(--card-bg)',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'var(--card-border)'
            }}>
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle className="w-5 h-5 text-blue-400" />
                <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Total Conversations</h3>
              </div>
              <p className="text-3xl font-bold text-blue-400">{conversations.length}</p>
            </div>

            <div className="rounded-lg p-4" style={{
              backgroundColor: 'var(--card-bg)',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'var(--card-border)'
            }}>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Flagged</h3>
              </div>
              <p className="text-3xl font-bold text-red-400">{flaggedCount}</p>
            </div>

            <div className="rounded-lg p-4" style={{
              backgroundColor: 'var(--card-bg)',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'var(--card-border)'
            }}>
              <div className="flex items-center gap-2 mb-2">
                <Mail className="w-5 h-5 text-green-400" />
                <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Contact Provided</h3>
              </div>
              <p className="text-3xl font-bold text-green-400">{contactProvidedCount}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all' ? 'bg-blue-500 text-white' : ''
              }`}
              style={filter !== 'all' ? {
                backgroundColor: 'var(--card-bg)',
                color: 'var(--text-secondary)',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: 'var(--card-border)'
              } : undefined}
            >
              All ({conversations.length})
            </button>
            <button
              onClick={() => setFilter('flagged')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'flagged' ? 'bg-red-500 text-white' : ''
              }`}
              style={filter !== 'flagged' ? {
                backgroundColor: 'var(--card-bg)',
                color: 'var(--text-secondary)',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: 'var(--card-border)'
              } : undefined}
            >
              Flagged ({flaggedCount})
            </button>
            <button
              onClick={() => setFilter('contact')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'contact' ? 'bg-green-500 text-white' : ''
              }`}
              style={filter !== 'contact' ? {
                backgroundColor: 'var(--card-bg)',
                color: 'var(--text-secondary)',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: 'var(--card-border)'
              } : undefined}
            >
              Has Contact ({contactProvidedCount})
            </button>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-3 gap-4" style={{ height: 'calc(100vh - 400px)' }}>
            {/* Conversations List */}
            <div className="col-span-1 rounded-lg overflow-hidden" style={{
              backgroundColor: 'var(--card-bg)',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'var(--card-border)'
            }}>
              <div className="p-4 border-b" style={{ borderColor: 'var(--card-border)' }}>
                <h2 className="font-bold" style={{ color: 'var(--text-primary)' }}>Conversations</h2>
              </div>
              <div className="overflow-y-auto" style={{ height: 'calc(100% - 60px)' }}>
                {loading ? (
                  <div className="p-4 text-center" style={{ color: 'var(--text-secondary)' }}>
                    Loading...
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="p-4 text-center" style={{ color: 'var(--text-secondary)' }}>
                    No conversations yet
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv)}
                      className={`w-full p-4 text-left border-b transition-colors ${
                        selectedConv?.id === conv.id ? 'bg-blue-500/10' : ''
                      }`}
                      style={{
                        borderColor: 'var(--card-border)',
                        backgroundColor: selectedConv?.id === conv.id ? undefined : 'transparent'
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                          <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {conv.first_name}
                          </span>
                        </div>
                        {conv.latest_message?.flagged_serious && (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        )}
                      </div>

                      {conv.contact_email && (
                        <div className="flex items-center gap-1 mb-1">
                          <Mail className="w-3 h-3 text-green-500" />
                          <span className="text-xs text-green-500">{conv.contact_email}</span>
                        </div>
                      )}

                      {conv.contact_phone && (
                        <div className="flex items-center gap-1 mb-2">
                          <Phone className="w-3 h-3 text-green-500" />
                          <span className="text-xs text-green-500">{conv.contact_phone}</span>
                        </div>
                      )}

                      {conv.latest_message && (
                        <p className="text-sm line-clamp-2 mb-2" style={{ color: 'var(--text-secondary)' }}>
                          {conv.latest_message.message}
                        </p>
                      )}

                      <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                        <Clock className="w-3 h-3" />
                        {new Date(conv.last_activity).toLocaleString()}
                      </div>

                      {conv.unread_count > 0 && (
                        <div className="mt-2 inline-block px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                          {conv.unread_count} unread
                        </div>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Messages Panel */}
            <div className="col-span-2 rounded-lg overflow-hidden flex flex-col" style={{
              backgroundColor: 'var(--card-bg)',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'var(--card-border)'
            }}>
              {selectedConv ? (
                <>
                  {/* Message Header */}
                  <div className="p-4 border-b" style={{ borderColor: 'var(--card-border)' }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                          {selectedConv.first_name}
                        </h2>
                        {selectedConv.contact_email && (
                          <p className="text-sm text-green-500">
                            {selectedConv.contact_email}
                            {selectedConv.contact_phone && ` • ${selectedConv.contact_phone}`}
                          </p>
                        )}
                      </div>
                      {selectedConv.latest_message?.flagged_serious && (
                        <div className="px-3 py-1 bg-red-500/20 border border-red-500 rounded-full">
                          <span className="text-xs font-semibold text-red-500">FLAGGED</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender === 'pastor' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] ${msg.is_ai_response ? 'opacity-60' : ''}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                              {msg.sender === 'pastor' ? 'You (Pastor)' : msg.sender === 'user' ? selectedConv.first_name : 'AI'}
                            </span>
                            {msg.is_ai_response && (
                              <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-500 rounded">AI</span>
                            )}
                            {msg.flagged_serious && (
                              <AlertTriangle className="w-3 h-3 text-red-500" />
                            )}
                          </div>
                          <div
                            className={`px-4 py-2 rounded-lg ${
                              msg.sender === 'pastor'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 dark:bg-gray-800'
                            }`}
                            style={msg.sender !== 'pastor' ? {
                              backgroundColor: 'var(--card-hover)',
                              color: 'var(--text-primary)'
                            } : undefined}
                          >
                            <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                          </div>
                          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                            {new Date(msg.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Reply Input */}
                  <form onSubmit={handleSendMessage} className="p-4 border-t" style={{ borderColor: 'var(--card-border)' }}>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        placeholder="Write a personal message..."
                        disabled={sending}
                        className="flex-1 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        disabled={!reply.trim() || sending}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        Send
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center" style={{ color: 'var(--text-secondary)' }}>
                  <div className="text-center">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Select a conversation to view messages</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminAuth>
  );
}
