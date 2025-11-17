'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, MessageCircle, Download, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Playfair_Display } from 'next/font/google';
import { card, button, input, typography, cn } from '@/lib/ui-constants';
import { EncouragingBanner } from '@/components/EncouragingBanner';
import PastoralContactModal from '@/components/PastoralContactModal';
import { getPastorNote } from '@/lib/personalMessages';
import MandatoryReportingModal from '@/components/MandatoryReportingModal';
import PastoralInbox from '@/components/PastoralInbox';
import { useAuth } from '@/contexts/AuthContext';
import jsPDF from 'jspdf';

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
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [isCrisisModal, setIsCrisisModal] = useState(false);
  const [showMandatoryModal, setShowMandatoryModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isEmailing, setIsEmailing] = useState(false);
  const [pastorNote, setPastorNote] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalShownForMessages = useRef<Set<string>>(new Set());

  // Generate dynamic pastor message
  useEffect(() => {
    setPastorNote(getPastorNote());
  }, []);

  // Export to PDF
  const handleExportPDF = () => {
    if (messages.length === 0) return;

    setIsExporting(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      const maxWidth = pageWidth - margin * 2;
      let yPosition = 20;

      // Title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Pastoral Guidance Conversation', margin, yPosition);
      yPosition += 10;

      // Date
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }), margin, yPosition);
      yPosition += 15;

      // Messages
      messages.forEach((msg, index) => {
        const isUser = msg.role === 'user';
        const label = isUser ? (firstName || 'You') : 'Pastor Doug';
        const timestamp = new Date(msg.timestamp).toLocaleString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        });

        // Check if we need a new page
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }

        // Message header
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(`${label} - ${timestamp}`, margin, yPosition);
        yPosition += 6;

        // Message content
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const lines = doc.splitTextToSize(msg.content, maxWidth);
        lines.forEach((line: string) => {
          if (yPosition > 275) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(line, margin, yPosition);
          yPosition += 5;
        });

        yPosition += 8; // Space between messages
      });

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.text(
          'The Busy Christian - Cornerstone Church, Mandeville, LA',
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }

      // Save PDF
      const filename = `pastoral-guidance-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);
    } catch (error) {
      console.error('Failed to export PDF:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Email transcript
  const handleEmailTranscript = async () => {
    if (messages.length === 0) return;

    const userEmail = getUserEmail();
    if (!userEmail) {
      alert('Please provide your email address in the contact form first.');
      return;
    }

    setIsEmailing(true);
    try {
      const response = await fetch('/api/pastoral-transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          firstName,
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp.toISOString(),
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      alert('Transcript sent! Check your email.');
    } catch (error) {
      console.error('Failed to email transcript:', error);
      alert('Failed to send email. Please try again.');
    } finally {
      setIsEmailing(false);
    }
  };

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

        if (!response.ok) {
          console.error('Failed to create conversation:', response.status);
          return;
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error('Expected JSON response but got:', contentType);
          return;
        }

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
    if (typeof window === 'undefined') return undefined;
    return localStorage.getItem('bc-user-email') || undefined;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-focus input after messages update and loading completes
  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [messages, isLoading]);

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
          sessionId: sessionId, // Send session ID for mandatory reporting
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Expected JSON but got ${contentType}`);
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.answer,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Use API's detection flags
      const isCrisis = data.isCrisis || false;
      const isSerious = data.isSerious || false;
      const isMandatoryReport = data.isMandatoryReport || false;

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

      // PRIORITY 1: Show MANDATORY reporting modal if minor reporting abuse (cannot skip)
      if (isMandatoryReport && !modalShownForMessages.current.has(assistantMessage.id)) {
        modalShownForMessages.current.add(assistantMessage.id);
        setTimeout(() => {
          setShowMandatoryModal(true);
        }, 500);
      }
      // PRIORITY 2: Show contact modal for crisis or serious situations (can skip)
      else if ((isCrisis || isSerious) && !modalShownForMessages.current.has(assistantMessage.id)) {
        modalShownForMessages.current.add(assistantMessage.id);
        setIsCrisisModal(isCrisis);
        setTimeout(() => {
          setShowContactModal(true);
        }, 500); // Small delay to ensure messages are fully rendered
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

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <style jsx>{`
        .message-bubble-user::after {
          content: '';
          position: absolute;
          bottom: 0;
          right: -6px;
          width: 0;
          height: 0;
          border-left: 8px solid #007AFF;
          border-bottom: 8px solid transparent;
          border-top: 8px solid transparent;
        }

        .message-bubble-pastor::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: -6px;
          width: 0;
          height: 0;
          border-right: 8px solid var(--card-bg);
          border-bottom: 8px solid transparent;
          border-top: 8px solid transparent;
        }
      `}</style>
      {pastorNote && <EncouragingBanner message={pastorNote} />}

      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-sm transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          {/* Export buttons - only show when there are messages */}
          {messages.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportPDF}
                disabled={isExporting}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80 disabled:opacity-50"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: 'var(--card-border)',
                  color: 'var(--text-primary)',
                }}
                title="Export conversation to PDF"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">{isExporting ? 'Exporting...' : 'PDF'}</span>
              </button>
              <button
                onClick={handleEmailTranscript}
                disabled={isEmailing}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80 disabled:opacity-50"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: 'var(--card-border)',
                  color: 'var(--text-primary)',
                }}
                title="Email transcript to yourself"
              >
                <Mail className="w-4 h-4" />
                <span className="hidden sm:inline">{isEmailing ? 'Sending...' : 'Email'}</span>
              </button>
            </div>
          )}
        </div>

        <div className="text-center mb-6">
          <h1 className={cn(playfair.className, typography.h1, 'mb-3')} style={{ color: 'var(--text-primary)' }}>
            Ask the Pastor
          </h1>
          <div className="h-[2px] w-24 bg-gradient-to-r from-yellow-400 to-amber-400 mx-auto mb-3"></div>
          <p className={cn(typography.body)} style={{ color: 'var(--text-secondary)' }}>
            Biblical wisdom and guidance for life's questions - ask anything on your heart
          </p>
        </div>
      </div>

      {/* Input Form - Shows at top when no messages, hides when conversation starts */}
      {messages.length === 0 && (
        <div className="max-w-4xl mx-auto px-4 pb-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message Pastor..."
              disabled={isLoading}
              autoFocus
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
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}

      {/* Messages Container */}
      <div className="max-w-4xl mx-auto px-4 py-3 pb-24">
        {messages.length === 0 ? (
          <div className="text-center py-4">
            <div className="inline-flex p-3 bg-gradient-to-br from-amber-500/10 to-amber-600/10 rounded-full mb-3">
              <MessageCircle className="w-10 h-10 text-amber-500" />
            </div>
            <h2 className={cn(typography.h3, 'mb-2')} style={{ color: 'var(--text-primary)' }}>
              What's on your heart today?
            </h2>
            <p className={cn(typography.small, 'mb-4 max-w-md mx-auto')} style={{ color: 'var(--text-secondary)' }}>
              No question is too big or too small. Let's talk about what's going on in your life.
            </p>

            {/* Example Questions */}
            <div className="max-w-2xl mx-auto mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-px flex-1" style={{ backgroundColor: 'var(--card-border)' }}></div>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Be Yourself • Ask Anything
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
                    className={cn(button.secondary, 'text-left italic')}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Safety Disclaimer */}
            <div className="max-w-2xl mx-auto p-4 rounded-xl text-left" style={{
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
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2`}
              >
                <div className="flex flex-col" style={{ maxWidth: '70%', position: 'relative' }}>
                  {message.role === 'assistant' && (
                    <p className="text-xs font-medium mb-1 ml-2" style={{ color: 'var(--text-secondary)' }}>
                      Pastor
                    </p>
                  )}
                  <div
                    className={cn(
                      'px-4 py-3 relative',
                      message.role === 'user'
                        ? 'rounded-2xl !text-white message-bubble-user'
                        : 'rounded-2xl shadow-sm message-bubble-pastor'
                    )}
                    style={message.role === 'user' ? {
                      backgroundColor: '#007AFF',
                      color: 'white',
                    } : {
                      backgroundColor: 'var(--card-bg)',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      borderColor: 'var(--card-border)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <p
                      className={message.role === 'user' ? 'text-sm leading-relaxed whitespace-pre-wrap !text-white' : 'text-sm leading-relaxed whitespace-pre-wrap'}
                    >
                      {message.content}
                    </p>
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
                <div className="flex flex-col" style={{ maxWidth: '70%' }}>
                  <p className="text-xs font-medium mb-1 ml-2" style={{ color: 'var(--text-secondary)' }}>
                    Pastor
                  </p>
                  <div className="rounded-t-2xl rounded-br-2xl rounded-bl-md px-5 py-3" style={{
                    backgroundColor: 'var(--card-bg)',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: 'var(--card-border)'
                  }}>
                    {/* Animated typing dots like iMessage */}
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms', animationDuration: '1.4s' }}></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '200ms', animationDuration: '1.4s' }}></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '400ms', animationDuration: '1.4s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Form - Shows at bottom during conversation */}
      {messages.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 backdrop-blur-sm" style={{
          backgroundColor: 'color-mix(in srgb, var(--card-bg) 95%, transparent)',
          borderTopWidth: '1px',
          borderTopStyle: 'solid',
          borderTopColor: 'var(--card-border)'
        }}>
          <div className="max-w-4xl mx-auto px-4 py-3">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                ref={inputRef}
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
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Pastoral Inbox - Shows messages from pastor */}
      {sessionId && (
        <PastoralInbox sessionId={sessionId} firstName={firstName} />
      )}

      {/* Mandatory Reporting Modal - PRIORITY: Shown when minor reports abuse (cannot skip) */}
      <MandatoryReportingModal
        isOpen={showMandatoryModal}
        onSubmit={(info) => {
          console.log('Mandatory report submitted:', info);
          setShowMandatoryModal(false);
        }}
        sessionId={sessionId}
        userEmail={getUserEmail()}
      />

      {/* Contact Modal - Shown for crisis/serious situations (can skip) */}
      <PastoralContactModal
        isOpen={showContactModal}
        onClose={() => {
          setShowContactModal(false);
          // Clear the tracking to allow modal to show again for future crises
          // modalShownForMessages.current.clear(); // Keep tracking to prevent re-showing same modal
        }}
        isCrisis={isCrisisModal}
        sessionId={sessionId}
        firstName={firstName}
      />
    </div>
  );
}
