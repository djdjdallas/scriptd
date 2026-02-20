"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
    badgeVariant: "secondary",
    features: [
      "Hook analysis",
      "Topic extraction",
      "Keyword detection",
      "Timestamp identification",
    ],
    href: "/tools/transcript-extraction",
    category: "research",
    popularity: 5,
    gradient: "from-violet-500/10 to-cyan-500/10",
  },
  {
    id: "title-generator",
    title: "YouTube Title Generator",
    description: "Create click-worthy titles that rank well in YouTube search",
    icon: FileText,
    badge: "Most Popular",
    badgeVariant: "default",
    features: ["SEO optimized", "A/B testing ready", "Character counter"],
    href: "/tools/title-generator",
    category: "content",
    popularity: 5,
    gradient: "from-blue-500/10 to-cyan-500/10",
  },
  {
    id: "hook-generator",
    title: "Hook Generator",
    description:
      "Generate compelling hooks that grab attention in the first 15 seconds",
    icon: Zap,
    badge: "Trending",
    badgeVariant: "destructive",
    features: ["Multiple styles", "Engagement focused", "Time-tested formulas"],
    href: "/tools/hook-generator",
    category: "content",
    popularity: 4,
    gradient: "from-orange-500/10 to-red-500/10",
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
    gradient: "from-yellow-500/10 to-amber-500/10",
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
    gradient: "from-green-500/10 to-emerald-500/10",
  },
  {
    id: "thumbnail-ideas",
    title: "Thumbnail Idea Generator",
    description:
      "Get creative thumbnail concepts that boost click-through rates",
    icon: Image,
    badge: "New",
    badgeVariant: "secondary",
    features: ["Style suggestions", "Color psychology", "Text overlay ideas"],
    href: "/tools/thumbnail-ideas",
    category: "visual",
    popularity: 5,
    gradient: "from-pink-500/10 to-rose-500/10",
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
    gradient: "from-indigo-500/10 to-violet-500/10",
  },
  {
    id: "faceless-youtube",
    title: "Faceless YouTube Channel Generator",
    description:
      "Create complete faceless YouTube videos without showing your face",
    icon: Users,
    badge: "Popular",
    badgeVariant: "secondary",
    features: [
      "Automated scripts",
      "AI voiceover",
      "Visual generation",
      "Monetization ready",
    ],
    href: "/tools/faceless-youtube-generator",
    category: "content",
    popularity: 5,
    gradient: "from-teal-500/10 to-cyan-500/10",
  },
  {
    id: "retention-optimizer",
    title: "Retention Optimizer",
    description:
      "Transform scripts for 68%+ retention with psychological triggers",
    icon: TrendingUp,
    badge: "Advanced",
    badgeVariant: "secondary",
    features: [
      "Pattern interrupts",
      "Open loops",
      "Micro-commitments",
      "Visual anchoring",
    ],
    href: "/tools/retention-optimizer",
    category: "content",
    popularity: 4,
    gradient: "from-blue-500/10 to-purple-500/10",
  },
  {
    id: "pvss-framework",
    title: "PVSS Viral Framework",
    description: "Pattern-Value-Story-Surprise structure for viral videos",
    icon: Sparkles,
    badge: "Framework",
    badgeVariant: "secondary",
    features: [
      "Proven structure",
      "Psychology-based",
      "3x higher virality",
      "Template library",
    ],
    href: "/tools/pvss-framework",
    category: "planning",
    popularity: 4,
    gradient: "from-fuchsia-500/10 to-purple-500/10",
  },
  {
    id: "voice-matching",
    title: "Voice Matching AI",
    description:
      "AI that writes exactly like you do with deep linguistic profiling",
    icon: Users,
    badge: "Advanced",
    badgeVariant: "secondary",
    features: [
      "100+ voice metrics",
      "Real transcript analysis",
      "Pattern enforcement",
      "95%+ accuracy",
    ],
    href: "/signup",
    category: "content",
    popularity: 5,
    gradient: "from-violet-500/10 to-indigo-500/10",
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
    <div className="min-h-screen bg-background">
      {/* Cleaner Hero Section */}
      <section className="relative overflow-hidden pb-16 pt-12 bg-gradient-to-b from-muted/30 to-background">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,transparent,black)] dark:bg-grid-slate-700/25" />

        <div className="relative space-y-10 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            {/* Cleaner Header */}
            <div className="text-center space-y-6 mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-primary">
                  100% Free • No Sign-up Required
                </span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold font-display tracking-tight">
                YouTube Script <span className="text-primary">Tools</span>
              </h1>

              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Professional AI-powered tools trusted by thousands of creators
                to make better content, faster.
              </p>
            </div>

            {/* Cleaner Search and Filters */}
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by name, feature, or keyword..."
                  className="pl-12 pr-4 h-14 text-base border-2 focus:border-primary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Cleaner Category Filters */}
              <div className="flex flex-wrap gap-3 justify-center">
                {categories.map((category) => {
                  const Icon = category.icon;
                  const isActive = selectedCategory === category.id;
                  return (
                    <Button
                      key={category.id}
                      variant={isActive ? "default" : "outline"}
                      size="default"
                      onClick={() => setSelectedCategory(category.id)}
                      className={cn(
                        "gap-2 transition-all duration-200",
                        isActive && "shadow-md"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="font-medium">{category.label}</span>
                      {category.id === "all" && (
                        <Badge variant="secondary" className="ml-1">
                          {tools.length}
                        </Badge>
                      )}
                    </Button>
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
                  <Card
                    className={cn(
                      "group relative h-full transition-all duration-300 cursor-pointer",
                      "border-2",
                      "hover:shadow-xl hover:border-primary/50 hover:-translate-y-1",
                      "animate-in fade-in slide-in-from-bottom-4"
                    )}
                    onMouseEnter={() => setHoveredCard(tool.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                    style={{
                      animationDelay: `${index * 50}ms`,
                    }}
                  >
                    {/* Subtle gradient overlay on hover */}
                    <div
                      className={cn(
                        "absolute inset-0 bg-gradient-to-br rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                        tool.gradient
                      )}
                    />

                    <CardHeader className="relative pb-4">
                      <div className="flex items-start justify-between mb-4">
                        {/* Icon */}
                        <div
                          className={cn(
                            "p-3 rounded-xl transition-all duration-300",
                            isHovered
                              ? "bg-primary text-primary-foreground scale-110"
                              : "bg-primary/10 text-primary"
                          )}
                        >
                          <Icon className="h-6 w-6" />
                        </div>

                        {/* Badge */}
                        {tool.badge && (
                          <Badge
                            variant={tool.badgeVariant || "secondary"}
                            className="font-medium"
                          >
                            {tool.badge}
                          </Badge>
                        )}
                      </div>

                      <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors">
                        {tool.title}
                      </CardTitle>

                      <CardDescription className="text-sm leading-relaxed">
                        {tool.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="relative">
                      <div className="space-y-4">
                        {/* Features */}
                        <ul className="space-y-2">
                          {tool.features.map((feature, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-2 text-sm text-muted-foreground"
                            >
                              <div
                                className={cn(
                                  "mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 transition-all duration-300",
                                  isHovered
                                    ? "bg-primary scale-125"
                                    : "bg-primary/60"
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
                                    : "text-muted-foreground/20"
                                )}
                              />
                            ))}
                            <span className="text-xs text-muted-foreground ml-1.5">
                              Highly Rated
                            </span>
                          </div>
                        )}

                        {/* CTA */}
                        <div
                          className={cn(
                            "flex items-center justify-between pt-4 border-t",
                            "transition-all duration-300"
                          )}
                        >
                          <span
                            className={cn(
                              "text-sm font-semibold transition-all",
                              isHovered
                                ? "text-primary"
                                : "text-muted-foreground"
                            )}
                          >
                            Try it free
                          </span>
                          <ArrowRight
                            className={cn(
                              "h-4 w-4 transition-all",
                              isHovered
                                ? "text-primary translate-x-1"
                                : "text-muted-foreground"
                            )}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <Card className="p-16 text-center border-2 border-dashed">
            <div className="space-y-4">
              <Filter className="h-16 w-16 mx-auto text-muted-foreground/50" />
              <h3 className="text-2xl font-bold">No tools found</h3>
              <p className="text-muted-foreground text-lg">
                Try adjusting your search terms or filters
              </p>
              <Button
                size="lg"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                className="mt-6"
              >
                Clear all filters
              </Button>
            </div>
          </Card>
        )}
      </section>

      {/* Simplified CTA Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="relative overflow-hidden border-2 bg-gradient-to-br from-primary/5 to-violet-500/5">
          <CardContent className="relative pt-12 pb-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">
                Premium Features Available
              </span>
            </div>

            <h3 className="text-4xl font-bold mb-4">
              Ready for Unlimited Power?
            </h3>

            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Unlock unlimited generations, advanced AI models, team
              collaboration, priority support, and exclusive features with our
              Pro plan.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="gap-2 group" asChild>
                <Link href="/signup">
                  Get Started Free
                  <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-2" asChild>
                <Link href="/pricing">View Pricing Plans</Link>
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mt-6">
              No credit card required • Cancel anytime
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Cleaner FAQ Section */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold font-display mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">
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
            <Card
              key={index}
              className="group border-2 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
            >
              <CardHeader>
                <CardTitle className="text-lg flex items-start gap-3">
                  <span className="text-primary font-bold shrink-0">
                    Q{index + 1}
                  </span>
                  {faq.question}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground pl-8">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
