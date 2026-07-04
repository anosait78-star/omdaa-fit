import type { Metadata } from 'next';
import './globals.css';
import { SITE } from '../lib/site';

export const metadata: Metadata = {
  title: SITE.meta.title,
  description: SITE.meta.description,
};

/**
 * Root layout. The document defaults to Arabic / RTL (the primary audience),
 * and the Cairo web font is loaded for clean Arabic typography. Per-page
 * direction is handled by the client components when the language is toggled.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" style={{ ['--brand-rgb' as string]: SITE.brandRgb }}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&family=Inter:wght@400;600;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
