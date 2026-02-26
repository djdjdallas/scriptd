import { generateSchemas } from '@/lib/alternatives-schema-data';

export const metadata = {
  title: 'TubeBuddy Alternative with Script Writing Features - AI YouTube Scripts | Genscript',
  description: 'TubeBuddy alternative that goes beyond keywords. Generate professional YouTube scripts with 68%+ retention optimization. All TubeBuddy features plus advanced script generation.',
  keywords: 'tubebuddy alternative with script writing, tubebuddy alternative for youtube script generation, tubebuddy vs professional script generator, tubebuddy alternative 2025, why script generation beats keyword research',
  openGraph: {
    title: 'TubeBuddy Alternative with Script Writing Features - AI YouTube Scripts | Genscript',
    description: 'TubeBuddy alternative that goes beyond keywords. Generate professional YouTube scripts with 68%+ retention optimization.',
    type: 'website',
  },
  alternates: {
    canonical: 'https://genscript.io/alternatives/tubebuddy',
  },
};

export default function TubeBuddyLayout({ children }) {
  const schemas = generateSchemas('tubebuddy', 'TubeBuddy');

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