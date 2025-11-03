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

// Single RootLayout with theme loader
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Theme loader - runs BEFORE React hydrates */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              const saved = localStorage.getItem('bc-theme');
              if (saved) {
                const theme = JSON.parse(saved);
                const root = document.documentElement;
                root.style.setProperty('--bg-color', theme.colors.background);
                root.style.setProperty('--card-bg', theme.colors.cardBg);
                root.style.setProperty('--card-border', theme.colors.cardBorder);
                root.style.setProperty('--text-primary', theme.colors.textPrimary);
                root.style.setProperty('--text-secondary', theme.colors.textSecondary);
                root.style.setProperty('--accent-color', theme.colors.accent);
                root.style.setProperty('--font-family', theme.fontFamily);
                const fontSizes = { small: '14px', medium: '16px', large: '18px' };
                root.style.setProperty('--font-size', fontSizes[theme.fontSize] || '16px');
              }
            } catch (e) {}
          })();
        `}} />
        
        <ClientLayout>
          <GlobalSettingsManager />
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}