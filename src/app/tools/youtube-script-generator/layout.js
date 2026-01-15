/**
 * YouTube Script Generator Layout
 *
 * SEO metadata for the primary YouTube script generator page.
 */

export const metadata = {
  title: 'YouTube Script Generator | Free AI Script Writer | GenScript',
  description: 'Generate engaging YouTube scripts in seconds with AI. Built-in compliance checking, retention optimization, and voice matching. Free to try with 50 credits.',
  keywords: [
    'youtube script generator',
    'youtube script writer',
    'ai script generator',
    'youtube video script maker',
    'free youtube script generator',
    'script generator for youtube',
    'youtube content writer',
    'video script ai',
    'youtube script template',
    'automated script writing'
  ].join(', '),
  alternates: {
    canonical: 'https://genscript.io/tools/youtube-script-generator'
  },
  openGraph: {
    title: 'YouTube Script Generator | Free AI-Powered Script Writer',
    description: 'Generate YouTube scripts in 30 seconds with built-in compliance checking for YouTube\'s 2025 policy. Start free with 50 credits.',
    url: 'https://genscript.io/tools/youtube-script-generator',
    type: 'website',
    images: [
      {
        url: '/og/youtube-script-generator.png',
        width: 1200,
        height: 630,
        alt: 'GenScript YouTube Script Generator'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YouTube Script Generator | Free AI-Powered Script Writer',
    description: 'Generate YouTube scripts in 30 seconds with built-in compliance checking.',
    images: ['/og/youtube-script-generator.png']
  }
};

export default function YouTubeScriptGeneratorLayout({ children }) {
  return children;
}
