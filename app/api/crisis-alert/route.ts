// app/api/crisis-alert/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const PASTOR_EMAIL = process.env.PASTOR_EMAIL || process.env.ADMIN_EMAIL;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userName, userEmail, userLocation, prayerRequest, keywords } = body;

    if (!PASTOR_EMAIL) {
      console.error('PASTOR_EMAIL not configured');
      return NextResponse.json(
        { error: 'Pastor email not configured' },
        { status: 500 }
      );
    }

    // Send email to pastor
    await resend.emails.send({
      from: 'Crisis Alert <crisis@thebusychristian.com>',
      to: PASTOR_EMAIL,
      subject: `🚨 URGENT: Crisis Alert from Prayer Community`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #dc2626; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">🚨 CRISIS ALERT</h1>
            <p style="margin: 10px 0 0 0; font-size: 14px;">Urgent attention needed</p>
          </div>

          <div style="padding: 30px; background: #f9fafb;">
            <h2 style="color: #1f2937; margin-top: 0;">Prayer Request Details</h2>

            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <p style="margin: 0 0 10px 0;"><strong>From:</strong> ${userName}</p>
              ${userEmail ? `<p style="margin: 0 0 10px 0;"><strong>Email:</strong> ${userEmail}</p>` : ''}
              ${userLocation ? `<p style="margin: 0 0 10px 0;"><strong>Location:</strong> ${userLocation}</p>` : ''}
              <p style="margin: 0;"><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
            </div>

            <div style="background: #fff7ed; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #92400e; margin-top: 0;">Prayer Request:</h3>
              <p style="color: #78350f; line-height: 1.6;">${prayerRequest}</p>
            </div>

            <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; border-radius: 8px;">
              <h3 style="color: #991b1b; margin-top: 0;">Crisis Keywords Detected:</h3>
              <ul style="color: #7f1d1d; margin: 10px 0;">
                ${keywords.map((k: string) => `<li>${k}</li>`).join('')}
              </ul>
            </div>
          </div>

          <div style="padding: 20px; background: #1f2937; color: #d1d5db; text-align: center;">
            <p style="margin: 0 0 10px 0; font-size: 14px;">
              <strong>Immediate Action Recommended</strong>
            </p>
            <p style="margin: 0; font-size: 12px;">
              Consider reaching out to this person directly. If you believe they are in immediate danger,
              contact emergency services.
            </p>
            <p style="margin: 15px 0 0 0; font-size: 12px;">
              <strong>Crisis Hotline:</strong> 988 (Suicide & Crisis Lifeline)
            </p>
          </div>
        </div>
      `
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error sending crisis alert:', error);
    return NextResponse.json(
      { error: 'Failed to send alert' },
      { status: 500 }
    );
  }
}
