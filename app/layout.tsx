import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientLayout from "./ClientLayout";
import { GlobalSettingsManager } from './components/GlobalSettingsManager';


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Export metadata as const (NOT default)
export const metadata: Metadata = {
  title: "The Busy Christian",
  description: "Bible study for busy believers",
};

// This is the ONLY export default in this file
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ClientLayout>
          <GlobalSettingsManager />
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}