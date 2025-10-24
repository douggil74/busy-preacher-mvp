import { StudyStyleProvider } from './hooks/useStudyStyle';
import HeaderBar from './HeaderBar';
import './globals.css';

export const metadata = {
  title: 'The Busy Christian',
  description: 'Your daily companion for spiritual growth',
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/ios/32.png',
    shortcut: '/icons/ios/32.png',
    apple: '/icons/ios/180.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'The Busy Christian',
  },
  themeColor: '#0f172a',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* PWA Meta Tags */}
        <meta name="application-name" content="The Busy Christian" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="The Busy Christian" />
        <meta name="mobile-web-app-capable" content="yes" />
        
        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/ios/180.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/ios/152.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/icons/ios/120.png" />
        
        {/* Standard Icons */}
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/ios/32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/ios/16.png" />
        
        {/* Manifest */}
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        <StudyStyleProvider>
          <HeaderBar />
          {children}
        </StudyStyleProvider>
      </body>
    </html>
  );
}