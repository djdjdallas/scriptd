/**
 * Blog Post Layout: Best Script Structure for Finance YouTube Channels
 *
 * SEO metadata for this blog post.
 */

export const metadata = {
  title: 'Best Script Structure for Finance YouTube Channels | GenScript Blog',
  description: 'Learn the proven script frameworks that top finance YouTubers use to educate, engage, and grow their audience. Templates and examples included.',
  keywords: [
    'finance youtube script',
    'financial youtube channel',
    'investing youtube script',
    'money youtube content',
    'finance content creator',
    'stock market youtube',
    'personal finance youtube',
    'finance video script template',
    'youtube finance niche',
    'financial education youtube'
  ].join(', '),
  authors: [{ name: 'GenScript Team' }],
  publishedTime: '2025-01-08',
  modifiedTime: '2025-01-08',
  alternates: {
    canonical: 'https://genscript.io/blog/best-script-structure-finance-youtube-channels'
  },
  openGraph: {
    title: 'Best Script Structure for Finance YouTube Channels',
    description: 'Proven script frameworks for finance YouTubers. Templates and examples included.',
    url: 'https://genscript.io/blog/best-script-structure-finance-youtube-channels',
    type: 'article',
    publishedTime: '2025-01-08',
    authors: ['GenScript Team'],
    images: [
      {
        url: '/blog/finance-script-structure.png',
        width: 1200,
        height: 630,
        alt: 'Finance YouTube Script Structure Guide'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Best Script Structure for Finance YouTube Channels',
    description: 'Proven script frameworks for finance YouTubers. Templates and examples included.',
    images: ['/blog/finance-script-structure.png']
  }
};

export default function BlogPostLayout({ children }) {
  return children;
}
