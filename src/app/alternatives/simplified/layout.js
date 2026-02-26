import { generateSchemas } from '@/lib/alternatives-schema-data';

export const metadata = {
  title: 'Simplified Alternative for YouTube Scripts - AI Content Generation | GenScript',
  description: 'Looking for a Simplified alternative focused on YouTube content? GenScript offers AI-powered script generation, voice matching, and 70%+ retention optimization. Built specifically for YouTube creators.',
  keywords: 'simplified alternative, simplified ai alternative, youtube script generator, simplified vs genscript, ai content creation, youtube optimization tool',
  alternates: {
    canonical: 'https://genscript.io/alternatives/simplified',
  },
  openGraph: {
    title: 'Simplified Alternative for YouTube Scripts | GenScript',
    description: 'Looking for a Simplified alternative focused on YouTube? GenScript offers AI script generation and 70%+ retention optimization.',
    url: 'https://genscript.io/alternatives/simplified',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simplified Alternative for YouTube Scripts | GenScript',
    description: 'YouTube-focused AI script generation with retention optimization.',
  },
};

export default function SimplifiedLayout({ children }) {
  const schemas = generateSchemas('simplified', 'Simplified');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
      />
      {children}
    </>
  );
}
