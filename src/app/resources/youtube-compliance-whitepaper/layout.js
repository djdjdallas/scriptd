/**
 * YouTube Compliance Whitepaper Layout
 *
 * SEO metadata for the comprehensive compliance whitepaper.
 */

export const metadata = {
  title: 'YouTube Compliance Framework Whitepaper | GenScript',
  description: 'Comprehensive guide to YouTube\'s 2025 authenticity policy. Learn how to create AI-assisted content that stays monetized with our proven compliance framework.',
  keywords: [
    'youtube compliance whitepaper',
    'youtube authenticity policy 2025',
    'youtube ai content guidelines',
    'youtube monetization compliance',
    'ai content youtube policy',
    'youtube creator compliance guide',
    'youtube demonetization prevention',
    'ai script writing compliance',
    'youtube content authenticity',
    'youtube policy framework'
  ].join(', '),
  alternates: {
    canonical: 'https://genscript.io/resources/youtube-compliance-whitepaper'
  },
  openGraph: {
    title: 'YouTube Compliance Framework Whitepaper | Free Download',
    description: 'Learn how to create AI-assisted YouTube content that stays compliant and monetized. Comprehensive guide to YouTube\'s 2025 authenticity policy.',
    url: 'https://genscript.io/resources/youtube-compliance-whitepaper',
    type: 'article',
    images: [
      {
        url: '/og/compliance-whitepaper.png',
        width: 1200,
        height: 630,
        alt: 'GenScript YouTube Compliance Framework Whitepaper'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YouTube Compliance Framework Whitepaper | Free Download',
    description: 'Learn how to create AI-assisted YouTube content that stays compliant and monetized.',
    images: ['/og/compliance-whitepaper.png']
  }
};

export default function WhitepaperLayout({ children }) {
  return children;
}
