/**
 * Compliance Check Page Layout
 *
 * SEO metadata for the YouTube script compliance checker tool.
 */

export const metadata = {
  title: 'YouTube Script Compliance Checker | GenScript',
  description: 'Free tool to check if your YouTube script meets YouTube\'s 2025 authenticity policy. Detect AI patterns, verify original content markers, and ensure your scripts won\'t trigger demonetization.',
  keywords: [
    'youtube script compliance checker',
    'youtube ai policy checker',
    'youtube authenticity checker',
    'ai content detector youtube',
    'youtube demonetization checker',
    'youtube script analyzer',
    'ai script checker',
    'youtube content policy 2025',
    'youtube monetization checker',
    'script compliance tool'
  ].join(', '),
  alternates: {
    canonical: 'https://genscript.io/compliance-check'
  },
  openGraph: {
    title: 'YouTube Script Compliance Checker | Free AI Detection Tool',
    description: 'Check your YouTube scripts for AI patterns and authenticity markers. Stay compliant with YouTube\'s 2025 content policy and protect your monetization.',
    url: 'https://genscript.io/compliance-check',
    type: 'website',
    images: [
      {
        url: '/og/compliance-checker.png',
        width: 1200,
        height: 630,
        alt: 'GenScript Compliance Checker Tool'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YouTube Script Compliance Checker | Free AI Detection Tool',
    description: 'Check your YouTube scripts for AI patterns and authenticity markers. Stay compliant with YouTube\'s 2025 content policy.',
    images: ['/og/compliance-checker.png']
  }
};

export default function ComplianceCheckLayout({ children }) {
  return children;
}
