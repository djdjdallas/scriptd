/**
 * AI Script Writer for YouTube Layout
 *
 * SEO metadata targeting "ai script writer youtube" keyword.
 */

export const metadata = {
  title: 'AI Script Writer for YouTube | GenScript',
  description: 'Professional AI script writer designed specifically for YouTube. Compliance-checked scripts that match your voice and optimize for retention. Start free.',
  keywords: [
    'ai script writer youtube',
    'ai youtube script writer',
    'youtube ai writer',
    'ai video script writer',
    'script writer ai youtube',
    'youtube script writing ai',
    'ai for youtube scripts',
    'best ai script writer',
    'youtube content ai',
    'automated youtube script writer'
  ].join(', '),
  alternates: {
    canonical: 'https://genscript.io/tools/ai-script-writer-youtube'
  },
  openGraph: {
    title: 'AI Script Writer for YouTube | Compliance-Checked Scripts',
    description: 'The only AI script writer built for YouTube\'s 2025 policy. Voice matching, retention optimization, and real-time compliance checking.',
    url: 'https://genscript.io/tools/ai-script-writer-youtube',
    type: 'website',
    images: [
      {
        url: '/og/ai-script-writer.png',
        width: 1200,
        height: 630,
        alt: 'GenScript AI Script Writer'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Script Writer for YouTube | Compliance-Checked Scripts',
    description: 'The only AI script writer built for YouTube\'s 2025 policy.',
    images: ['/og/ai-script-writer.png']
  }
};

export default function AIScriptWriterLayout({ children }) {
  return children;
}
