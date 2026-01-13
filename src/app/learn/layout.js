export const metadata = {
  title: {
    template: '%s | GenScript Learn',
    default: 'Learn YouTube Content Creation | GenScript',
  },
  description: 'Free guides and resources to master YouTube content creation. Learn script writing, viral hooks, algorithm optimization, and more.',
  openGraph: {
    siteName: 'GenScript',
    type: 'website',
  },
};

export default function LearnLayout({ children }) {
  return children;
}
