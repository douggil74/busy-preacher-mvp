// app/api/subscribe/route.ts
// Email yourself when someone subscribes - works everywhere!

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { email, source = "homepage" } = await req.json();

    // Basic email validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const timestamp = new Date().toISOString();

    // Email yourself with the subscriber info
    await resend.emails.send({
      from: "The Busy Christian <onboarding@resend.dev>", // Change this to your verified domain later
      to: process.env.ADMIN_EMAIL || "your-email@example.com", // YOUR email here
      subject: `🎉 New Subscriber: ${normalizedEmail}`,
      html: `
        <h2>New Subscriber!</h2>
        <p><strong>Email:</strong> ${normalizedEmail}</p>
        <p><strong>Source:</strong> ${source}</p>
        <p><strong>Time:</strong> ${new Date(timestamp).toLocaleString()}</p>
        <hr>
        <p style="color: #666; font-size: 12px;">
          Add this to your email list: ${normalizedEmail}
        </p>
      `,
    });

    console.log(`✅ New subscriber: ${normalizedEmail} (${source})`);

    return NextResponse.json({
      message: "Successfully subscribed! 🎉",
      success: true
    });

  } catch (error) {
    console.error("Subscribe error:", error);
    return NextResponse.json(
      { error: "Failed to subscribe. Please try again." },
      { status: 500 }
    );
  }
}