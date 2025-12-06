import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export async function POST(request: NextRequest) {
  try {
    const { email, firstName, messages } = await request.json();

    if (!email || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Email and messages are required' },
        { status: 400 }
      );
    }

    // Format conversation for email
    let conversationHtml = '';
    messages.forEach((msg: Message) => {
      const isUser = msg.role === 'user';
      const name = isUser ? (firstName || 'You') : 'Pastor';
      const bgColor = isUser ? '#ebe5d9' : '#f5f1e8';
      const time = new Date(msg.timestamp).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });

      conversationHtml += `
        <div style="margin-bottom: 20px; padding: 16px; background: ${bgColor}; border-radius: 12px; border-left: 4px solid ${isUser ? '#b8860b' : '#3b82f6'};">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <strong style="color: #2d2520; font-size: 14px;">${name}</strong>
            <span style="color: #5a4f46; font-size: 12px;">${time}</span>
          </div>
          <p style="color: #2d2520; white-space: pre-wrap; margin: 0; line-height: 1.6; font-size: 14px;">${msg.content}</p>
        </div>
      `;
    });

    // Send email
    await resend.emails.send({
      from: 'The Busy Christian <onboarding@resend.dev>',
      to: email,
      subject: 'Your Pastoral Guidance Conversation',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2d2520; font-family: Georgia, serif; font-size: 28px; margin-bottom: 8px;">
              Your Pastoral Guidance Conversation
            </h1>
            <div style="height: 2px; width: 60px; background: linear-gradient(to right, #fbbf24, #b8860b); margin: 0 auto 16px;"></div>
            <p style="color: #5a4f46; font-size: 14px;">
              A transcript of your conversation with the Virtual Pastor
            </p>
          </div>

          ${conversationHtml}

          <div style="margin-top: 30px; padding: 20px; background: #f5f1e8; border-radius: 12px; border: 1px solid #d4c9b3;">
            <p style="color: #2d2520; font-size: 14px; margin: 0 0 12px 0;">
              <strong>📖 Continue Your Journey</strong>
            </p>
            <p style="color: #5a4f46; font-size: 13px; margin: 0 0 12px 0;">
              If you'd like to continue this conversation or need additional support, visit:
            </p>
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/pastoral-guidance"
               style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #b8860b, #d4af37); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px;">
              Ask the Pastor
            </a>
          </div>

          <div style="margin-top: 20px; padding: 16px; background: #fff3cd; border-radius: 8px; border-left: 4px solid #ffc107;">
            <p style="color: #856404; font-size: 13px; margin: 0;">
              <strong>⚠️ Important:</strong> If you're experiencing a crisis or need immediate help, please contact:
            </p>
            <p style="color: #856404; font-size: 13px; margin: 8px 0 0 0;">
              • 988 Suicide & Crisis Lifeline (call or text)<br/>
              • 911 for emergencies
            </p>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #d4c9b3;">
            <p style="color: #5a4f46; font-size: 12px; margin: 0;">
              This conversation was generated through The Busy Christian app<br/>
              AI-assisted pastoral guidance from Cornerstone Church, Mandeville, LA
            </p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to send transcript email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
