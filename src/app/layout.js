import { getContent } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const c = await getContent();
  return {
    title: c.brand.seoTitle,
    description: c.brand.seoDescription,
    openGraph: { title: c.brand.seoTitle, description: c.brand.seoDescription, type: 'website' },
    robots: { index: true, follow: true },
  };
}
export const viewport = { themeColor: '#080808', width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export default function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Unbounded:wght@400;600;700;800&family=Instrument+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
