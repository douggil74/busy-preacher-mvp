import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientLayout from "./ClientLayout";
import { GlobalSettingsManager } from "./components/GlobalSettingsManager";
import { usePathname } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Busy Christian",
  description: "Bible study for busy believers",
};

// 👇 make RootLayout a client component so we can detect routes
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // This will only work in a client component
  const pathname =
    typeof window !== "undefined"
      ? window.location.pathname
      : "/";

  const isSplash = pathname === "/splash";

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `
            (function() {
              try {
                const mode = localStorage.getItem('bc-theme-mode') || 'light';
                const root = document.documentElement;
                if (mode === 'dark') {
                  root.style.setProperty('--bg-color', '#0f1729');
                  root.style.setProperty('--card-bg', '#1a2332');
                  root.style.setProperty('--card-border', '#2d3f5f');
                  root.style.setProperty('--text-primary', '#e8f2f8');
                  root.style.setProperty('--text-secondary', '#b8d4e6');
                  root.style.setProperty('--accent-color', '#3b82f6');
                } else {
                  root.style.setProperty('--bg-color', '#f5f1e8');
                  root.style.setProperty('--card-bg', '#ebe5d9');
                  root.style.setProperty('--card-border', '#d4c9b3');
                  root.style.setProperty('--text-primary', '#2d2520');
                  root.style.setProperty('--text-secondary', '#5a4f46');
                  root.style.setProperty('--accent-color', '#b8860b');
                }
                root.style.setProperty('--font-family', 'Inter, system-ui, sans-serif');
                root.style.setProperty('--font-size', '16px');
              } catch (e) {}
            })();
          `,
          }}
        />

        {/* Only wrap normal pages in ClientLayout + GlobalSettingsManager */}
        {isSplash ? (
          children
        ) : (
          <ClientLayout>
            <GlobalSettingsManager />
            {children}
          </ClientLayout>
        )}
      </body>
    </html>
  );
}
