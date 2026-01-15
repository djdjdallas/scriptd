/**
 * Blog Section Layout
 *
 * Shared layout for blog pages with SEO metadata.
 */

export const metadata = {
  title: {
    template: '%s | GenScript Blog',
    default: 'Blog | GenScript'
  },
  description: 'Learn about YouTube script writing, AI content creation, compliance, and retention optimization. Tips and guides from the GenScript team.',
  keywords: [
    'youtube script writing',
    'ai content creation',
    'youtube compliance',
    'video script tips',
    'youtube retention',
    'content creator blog'
  ].join(', '),
  alternates: {
    canonical: 'https://genscript.io/blog'
  },
  openGraph: {
    title: 'GenScript Blog | YouTube Script Writing Tips & Guides',
    description: 'Learn about YouTube script writing, AI content creation, compliance, and retention optimization.',
    url: 'https://genscript.io/blog',
    type: 'website',
    images: [
      {
        url: '/og/blog.png',
        width: 1200,
        height: 630,
        alt: 'GenScript Blog'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GenScript Blog | YouTube Script Writing Tips & Guides',
    description: 'Learn about YouTube script writing, AI content creation, compliance, and retention optimization.',
    images: ['/og/blog.png']
  }
};

export default function BlogLayout({ children }) {
  return children;
}
