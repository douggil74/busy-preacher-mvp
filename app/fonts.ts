// app/fonts.ts
import { Playfair_Display, Inter } from 'next/font/google';

/**
 * Optimized Font Loading
 * - display: 'swap' prevents render blocking (✅ you already have this)
 * - preload: true for critical fonts
 * - subsets: ['latin'] reduces file size
 * - variable: true for better CSS variable support
 */

export const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600', '700', '900'],
  display: 'swap', // ✅ Already implemented - prevents FOIT (Flash of Invisible Text)
  variable: '--font-playfair',
  preload: true, // Prioritize this font
});

export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: false, // Don't prioritize if not critical
});

// Usage in layout.tsx:
// <html className={`${playfairDisplay.variable} ${inter.variable}`}>
//   <body className="font-sans">
//     {children}
//   </body>
// </html>

// In tailwind.config.ts, add:
// fontFamily: {
//   sans: ['var(--font-inter)', ...defaultTheme.fontFamily.sans],
//   serif: ['var(--font-playfair)', ...defaultTheme.fontFamily.serif],
// }