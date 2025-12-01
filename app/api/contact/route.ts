// app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'thebusychristianapp@gmail.com';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    if (!email || !message) {
      return NextResponse.json(
        { error: 'Email and message are required' },
        { status: 400 }
      );
    }

    // Send email to admin
    await resend.emails.send({
      from: 'Contact Form <contact@thebusychristian.com>',
      to: ADMIN_EMAIL,
      replyTo: email,
      subject: `Contact Form: ${name ? `Message from ${name}` : 'New Message'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">New Contact Message</h1>
            <p style="margin: 10px 0 0 0; font-size: 14px;">The Busy Christian App</p>
          </div>

          <div style="padding: 30px; background: #f9fafb;">
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <p style="margin: 0 0 10px 0;"><strong>From:</strong> ${name || 'Not provided'}</p>
              <p style="margin: 0 0 10px 0;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 0;"><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
            </div>

            <div style="background: #fff7ed; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px;">
              <h3 style="color: #92400e; margin-top: 0;">Message:</h3>
              <p style="color: #78350f; line-height: 1.6; white-space: pre-wrap;">${message}</p>
            </div>
          </div>

          <div style="padding: 20px; background: #1f2937; color: #d1d5db; text-align: center; border-radius: 0 0 8px 8px;">
            <p style="margin: 0; font-size: 12px;">
              Reply directly to this email to respond to ${name || 'the user'}.
            </p>
          </div>
        </div>
      `
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error sending contact message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
