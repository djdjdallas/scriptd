/**
 * Blog Post Layout: How to Pass YouTube's 2025 AI Content Policy
 *
 * SEO metadata for this blog post.
 */

export const metadata = {
  title: 'How to Pass YouTube\'s 2025 AI Content Policy | GenScript Blog',
  description: 'A complete guide to creating AI-assisted YouTube content that stays monetized under YouTube\'s new authenticity guidelines. Learn what\'s allowed and what to avoid.',
  keywords: [
    'youtube 2025 ai policy',
    'youtube authenticity policy',
    'ai content youtube',
    'youtube monetization ai',
    'youtube ai guidelines',
    'ai generated content youtube',
    'youtube content policy',
    'youtube demonetization ai'
  ].join(', '),
  authors: [{ name: 'GenScript Team' }],
  publishedTime: '2025-01-10',
  modifiedTime: '2025-01-10',
  alternates: {
    canonical: 'https://genscript.io/blog/how-to-pass-youtube-2025-ai-content-policy'
  },
  openGraph: {
    title: 'How to Pass YouTube\'s 2025 AI Content Policy',
    description: 'Complete guide to creating AI-assisted YouTube content that stays monetized.',
    url: 'https://genscript.io/blog/how-to-pass-youtube-2025-ai-content-policy',
    type: 'article',
    publishedTime: '2025-01-10',
    authors: ['GenScript Team'],
    images: [
      {
        url: '/blog/youtube-2025-policy.png',
        width: 1200,
        height: 630,
        alt: 'YouTube 2025 AI Content Policy Guide'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How to Pass YouTube\'s 2025 AI Content Policy',
    description: 'Complete guide to creating AI-assisted YouTube content that stays monetized.',
    images: ['/blog/youtube-2025-policy.png']
  }
};

export default function BlogPostLayout({ children }) {
  return children;
}
