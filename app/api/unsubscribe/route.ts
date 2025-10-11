// app/api/unsubscribe/route.ts
import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Missing token" },
        { status: 400 }
      );
    }

    // Deactivate subscription
    const result = await sql`
      UPDATE email_subscribers
      SET is_active = false
      WHERE unsubscribe_token = ${token}
      RETURNING email
    `;

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Successfully unsubscribed",
    });
  } catch (error: any) {
    console.error("Unsubscribe error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to unsubscribe" },
      { status: 500 }
    );
  }
}