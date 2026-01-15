/**
 * GenScript vs ChatGPT Comparison Layout
 *
 * SEO metadata for the ChatGPT comparison page.
 */

export const metadata = {
  title: 'GenScript vs ChatGPT for YouTube Scripts | Detailed Comparison',
  description: 'Compare GenScript and ChatGPT for YouTube script writing. See why YouTube creators choose GenScript\'s compliance-first approach over general-purpose AI.',
  keywords: [
    'genscript vs chatgpt',
    'chatgpt youtube scripts',
    'chatgpt alternative youtube',
    'ai script writer comparison',
    'youtube script generator vs chatgpt',
    'chatgpt youtube compliance',
    'best ai for youtube scripts',
    'chatgpt vs specialized ai',
    'youtube script ai comparison',
    'genscript chatgpt comparison'
  ].join(', '),
  alternates: {
    canonical: 'https://genscript.io/compare/genscript-vs-chatgpt'
  },
  openGraph: {
    title: 'GenScript vs ChatGPT | Which is Better for YouTube Scripts?',
    description: 'Detailed comparison of GenScript and ChatGPT for YouTube content creation. See the compliance, speed, and quality differences.',
    url: 'https://genscript.io/compare/genscript-vs-chatgpt',
    type: 'article',
    images: [
      {
        url: '/og/compare-chatgpt.png',
        width: 1200,
        height: 630,
        alt: 'GenScript vs ChatGPT Comparison'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GenScript vs ChatGPT | Which is Better for YouTube Scripts?',
    description: 'Detailed comparison of GenScript and ChatGPT for YouTube content creation.',
    images: ['/og/compare-chatgpt.png']
  }
};

export default function ChatGPTCompareLayout({ children }) {
  return children;
}
