/**
 * Blog Utilities
 *
 * Helper functions for blog data management, categories, tags,
 * and pagination.
 */

// Blog posts data - in production this would come from a CMS or database
export const blogPosts = [
  {
    slug: 'how-to-pass-youtube-2025-ai-content-policy',
    title: 'How to Pass YouTube\'s 2025 AI Content Policy',
    description: 'A complete guide to creating AI-assisted YouTube content that stays monetized under YouTube\'s new authenticity guidelines.',
    excerpt: 'YouTube\'s 2025 authenticity policy has creators worried about AI-generated content. Here\'s exactly how to stay compliant while still using AI tools to scale your content production.',
    author: 'GenScript Team',
    publishedAt: '2025-01-10',
    updatedAt: '2025-01-10',
    readTime: '8 min read',
    category: 'Compliance',
    tags: ['youtube policy', 'ai content', 'compliance', 'monetization'],
    featured: true,
    image: '/blog/youtube-2025-policy.png'
  },
  {
    slug: 'best-script-structure-finance-youtube-channels',
    title: 'Best Script Structure for Finance YouTube Channels',
    description: 'Learn the proven script frameworks that top finance YouTubers use to educate, engage, and grow their audience.',
    excerpt: 'Finance content has unique challenges: complex topics, compliance requirements, and skeptical audiences. Here\'s the script structure that works.',
    author: 'GenScript Team',
    publishedAt: '2025-01-08',
    updatedAt: '2025-01-08',
    readTime: '10 min read',
    category: 'Script Writing',
    tags: ['finance youtube', 'script structure', 'niche content', 'templates'],
    featured: false,
    image: '/blog/finance-script-structure.png'
  }
];

// Categories
export const categories = [
  { slug: 'compliance', name: 'Compliance', description: 'YouTube policy and content guidelines' },
  { slug: 'script-writing', name: 'Script Writing', description: 'Tips and templates for better scripts' },
  { slug: 'retention', name: 'Retention', description: 'Strategies for keeping viewers watching' },
  { slug: 'ai-tools', name: 'AI Tools', description: 'How to use AI effectively for content' },
  { slug: 'niche-guides', name: 'Niche Guides', description: 'Content strategies for specific niches' }
];

/**
 * Get all blog posts, optionally filtered
 */
export function getBlogPosts(options = {}) {
  let posts = [...blogPosts];

  // Filter by category
  if (options.category) {
    posts = posts.filter(post =>
      post.category.toLowerCase().replace(/\s+/g, '-') === options.category
    );
  }

  // Filter by tag
  if (options.tag) {
    posts = posts.filter(post =>
      post.tags.some(tag => tag.toLowerCase().replace(/\s+/g, '-') === options.tag)
    );
  }

  // Filter featured only
  if (options.featured) {
    posts = posts.filter(post => post.featured);
  }

  // Sort by date (newest first)
  posts.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

  // Pagination
  const page = options.page || 1;
  const perPage = options.perPage || 10;
  const start = (page - 1) * perPage;
  const end = start + perPage;

  return {
    posts: posts.slice(start, end),
    total: posts.length,
    page,
    perPage,
    totalPages: Math.ceil(posts.length / perPage),
    hasMore: end < posts.length
  };
}

/**
 * Get a single blog post by slug
 */
export function getBlogPost(slug) {
  return blogPosts.find(post => post.slug === slug) || null;
}

/**
 * Get related posts based on category and tags
 */
export function getRelatedPosts(slug, limit = 3) {
  const currentPost = getBlogPost(slug);
  if (!currentPost) return [];

  // Score posts by relevance
  const scoredPosts = blogPosts
    .filter(post => post.slug !== slug)
    .map(post => {
      let score = 0;

      // Same category = +10
      if (post.category === currentPost.category) score += 10;

      // Matching tags = +2 each
      post.tags.forEach(tag => {
        if (currentPost.tags.includes(tag)) score += 2;
      });

      return { ...post, score };
    })
    .filter(post => post.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scoredPosts;
}

/**
 * Get all unique tags from blog posts
 */
export function getAllTags() {
  const tagSet = new Set();
  blogPosts.forEach(post => {
    post.tags.forEach(tag => tagSet.add(tag));
  });
  return Array.from(tagSet).sort();
}

/**
 * Format date for display
 */
export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Generate category slug from name
 */
export function getCategorySlug(categoryName) {
  return categoryName.toLowerCase().replace(/\s+/g, '-');
}
