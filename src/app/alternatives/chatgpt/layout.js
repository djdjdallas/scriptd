import { generateSchemas } from '@/lib/alternatives-schema-data';

export const metadata = {
  title: 'ChatGPT Alternative for YouTube Scripts - 68%+ Retention Scripts | GenScript',
  description: 'Looking for a ChatGPT alternative built for YouTube? GenScript creates retention-optimized scripts with YouTube-specific structure, fact checking, and voice matching. Better than ChatGPT for video content.',
  keywords: 'chatgpt alternative for youtube, chatgpt alternative script writing, chatgpt vs youtube script generator, ai script writer, youtube script ai, chatgpt alternative for content creators',
  alternates: {
    canonical: 'https://genscript.io/alternatives/chatgpt',
  },
  openGraph: {
    title: 'ChatGPT Alternative for YouTube Scripts - 68%+ Retention Scripts | GenScript',
    description: 'Looking for a ChatGPT alternative built for YouTube? GenScript creates retention-optimized scripts with YouTube-specific structure.',
    url: 'https://genscript.io/alternatives/chatgpt',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ChatGPT Alternative for YouTube Scripts | GenScript',
    description: 'YouTube-optimized AI script generator with 68%+ retention targeting.',
  },
};

export default function ChatGPTLayout({ children }) {
  const schemas = generateSchemas('chatgpt', 'ChatGPT');

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
