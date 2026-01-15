/**
 * GenScript vs Subscribr Comparison Layout
 *
 * SEO metadata for the Subscribr comparison page.
 */

export const metadata = {
  title: 'GenScript vs Subscribr | YouTube Script Generator Comparison',
  description: 'Compare GenScript and Subscribr for YouTube script writing. See how compliance checking, pricing, and features stack up between these specialized tools.',
  keywords: [
    'genscript vs subscribr',
    'subscribr alternative',
    'subscribr comparison',
    'youtube script generator comparison',
    'best youtube script ai',
    'subscribr vs genscript',
    'youtube script tools',
    'ai script writer comparison',
    'subscribr review',
    'genscript review'
  ].join(', '),
  alternates: {
    canonical: 'https://genscript.io/compare/genscript-vs-subscribr'
  },
  openGraph: {
    title: 'GenScript vs Subscribr | Which YouTube Script Generator is Better?',
    description: 'Detailed comparison of GenScript and Subscribr. See how compliance checking gives GenScript the edge for YouTube creators.',
    url: 'https://genscript.io/compare/genscript-vs-subscribr',
    type: 'article',
    images: [
      {
        url: '/og/compare-subscribr.png',
        width: 1200,
        height: 630,
        alt: 'GenScript vs Subscribr Comparison'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GenScript vs Subscribr | Which YouTube Script Generator is Better?',
    description: 'Detailed comparison of GenScript and Subscribr for YouTube creators.',
    images: ['/og/compare-subscribr.png']
  }
};

export default function SubscribrCompareLayout({ children }) {
  return children;
}
