'use client';

/**
 * Blog Index Page
 *
 * Lists all blog posts with filtering, categories, and pagination.
 */

import { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Calendar,
  Clock,
  Tag,
  ChevronRight,
  Search,
  Filter,
  ArrowRight,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  MarketingSection,
  MarketingCard,
  MarketingHero
} from '@/components/marketing/MarketingLayout';
import { getBlogPosts, categories, formatDate, getAllTags } from '@/lib/blog/blog-utils';

export default function BlogIndexPage() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Get all posts
  const { posts: allPosts } = getBlogPosts();
  const { posts: featuredPosts } = getBlogPosts({ featured: true });
  const allTags = getAllTags();

  // Filter posts based on search and category
  let displayPosts = allPosts;
  if (selectedCategory) {
    displayPosts = displayPosts.filter(post =>
      post.category.toLowerCase().replace(/\s+/g, '-') === selectedCategory
    );
  }
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    displayPosts = displayPosts.filter(post =>
      post.title.toLowerCase().includes(query) ||
      post.description.toLowerCase().includes(query) ||
      post.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Hero */}
      <MarketingHero
        badge={
          <>
            <BookOpen className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-gray-300">GenScript Blog</span>
          </>
        }
        title="Learn YouTube Script Writing"
        subtitle="Tips, guides, and insights for creating YouTube content that engages, retains, and stays monetized."
      />

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-[1fr_300px] gap-12">
          {/* Main Content */}
          <div>
            {/* Featured Post */}
            {featuredPosts.length > 0 && !selectedCategory && !searchQuery && (
              <div className="mb-12">
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  Featured
                </h2>
                <Link href={`/blog/${featuredPosts[0].slug}`}>
                  <MarketingCard className="p-6 hover:border-purple-500/50 transition-colors">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-sm">
                        {featuredPosts[0].category}
                      </span>
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(featuredPosts[0].publishedAt)}
                      </span>
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {featuredPosts[0].readTime}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">
                      {featuredPosts[0].title}
                    </h3>
                    <p className="text-gray-400 mb-4">{featuredPosts[0].excerpt}</p>
                    <div className="flex items-center text-purple-400">
                      Read article <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  </MarketingCard>
                </Link>
              </div>
            )}

            {/* Search */}
            <div className="mb-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-900/50 border-gray-800 focus:border-purple-500"
                />
              </div>
            </div>

            {/* Category Filter (Mobile) */}
            <div className="lg:hidden mb-8">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === null ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                  className={selectedCategory === null ? 'bg-purple-600' : 'border-gray-700'}
                >
                  All
                </Button>
                {categories.slice(0, 4).map(cat => (
                  <Button
                    key={cat.slug}
                    variant={selectedCategory === cat.slug ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={selectedCategory === cat.slug ? 'bg-purple-600' : 'border-gray-700'}
                  >
                    {cat.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Posts List */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-6">
                {selectedCategory
                  ? categories.find(c => c.slug === selectedCategory)?.name || 'Articles'
                  : searchQuery
                  ? `Search Results for "${searchQuery}"`
                  : 'All Articles'
                }
              </h2>

              {displayPosts.length === 0 ? (
                <MarketingCard className="p-8 text-center">
                  <p className="text-gray-400">No articles found matching your criteria.</p>
                  <Button
                    variant="outline"
                    className="mt-4 border-gray-700"
                    onClick={() => {
                      setSelectedCategory(null);
                      setSearchQuery('');
                    }}
                  >
                    Clear filters
                  </Button>
                </MarketingCard>
              ) : (
                <div className="space-y-6">
                  {displayPosts.map(post => (
                    <Link key={post.slug} href={`/blog/${post.slug}`}>
                      <MarketingCard className="p-6 hover:border-purple-500/50 transition-colors">
                        <div className="flex items-center gap-4 mb-3">
                          <span className="px-2 py-1 rounded bg-gray-800 text-gray-400 text-xs">
                            {post.category}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(post.publishedAt)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {post.readTime}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-400">
                          {post.title}
                        </h3>
                        <p className="text-gray-400 text-sm mb-3">{post.excerpt}</p>
                        <div className="flex flex-wrap gap-2">
                          {post.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="text-xs text-gray-500">
                              #{tag.replace(/\s+/g, '')}
                            </span>
                          ))}
                        </div>
                      </MarketingCard>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-8">
              {/* Categories */}
              <MarketingCard className="p-6">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                  Categories
                </h3>
                <nav className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`block w-full text-left py-2 px-3 rounded-lg transition-colors ${
                      selectedCategory === null
                        ? 'bg-purple-500/20 text-purple-400'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    All Articles
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.slug}
                      onClick={() => setSelectedCategory(cat.slug)}
                      className={`block w-full text-left py-2 px-3 rounded-lg transition-colors ${
                        selectedCategory === cat.slug
                          ? 'bg-purple-500/20 text-purple-400'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </nav>
              </MarketingCard>

              {/* Tags */}
              <MarketingCard className="p-6">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                  Popular Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {allTags.slice(0, 8).map(tag => (
                    <button
                      key={tag}
                      onClick={() => setSearchQuery(tag)}
                      className="px-3 py-1 rounded-full bg-gray-800 text-gray-400 text-sm hover:bg-purple-500/20 hover:text-purple-400 transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </MarketingCard>

              {/* CTA */}
              <MarketingCard className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Ready to try GenScript?
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  Generate compliant YouTube scripts in 30 seconds. Free to start.
                </p>
                <Link href="/login">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    Start Free <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </MarketingCard>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
