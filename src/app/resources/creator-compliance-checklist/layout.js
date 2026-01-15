/**
 * Creator Compliance Checklist Layout
 *
 * SEO metadata for the 5-point compliance checklist.
 */

export const metadata = {
  title: '5-Point YouTube Script Compliance Checklist | GenScript',
  description: '5 things to add to any AI script to stay monetized on YouTube. Free printable checklist with before/after examples for YouTube\'s 2025 authenticity policy.',
  keywords: [
    'youtube script checklist',
    'ai script compliance checklist',
    'youtube monetization checklist',
    'youtube authenticity checklist',
    'ai content checklist youtube',
    'youtube creator checklist',
    'youtube script best practices',
    'ai script editing checklist',
    'youtube 2025 policy checklist',
    'content authenticity checklist'
  ].join(', '),
  alternates: {
    canonical: 'https://genscript.io/resources/creator-compliance-checklist'
  },
  openGraph: {
    title: '5-Point YouTube Script Compliance Checklist | Free Download',
    description: '5 things to add to any AI script to stay monetized. Printable checklist with real examples.',
    url: 'https://genscript.io/resources/creator-compliance-checklist',
    type: 'article',
    images: [
      {
        url: '/og/compliance-checklist.png',
        width: 1200,
        height: 630,
        alt: 'GenScript Creator Compliance Checklist'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: '5-Point YouTube Script Compliance Checklist | Free Download',
    description: '5 things to add to any AI script to stay monetized on YouTube.',
    images: ['/og/compliance-checklist.png']
  }
};

export default function ChecklistLayout({ children }) {
  return children;
}
