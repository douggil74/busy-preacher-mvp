// app/api/subscribe/route.ts
import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { Resend } from "resend";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function POST(request: Request) {
  try {
    const { email, source = "post-study" } = await request.json();

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Generate unsubscribe token
    const unsubscribeToken = crypto.randomBytes(32).toString("hex");

    // Insert email (ignore if already exists)
    await sql`
      INSERT INTO email_subscribers (email, source, unsubscribe_token)
      VALUES (${email.toLowerCase()}, ${source}, ${unsubscribeToken})
      ON CONFLICT (email) DO NOTHING
    `;

    // Send welcome email
    await resend.emails.send({
      from: "The Busy Christian <onboarding@resend.dev>",
      to: email,
      subject: "✅ You're subscribed to The Busy Christian updates!",
      text: `
Welcome to The Busy Christian community!

You'll receive updates about:
- New Bible translations
- Study sharing features
- Printable study templates
- New features and improvements

We respect your inbox - we only send important updates (usually 1-2 per month).

---
Unsubscribe anytime: ${APP_URL}/unsubscribe?token=${unsubscribeToken}
`,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Subscribe error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to subscribe" },
      { status: 500 }
    );
  }
}