// app/api/init-db/route.ts
import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export async function GET() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS email_subscribers (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        source VARCHAR(50) DEFAULT 'post-study',
        is_active BOOLEAN DEFAULT true,
        unsubscribe_token VARCHAR(255) UNIQUE
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_email ON email_subscribers(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_token ON email_subscribers(unsubscribe_token)`;

    return NextResponse.json({ 
      success: true, 
      message: "Database initialized successfully!" 
    });
  } catch (error: any) {
    console.error("Database init error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
