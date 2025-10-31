// app/layout.tsx
import "./globals.css";
import { playfairDisplay, inter } from "./fonts";
import ClientLayout from "./ClientLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Busy Christian - AI-Powered Bible Study",
  description:
    "Deepen your faith with AI-powered Bible study tools designed for busy Christians. Get personalized commentary, reading plans, and spiritual guidance.",
  keywords: [
    "Bible study",
    "Christian devotional",
    "AI Bible commentary",
    "Scripture study",
    "Bible reading plan",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfairDisplay.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-slate-950 text-white font-sans antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}