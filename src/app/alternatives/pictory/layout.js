import { generateSchemas } from '@/lib/alternatives-schema-data';

export const metadata = {
  title: 'Pictory Alternative for YouTube Script Writing - AI Generation & Voice Cloning | GenScript',
  description: 'Need a Pictory alternative that actually writes scripts? GenScript offers full AI script generation, personal voice cloning, and 70%+ retention optimization. Better than Pictory for YouTube creators.',
  keywords: 'pictory alternative, pictory alternative for scripts, ai script generator, pictory vs genscript, youtube script writing, video script creator',
  alternates: {
    canonical: 'https://genscript.io/alternatives/pictory',
  },
  openGraph: {
    title: 'Pictory Alternative for YouTube Script Writing | GenScript',
    description: 'Need a Pictory alternative that actually writes scripts? GenScript offers full AI script generation and 70%+ retention optimization.',
    url: 'https://genscript.io/alternatives/pictory',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pictory Alternative for YouTube Scripts | GenScript',
    description: 'Full AI script generation with voice cloning - not just video editing.',
  },
};

export default function PictoryLayout({ children }) {
  const schemas = generateSchemas('pictory', 'Pictory');

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
