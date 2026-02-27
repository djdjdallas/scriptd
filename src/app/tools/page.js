"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Lightbulb,
  FileText,
  TrendingUp,
  Hash,
  Image,
  Clock,
  Zap,
  ArrowRight,
  Search,
  Sparkles,
  Star,
  Users,
  ChevronRight,
  Filter,
  Video,
} from "lucide-react";
import { cn } from "@/lib/utils";

const tools = [
  {
    id: "transcript-extraction",
    title: "YouTube Transcript Extraction",
    description:
      "Extract and analyze video transcripts in seconds. AI-powered competitive research made easy.",
    icon: Video,
    badge: "New",
    badgeClass: "vb-badge-cyan",
    features: [
      "Hook analysis",
      "Topic extraction",
      "Keyword detection",
      "Timestamp identification",
    ],
    href: "/tools/transcript-extraction",
    category: "research",
    popularity: 5,
  },
  {
    id: "title-generator",
    title: "YouTube Title Generator",
    description: "Create click-worthy titles that rank well in YouTube search",
    icon: FileText,
    badge: "Most Popular",
    badgeClass: "vb-badge-violet",
    features: ["SEO optimized", "A/B testing ready", "Character counter"],
    href: "/tools/title-generator",
    category: "content",
    popularity: 5,
  },
  {
    id: "hook-generator",
    title: "Hook Generator",
    description:
      "Generate compelling hooks that grab attention in the first 15 seconds",
    icon: Zap,
    badge: "Trending",
    badgeClass: "vb-badge-violet",
    features: ["Multiple styles", "Engagement focused", "Time-tested formulas"],
    href: "/tools/hook-generator",
    category: "content",
    popularity: 4,
  },
  {
    id: "idea-generator",
    title: "Video Idea Generator",
    description: "Never run out of content ideas with AI-powered suggestions",
    icon: Lightbulb,
    features: ["Niche specific", "Trending topics", "Competition analysis"],
    href: "/tools/idea-generator",
    category: "planning",
    popularity: 4,
  },
  {
    id: "hashtag-generator",
    title: "Hashtag Generator",
    description:
      "Find the perfect hashtags to increase your video discoverability",
    icon: Hash,
    features: ["Relevance scoring", "Competition level", "Trending tags"],
    href: "/tools/hashtag-generator",
    category: "seo",
    popularity: 3,
  },
  {
    id: "thumbnail-ideas",
    title: "Thumbnail Idea Generator",
    description:
      "Get creative thumbnail concepts that boost click-through rates",
    icon: Image,
    badge: "New",
    badgeClass: "vb-badge-cyan",
    features: ["Style suggestions", "Color psychology", "Text overlay ideas"],
    href: "/tools/thumbnail-ideas",
    category: "visual",
    popularity: 5,
  },
  {
    id: "length-calculator",
    title: "Script Length Calculator",
    description:
      "Calculate the perfect script length for your target video duration",
    icon: Clock,
    features: ["Speaking pace options", "Word count", "Read time estimate"],
    href: "/tools/length-calculator",
    category: "planning",
    popularity: 3,
  },
  {
    id: "faceless-youtube",
    title: "Faceless YouTube Channel Generator",
    description:
      "Create complete faceless YouTube videos without showing your face",
    icon: Users,
    badge: "Popular",
    badgeClass: "vb-badge-violet",
    features: [
      "Automated scripts",
      "AI voiceover",
      "Visual generation",
      "Monetization ready",
    ],
    href: "/tools/faceless-youtube-generator",
    category: "content",
    popularity: 5,
  },
  {
    id: "retention-optimizer",
    title: "Retention Optimizer",
    description:
      "Transform scripts for 68%+ retention with psychological triggers",
    icon: TrendingUp,
    badge: "Advanced",
    badgeClass: "vb-badge",
    features: [
      "Pattern interrupts",
      "Open loops",
      "Micro-commitments",
      "Visual anchoring",
    ],
    href: "/tools/retention-optimizer",
    category: "content",
    popularity: 4,
  },
  {
    id: "pvss-framework",
    title: "PVSS Viral Framework",
    description: "Pattern-Value-Story-Surprise structure for viral videos",
    icon: Sparkles,
    badge: "Framework",
    badgeClass: "vb-badge",
    features: [
      "Proven structure",
      "Psychology-based",
      "3x higher virality",
      "Template library",
    ],
    href: "/tools/pvss-framework",
    category: "planning",
    popularity: 4,
  },
  {
    id: "voice-matching",
    title: "Voice Matching AI",
    description:
      "AI that writes exactly like you do with deep linguistic profiling",
    icon: Users,
    badge: "Advanced",
    badgeClass: "vb-badge",
    features: [
      "100+ voice metrics",
      "Real transcript analysis",
      "Pattern enforcement",
      "95%+ accuracy",
    ],
    href: "/signup",
    category: "content",
    popularity: 5,
  },
];

const categories = [
  { id: "all", label: "All Tools", icon: Sparkles },
  { id: "research", label: "Research", icon: Video },
  { id: "content", label: "Content", icon: FileText },
  { id: "planning", label: "Planning", icon: Lightbulb },
  { id: "seo", label: "SEO", icon: TrendingUp },
  { id: "visual", label: "Visual", icon: Image },
];

export default function ToolsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [hoveredCard, setHoveredCard] = useState(null);

  const filteredTools = useMemo(() => {
    return tools
      .filter((tool) => {
        const matchesSearch =
          searchQuery === "" ||
          tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tool.features.some((f) =>
            f.toLowerCase().includes(searchQuery.toLowerCase())
          );

        const matchesCategory =
          selectedCategory === "all" || tool.category === selectedCategory;

        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
  }, [searchQuery, selectedCategory]);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden pb-16 pt-12">
        <div className="relative space-y-10 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            {/* Header */}
            <div className="text-center space-y-6 mb-12">
              <div className="vb-badge-violet mx-auto w-fit">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-semibold">
                  100% Free &middot; No Sign-up Required
                </span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold font-display tracking-tight text-white">
                YouTube Script{" "}
                <span className="gradient-text">Tools</span>
              </h1>

              <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                Professional AI-powered tools trusted by thousands of creators
                to make better content, faster.
              </p>
            </div>

            {/* Search and Filters */}
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search by name, feature, or keyword..."
                  className="vb-input pl-12 pr-4 h-14 text-base"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Category Filters */}
              <div className="flex flex-wrap gap-3 justify-center">
                {categories.map((category) => {
                  const Icon = category.icon;
                  const isActive = selectedCategory === category.id;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border",
                        isActive
                          ? "bg-violet-500/10 border-violet-500/20 text-violet-400"
                          : "bg-white/[0.04] border-white/[0.06] text-gray-400 hover:text-white hover:border-white/10"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{category.label}</span>
                      {category.id === "all" && (
                        <span className={cn(
                          "ml-1 text-xs px-1.5 py-0.5 rounded-full",
                          isActive
                            ? "bg-violet-500/20 text-violet-300"
                            : "bg-white/[0.06] text-gray-500"
                        )}>
                          {tools.length}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredTools.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTools.map((tool, index) => {
              const Icon = tool.icon;
              const isHovered = hoveredCard === tool.id;

              return (
                <Link key={tool.id} href={tool.href}>
                  <div
                    className={cn(
                      "group relative h-full vb-card-interactive",
                      "hover:border-violet-500/30 hover:-translate-y-1",
                      "animate-in fade-in slide-in-from-bottom-4"
                    )}
                    onMouseEnter={() => setHoveredCard(tool.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                    style={{
                      animationDelay: `${index * 50}ms`,
                    }}
                  >
                    {/* Header */}
                    <div className="pb-4">
                      <div className="flex items-start justify-between mb-4">
                        {/* Icon */}
                        <div
                          className={cn(
                            "p-3 rounded-xl transition-all duration-300",
                            isHovered
                              ? "bg-violet-500 text-white scale-110"
                              : "bg-violet-500/10 text-violet-400"
                          )}
                        >
                          <Icon className="h-6 w-6" />
                        </div>

                        {/* Badge */}
                        {tool.badge && (
                          <span className={tool.badgeClass}>
                            {tool.badge}
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-violet-400 transition-colors">
                        {tool.title}
                      </h3>

                      <p className="text-sm text-gray-400 leading-relaxed">
                        {tool.description}
                      </p>
                    </div>

                    {/* Content */}
                    <div className="space-y-4">
                      {/* Features */}
                      <ul className="space-y-2">
                        {tool.features.map((feature, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-sm text-gray-400"
                          >
                            <div
                              className={cn(
                                "mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 transition-all duration-300",
                                isHovered
                                  ? "bg-violet-400 scale-125"
                                  : "bg-violet-500/60"
                              )}
                            />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Popularity Stars */}
                      {tool.popularity && (
                        <div className="flex items-center gap-1 pt-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "h-3.5 w-3.5 transition-all",
                                i < tool.popularity
                                  ? "fill-yellow-500 text-yellow-500"
                                  : "text-gray-700"
                              )}
                            />
                          ))}
                          <span className="text-xs text-gray-500 ml-1.5">
                            Highly Rated
                          </span>
                        </div>
                      )}

                      {/* CTA */}
                      <div
                        className={cn(
                          "flex items-center justify-between pt-4 border-t border-white/5",
                          "transition-all duration-300"
                        )}
                      >
                        <span
                          className={cn(
                            "text-sm font-semibold transition-all",
                            isHovered ? "text-violet-400" : "text-gray-500"
                          )}
                        >
                          Try it free
                        </span>
                        <ArrowRight
                          className={cn(
                            "h-4 w-4 transition-all",
                            isHovered
                              ? "text-violet-400 translate-x-1"
                              : "text-gray-500"
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="vb-card p-16 text-center border-dashed">
            <div className="space-y-4">
              <Filter className="h-16 w-16 mx-auto text-gray-500" />
              <h3 className="text-2xl font-bold text-white">No tools found</h3>
              <p className="text-gray-400 text-lg">
                Try adjusting your search terms or filters
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                className="vb-btn-primary mt-6"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="vb-card relative overflow-hidden">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-cyan-600/5 rounded-2xl" />

          <div className="relative pt-6 pb-6 text-center">
            <div className="vb-badge-violet mx-auto w-fit mb-6">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-semibold">
                Premium Features Available
              </span>
            </div>

            <h3 className="text-4xl font-bold text-white mb-4">
              Ready for Unlimited Power?
            </h3>

            <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
              Unlock unlimited generations, advanced AI models, team
              collaboration, priority support, and exclusive features with our
              Pro plan.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/signup" className="vb-btn-primary flex items-center gap-2 group">
                Get Started Free
                <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/pricing" className="vb-btn-outline">
                View Pricing Plans
              </Link>
            </div>

            <p className="text-sm text-gray-500 mt-6">
              No credit card required &middot; Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold font-display text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-400">
            Everything you need to know about our tools
          </p>
        </div>

        <div className="space-y-4">
          {[
            {
              question: "Are these tools really free?",
              answer:
                "Yes! All tools on this page are 100% free to use without any sign-up required. We offer premium features for power users, but these tools will always remain free.",
            },
            {
              question: "How accurate are the AI suggestions?",
              answer:
                "Our AI is trained on millions of successful YouTube videos and continuously improves. While results may vary, our tools consistently help creators improve their content performance.",
            },
            {
              question: "Can I use these for commercial purposes?",
              answer:
                "Absolutely! All content generated by our free tools is yours to use however you like, including for commercial YouTube channels and business purposes.",
            },
          ].map((faq, index) => (
            <div
              key={index}
              className="vb-card-interactive hover:border-violet-500/30"
            >
              <h4 className="text-lg font-semibold text-white flex items-start gap-3 mb-3">
                <span className="text-violet-400 font-bold shrink-0">
                  Q{index + 1}
                </span>
                {faq.question}
              </h4>
              <p className="text-gray-400 pl-8">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
