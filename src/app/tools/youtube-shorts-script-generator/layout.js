/**
 * YouTube Shorts Script Generator Layout
 *
 * SEO metadata targeting "youtube shorts script generator" keyword.
 */

export const metadata = {
  title: 'YouTube Shorts Script Generator | 15s, 30s, 60s Scripts | GenScript',
  description: 'Generate viral YouTube Shorts scripts in seconds. Optimized for 15s, 30s, and 60s formats with hooks that capture attention instantly. Free to try.',
  keywords: [
    'youtube shorts script generator',
    'shorts script writer',
    'youtube shorts script',
    'short form video script',
    'tiktok script generator',
    'vertical video script',
    '60 second script generator',
    'youtube shorts ideas',
    'shorts hook generator',
    'viral shorts script'
  ].join(', '),
  alternates: {
    canonical: 'https://genscript.io/tools/youtube-shorts-script-generator'
  },
  openGraph: {
    title: 'YouTube Shorts Script Generator | Viral Short-Form Scripts',
    description: 'Generate attention-grabbing YouTube Shorts scripts optimized for 15s, 30s, and 60s formats. Hooks that stop the scroll.',
    url: 'https://genscript.io/tools/youtube-shorts-script-generator',
    type: 'website',
    images: [
      {
        url: '/og/shorts-script-generator.png',
        width: 1200,
        height: 630,
        alt: 'GenScript YouTube Shorts Script Generator'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YouTube Shorts Script Generator | Viral Short-Form Scripts',
    description: 'Generate attention-grabbing YouTube Shorts scripts in seconds.',
    images: ['/og/shorts-script-generator.png']
  }
};

export default function YouTubeShortsScriptGeneratorLayout({ children }) {
  return children;
}
