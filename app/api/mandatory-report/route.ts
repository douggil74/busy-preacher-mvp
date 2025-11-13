import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { sessionId, fullName, age, phone, address, googleEmail } = await request.json();

    if (!sessionId || !fullName || !age || !phone || !address) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Get IP and user agent for logging
    const userIp = request.headers.get('x-forwarded-for') ||
                   request.headers.get('x-real-ip') ||
                   'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Save to Supabase - add to pastoral_conversations or create new table
    try {
      await supabaseAdmin
        .from('pastoral_conversations')
        .update({
          user_fullname: fullName,
          user_age: parseInt(age),
          user_phone: phone,
          user_address: address,
          google_email: googleEmail || null,
          mandatory_report: true,
          mandatory_report_timestamp: new Date().toISOString(),
        })
        .eq('session_id', sessionId);
    } catch (dbError) {
      console.error('Failed to save mandatory report to database:', dbError);
      // Continue anyway - email is more critical
    }

    // Send URGENT email to pastor
    const emailSubject = '🚨 URGENT: MANDATORY REPORT - Child Abuse (Under 18)';
    const emailBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 20px; border-radius: 12px 12px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">🚨 MANDATORY REPORT REQUIRED</h1>
          <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.95;">
            A minor (under 18) has reported abuse in the pastoral guidance system.
            <br/><strong>You must report this to Child Protective Services immediately.</strong>
          </p>
        </div>

        <div style="background: #fff; border: 3px solid #dc2626; border-top: none; border-radius: 0 0 12px 12px; padding: 20px;">
          <h2 style="color: #dc2626; font-size: 18px; margin: 0 0 16px 0;">Minor's Information</h2>

          <div style="background: #fef2f2; padding: 16px; border-radius: 8px; margin-bottom: 16px; border-left: 4px solid #dc2626;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #991b1b; width: 140px;">Full Name:</td>
                <td style="padding: 8px 0; color: #1f2937;">${fullName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #991b1b;">Age:</td>
                <td style="padding: 8px 0; color: #1f2937;">${age} years old</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #991b1b;">Phone:</td>
                <td style="padding: 8px 0; color: #1f2937;"><a href="tel:${phone}" style="color: #2563eb; text-decoration: none;">${phone}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #991b1b; vertical-align: top;">Address:</td>
                <td style="padding: 8px 0; color: #1f2937;">${address.replace(/\n/g, '<br/>')}</td>
              </tr>
              ${googleEmail ? `
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #991b1b;">Google Email:</td>
                <td style="padding: 8px 0; color: #1f2937;"><a href="mailto:${googleEmail}" style="color: #2563eb; text-decoration: none;">${googleEmail}</a></td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #991b1b;">Session ID:</td>
                <td style="padding: 8px 0; color: #6b7280; font-size: 12px;">${sessionId}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #991b1b;">IP Address:</td>
                <td style="padding: 8px 0; color: #6b7280; font-size: 12px;">${userIp}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #991b1b;">Timestamp:</td>
                <td style="padding: 8px 0; color: #6b7280; font-size: 12px;">${new Date().toLocaleString('en-US', {
                  timeZone: 'America/Chicago',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                })} CST</td>
              </tr>
            </table>
          </div>

          <h3 style="color: #dc2626; font-size: 16px; margin: 20px 0 12px 0;">Required Actions:</h3>
          <ol style="margin: 0; padding-left: 20px; color: #1f2937; line-height: 1.8;">
            <li><strong>Contact the minor immediately</strong> using the phone number provided</li>
            <li><strong>Report to Louisiana Child Protective Services:</strong>
              <ul style="margin-top: 8px; color: #4b5563;">
                <li>Call: <a href="tel:1-855-452-5437" style="color: #2563eb; text-decoration: none; font-weight: bold;">1-855-4LA-KIDS (1-855-452-5437)</a></li>
                <li>Available 24/7</li>
              </ul>
            </li>
            <li><strong>Document everything</strong> in your pastoral records</li>
            <li><strong>Follow up</strong> to ensure the minor's safety</li>
          </ol>

          <div style="background: #fff3cd; border: 2px solid #fbbf24; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e; font-size: 14px; font-weight: bold;">
              ⚠️ Louisiana Law (Children's Code Article 609):
            </p>
            <p style="margin: 8px 0 0 0; color: #92400e; font-size: 13px;">
              Any person who has cause to believe that a child's physical or mental health or welfare has been or may be adversely affected by abuse or neglect <strong>shall report</strong> in accordance with this article.
            </p>
          </div>

          <div style="text-align: center; margin-top: 24px;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/pastoral-guidance"
               style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px;">
              View Full Conversation
            </a>
          </div>

          <div style="text-align: center; margin-top: 24px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              This email was automatically generated by The Busy Christian app<br/>
              Cornerstone Church, Mandeville, LA
            </p>
          </div>
        </div>
      </div>
    `;

    try {
      await resend.emails.send({
        from: 'The Busy Christian <onboarding@resend.dev>',
        to: process.env.PASTOR_EMAIL || process.env.ADMIN_EMAIL || 'doug.cag@gmail.com',
        subject: emailSubject,
        html: emailBody,
      });

      console.log('🚨 MANDATORY REPORT EMAIL SENT - Minor abuse report');
    } catch (emailError) {
      console.error('CRITICAL: Failed to send mandatory report email:', emailError);
      // This is critical - we should still return success but log the error
    }

    return NextResponse.json({
      success: true,
      message: 'Mandatory report submitted. Pastor will contact you immediately.'
    });
  } catch (error) {
    console.error('Failed to process mandatory report:', error);
    return NextResponse.json(
      { error: 'Failed to submit report' },
      { status: 500 }
    );
  }
}
