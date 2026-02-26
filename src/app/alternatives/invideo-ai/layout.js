import { generateSchemas } from '@/lib/alternatives-schema-data';

export const metadata = {
  title: 'InVideo AI Alternative for YouTube Scripts - Voice Cloning & Retention | GenScript',
  description: 'Looking for an InVideo AI alternative with better script quality? GenScript offers AI-powered script generation, personal voice cloning, and 70%+ retention optimization for YouTube creators.',
  keywords: 'invideo ai alternative, invideo alternative for youtube, ai video script generator, invideo vs genscript, youtube script writer, video content creation ai',
  alternates: {
    canonical: 'https://genscript.io/alternatives/invideo-ai',
  },
  openGraph: {
    title: 'InVideo AI Alternative for YouTube Scripts - Voice Cloning & Retention | GenScript',
    description: 'Looking for an InVideo AI alternative with better script quality? GenScript offers AI-powered generation and 70%+ retention optimization.',
    url: 'https://genscript.io/alternatives/invideo-ai',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InVideo AI Alternative for YouTube Scripts | GenScript',
    description: 'Advanced AI script generation with voice cloning and retention optimization.',
  },
};

export default function InVideoAILayout({ children }) {
  const schemas = generateSchemas('invideo-ai', 'InVideo AI');

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
