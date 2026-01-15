/**
 * Resources Section Layout
 *
 * Shared layout for all resources pages including whitepapers,
 * guides, and downloadable content.
 */

export const metadata = {
  title: {
    template: '%s | GenScript Resources',
    default: 'Resources | GenScript'
  },
  description: 'Free resources, guides, and whitepapers for YouTube creators. Learn about YouTube compliance, script writing best practices, and content optimization.',
};

export default function ResourcesLayout({ children }) {
  return children;
}
