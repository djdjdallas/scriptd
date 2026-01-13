export const metadata = {
  title: 'Free YouTube Transcript Extractor | Extract Video Transcripts for Research',
  description: 'Free YouTube transcript extraction tool. Extract and analyze video transcripts in seconds for competitive research, hook analysis, topic detection, and keyword research.',
  keywords: 'youtube transcript extractor, video transcript tool, youtube captions download, competitive research, hook analysis, transcript analyzer, free transcript tool',
  alternates: {
    canonical: 'https://genscript.io/tools/transcript-extraction',
  },
  openGraph: {
    title: 'Free YouTube Transcript Extractor | Competitive Research Tool',
    description: 'Extract and analyze YouTube video transcripts for free. Perfect for competitive research and content analysis.',
    url: 'https://genscript.io/tools/transcript-extraction',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free YouTube Transcript Extractor',
    description: 'Extract and analyze video transcripts for competitive research.',
  },
};

export default function TranscriptExtractionLayout({ children }) {
  return <>{children}</>;
}
