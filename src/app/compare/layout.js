/**
 * Compare Section Layout
 *
 * Shared layout for comparison pages (GenScript vs Competitors).
 */

export const metadata = {
  title: {
    template: '%s | GenScript Comparison',
    default: 'Compare | GenScript'
  },
  description: 'Compare GenScript with other AI writing tools. See how we stack up against ChatGPT, Subscribr, and more for YouTube script generation.',
};

export default function CompareLayout({ children }) {
  return children;
}
