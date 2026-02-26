import { generateSchemas } from '@/lib/alternatives-schema-data';

export const metadata = {
  title: 'Copy.ai Alternative for YouTube - Unlimited Scripts, Better Results | Genscript',
  description: 'Copy.ai writes marketing copy. Genscript writes YouTube scripts with 68%+ retention. Unlimited content for less. Try free for 14 days.',
  keywords: 'copy.ai alternative, copy ai competitor, youtube script generator, unlimited scripts, video content ai',
  openGraph: {
    title: 'Copy.ai Alternative for YouTube - Unlimited Scripts, Better Results | Genscript',
    description: 'Copy.ai writes marketing copy. Genscript writes YouTube scripts with 68%+ retention. Unlimited content for less.',
    type: 'website',
  },
  alternates: {
    canonical: 'https://genscript.io/alternatives/copy-ai',
  },
};

export default function CopyAILayout({ children }) {
  const schemas = generateSchemas('copy-ai', 'Copy.ai');

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