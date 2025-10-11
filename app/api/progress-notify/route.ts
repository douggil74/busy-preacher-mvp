// app/api/progress-notify/route.ts
import { NextResponse } from "next/server";
import { Resend } from "resend";

const DEVELOPER_EMAIL = "thebusychristianapp@gmail.com";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Initialize Resend here instead of at the top level
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    let subject = "";
    let message = "";

    switch (data.type) {
      case "milestone":
        subject = `🎉 ${data.anonymousId} reached Level ${data.level}!`;
        message = `
Progress Update - Milestone Achievement

User: ${data.anonymousId}
Milestone: ${data.milestone} (Level ${data.level})
Description: ${data.description}
Total Studies: ${data.totalStudies}
Timestamp: ${data.timestamp}
App Version: ${data.appVersion}

---
This user just hit a major milestone! 🎉`;
        break;

      case "streak":
        subject = `🔥 ${data.anonymousId} maintained a ${data.streakDays}-day streak!`;
        message = `
Progress Update - Streak Achievement

User: ${data.anonymousId}
Streak: ${data.streakDays} consecutive days
Description: ${data.description}
Total Studies: ${data.totalStudies}
Timestamp: ${data.timestamp}
App Version: ${data.appVersion}

---
Consistent daily study! 🔥`;
        break;

      case "exploration":
        subject = `🗺️ ${data.anonymousId} exploring diverse themes!`;
        message = `
Progress Update - Theme Exploration

User: ${data.anonymousId}
Unique Themes: ${data.uniqueThemes}
Description: ${data.description}
Total Studies: ${data.totalStudies}
Timestamp: ${data.timestamp}
App Version: ${data.appVersion}

---
Wide-ranging biblical exploration! 🗺️`;
        break;

      case "deep-dive":
        subject = `📖 ${data.anonymousId} deep diving into ${data.passage}`;
        message = `
Progress Update - Deep Study

User: ${data.anonymousId}
Passage: ${data.passage}
Times Studied: ${data.studyCount}
Description: ${data.description}
Total Studies: ${data.totalStudies}
Timestamp: ${data.timestamp}
App Version: ${data.appVersion}

---
Deep theological exploration! ⛏️`;
        break;

      case "crisis":
        subject = `🆘 CRISIS ALERT - ${data.anonymousId} searching crisis keywords`;
        message = `
⚠️ CRISIS ALERT - IMMEDIATE ATTENTION NEEDED

User: ${data.anonymousId}
Search Text: "${data.searchText}"
Timestamp: ${data.timestamp}
App Version: ${data.appVersion}

---
This user searched for crisis-related keywords. They have been shown:
- Crisis modal with 988 Suicide Prevention Lifeline
- Resources and help information

This is an automated alert to make you aware a user may be in distress.
`;
        break;

      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    await resend.emails.send({
      from: "The Busy Christian <onboarding@resend.dev>",
      to: DEVELOPER_EMAIL,
      subject: subject,
      text: message,
    });

    return NextResponse.json({ success: true });
    
  } catch (error: any) {
    console.error("Failed to send notification:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to send" }, 
      { status: 500 }
    );
  }
}