// Centralized FAQ data and JSON-LD schema generators for alternatives pages.
// FAQ text is copied verbatim from each page.js to ensure schema matches visible HTML.

export const competitorFAQs = {
  chatgpt: [
    {
      question: 'How easy is it to switch from ChatGPT?',
      answer: 'Extremely easy. No complex prompts needed - just tell us your topic and get a perfect script in 30 seconds. Our migration assistant helps you set up voice matching based on your existing content.'
    },
    {
      question: "Why can't I just use better prompts with ChatGPT?",
      answer: "Even with perfect prompts, ChatGPT lacks YouTube-specific training data and retention optimization. We analyze millions of viral videos to understand what keeps viewers watching - something generic AI can't replicate."
    },
    {
      question: 'Do you use ChatGPT technology?',
      answer: 'We use advanced AI models including GPT-4 and Claude, but fine-tuned specifically for YouTube. Our proprietary PVSS framework and retention optimization layer ensures every script maximizes watch time.'
    },
    {
      question: "What about ChatGPT's free tier?",
      answer: "Time spent prompting and refining ChatGPT scripts often costs more in lost productivity than our subscription. Plus, you get consistent quality and YouTube optimization that free ChatGPT can't provide."
    },
    {
      question: 'Can I use both tools together?',
      answer: 'Many creators use ChatGPT for general tasks and GenScript specifically for YouTube scripts. However, most find our platform handles all their YouTube content needs more efficiently.'
    },
    {
      question: 'How much time will I actually save?',
      answer: 'Users report saving 2-3 hours per script. Instead of 30+ minutes of prompting and refining with ChatGPT, you get a retention-optimized script in under 30 seconds.'
    }
  ],

  'subscribr-ai': [
    {
      question: 'How easy is it to switch from Subscribr AI?',
      answer: 'Extremely easy. Our migration wizard imports your templates and settings in under 5 minutes. Plus, you get a personal migration assistant.'
    },
    {
      question: 'What about my remaining credits?',
      answer: "We'll match your credit balance and convert it to unlimited generation for the equivalent time period."
    },
    {
      question: 'Do you really have unlimited scripts?',
      answer: 'Yes, truly unlimited. No credits, no caps, no throttling. Generate as many scripts as you need.'
    },
    {
      question: "How is your AI better than Subscribr AI's?",
      answer: "We use the PVSS framework, advanced voice matching, and psychographic targeting - features Subscribr AI doesn't have."
    },
    {
      question: 'Can I keep my workflow?',
      answer: 'Yes, and improve it. We support all the same export formats plus API access on all plans (not just enterprise).'
    }
  ],

  vidiq: [
    {
      question: 'Is there a VidIQ alternative that actually writes scripts?',
      answer: 'Yes! Genscript is specifically designed for YouTube script generation, unlike VidIQ which focuses on SEO and analytics. We create complete, retention-optimized scripts in 30 seconds with voice matching and fact-checking built in.'
    },
    {
      question: 'How does Genscript compare to VidIQ for YouTube retention optimization?',
      answer: 'While VidIQ provides analytics and SEO tools, Genscript actively optimizes your scripts for 70%+ retention using AI trained on millions of viral videos. Our users report 2x higher retention rates compared to traditional scripting methods.'
    },
    {
      question: 'Can I use Genscript as a VidIQ alternative for keyword research and script writing?',
      answer: 'Absolutely! Genscript includes keyword optimization features plus advanced script generation that VidIQ lacks. Many creators use both tools together - VidIQ for research and Genscript for creating the actual content.'
    },
    {
      question: 'What makes Genscript better than VidIQ for faceless YouTube channels?',
      answer: "Faceless channels rely entirely on script quality to keep viewers engaged. Genscript's retention optimization, voice matching, and PVSS framework create scripts specifically designed for faceless content, unlike VidIQ's generic SEO approach."
    },
    {
      question: 'How easy is it to switch from VidIQ?',
      answer: 'Extremely easy! You can start using Genscript immediately - no data migration needed. Our onboarding team provides free setup assistance for all new users switching from VidIQ.'
    },
    {
      question: 'Is the pricing worth it compared to VidIQ?',
      answer: 'While our starting price is slightly higher, users report 3-5x ROI within the first month through improved retention and monetization. We also offer a 14-day free trial.'
    }
  ],

  'jasper-ai': [
    {
      question: 'Is Genscript better than Jasper AI for YouTube content?',
      answer: "Absolutely. While Jasper is a general-purpose AI writer, Genscript is built specifically for YouTube creators. We optimize for viewer retention, engagement, and the YouTube algorithm - things Jasper doesn't even consider."
    },
    {
      question: 'Can I still use Genscript for other content like Jasper?',
      answer: 'Genscript specializes in YouTube scripts, but many creators use the generated content as a foundation for blogs, social media posts, and newsletters. However, if you need primarily blog content, Jasper might be better suited.'
    },
    {
      question: 'How does the pricing compare to Jasper?',
      answer: "We're competitive with Jasper's pricing. Our Creator plan at $39/mo and Professional plan at $79/mo offer more YouTube-specific features than Jasper's general plans. Plus, we don't have word limits - you pay for unlimited script generation."
    },
    {
      question: "What about Jasper's Chrome extension?",
      answer: "We offer a YouTube Studio integration that's far more useful for creators. It analyzes your existing videos, suggests improvements, and generates optimized scripts right within YouTube's interface."
    },
    {
      question: 'Do you have templates like Jasper?',
      answer: "Yes, but better! We have 1000+ YouTube-specific templates including viral hooks, retention patterns, and proven frameworks used by top creators. Jasper's templates are mostly for written content, not video scripts."
    }
  ],

  'copy-ai': [
    {
      question: 'How is Genscript different from Copy.ai?',
      answer: 'Copy.ai is a marketing copy tool that happens to have YouTube templates. Genscript is exclusively built for YouTube creators with retention optimization, viral frameworks, and unlimited script generation specifically for video content.'
    },
    {
      question: "What about Copy.ai's free plan?",
      answer: "Copy.ai's free plan gives you 2,000 words per month - that's barely one YouTube script. Genscript's trial gives you unlimited scripts for 14 days, and our paid plans have no word limits at all."
    },
    {
      question: 'Can Genscript write marketing copy like Copy.ai?',
      answer: "No, and that's intentional. We focus exclusively on YouTube scripts to deliver the best possible results. For YouTube content, we outperform any general-purpose tool."
    },
    {
      question: 'Is the price difference worth it?',
      answer: 'Genscript starts at $39/mo with unlimited scripts. Copy.ai charges $49/mo for 40K words. You get more content, better features, and YouTube-specific optimization for a competitive price.'
    },
    {
      question: 'Can I migrate my Copy.ai templates?',
      answer: "Yes! Our migration team will convert your Copy.ai templates and train our AI on your style. Plus, you'll get 45% off for 3 months when switching."
    }
  ],

  writesonic: [
    {
      question: 'How easy is it to switch from Writesonic?',
      answer: "Extremely easy. Our migration wizard imports your templates and content style in under 5 minutes. Plus, you get unlimited scripts vs Writesonic's word limits."
    },
    {
      question: 'What about my remaining Writesonic credits?',
      answer: "We'll match your remaining word count and convert it to unlimited generation for the equivalent time period. No credits lost in the switch."
    },
    {
      question: 'Do you really have unlimited scripts?',
      answer: 'Yes, truly unlimited. No word counts, no caps, no throttling. Generate as many YouTube scripts as you need without worrying about running out.'
    },
    {
      question: 'How is your YouTube focus better than Writesonic?',
      answer: "We use retention optimization, viral frameworks, and YouTube-specific training data. Writesonic is trained on blogs and marketing copy - we're trained on viral videos."
    },
    {
      question: 'Can I keep my current workflow?',
      answer: 'Yes, and improve it dramatically. We support all the same export formats, but with YouTube-optimized content that gets 68%+ retention vs generic blog-style scripts.'
    }
  ],

  'invideo-ai': [
    {
      question: 'Can I use Genscript scripts with InVideo AI?',
      answer: "Absolutely! Genscript generates text scripts that work perfectly with InVideo AI's text-to-video feature. Many creators use this powerful combination for the best of both worlds."
    },
    {
      question: 'Why do I need better scripts if InVideo AI auto-generates everything?',
      answer: 'InVideo AI is excellent for quick video creation, but the auto-generated scripts are generic. Our retention-optimized scripts can increase your watch time by 100%+ when used with any video creation tool.'
    },
    {
      question: 'Does Genscript replace InVideo AI?',
      answer: 'No, they complement each other perfectly. Genscript handles the content strategy and script optimization, while InVideo AI handles the visual creation. Together, they create high-performing videos fast.'
    },
    {
      question: 'What about the voiceover features in InVideo AI?',
      answer: "InVideo's voiceovers are good for quick content, but our voice matching technology creates scripts that sound authentically like you, leading to much higher engagement and trust."
    },
    {
      question: 'Is there a workflow integration between the tools?',
      answer: 'Yes! Generate your script in Genscript, copy it to InVideo AI, and let their AI create the visuals. This workflow typically takes under 10 minutes and produces much better results than using either tool alone.'
    }
  ],

  pictory: [
    {
      question: "Can I use Genscript scripts with Pictory's text-to-video feature?",
      answer: "Yes! This is the perfect combination. Generate retention-optimized scripts with Genscript, then use them as input for Pictory's text-to-video conversion. You get engaging content AND professional video production."
    },
    {
      question: 'Why do I need script optimization if Pictory handles everything?',
      answer: "Pictory excels at converting text to video, but the input text quality determines your video's performance. Generic blog content converted to video typically gets 28% retention. Optimized scripts get 70%+ retention."
    },
    {
      question: 'Does Genscript replace Pictory?',
      answer: 'No, they work perfectly together. Genscript optimizes the content strategy and script quality, while Pictory handles the video production. Together, you get both high-quality content AND efficient production.'
    },
    {
      question: "What about Pictory's blog-to-video feature?",
      answer: "It's great for quick conversions, but blogs aren't written for video retention. We can transform your blog content into video-optimized scripts that maintain the information while adding engagement elements."
    },
    {
      question: 'How does this workflow save time compared to using either tool alone?',
      answer: "You get the speed of Pictory's video creation with the performance of optimized scripts. Instead of creating multiple videos to find what works, your first video performs because the script is already optimized."
    }
  ],

  simplified: [
    {
      question: 'Can I use both Simplified and Genscript together?',
      answer: 'Absolutely! Many creators use Simplified for graphics and video editing while using Genscript for script writing and content strategy. They complement each other perfectly.'
    },
    {
      question: 'Why do I need script optimization if my videos look great?',
      answer: "Beautiful visuals get clicks, but engaging scripts keep viewers watching. YouTube's algorithm prioritizes watch time over visual quality. You need both great design AND great content."
    },
    {
      question: 'Does Genscript offer any visual creation tools?',
      answer: 'We focus purely on content optimization - scripts, hooks, and retention strategies. For visuals, we recommend continuing to use tools like Simplified while adding our script intelligence.'
    },
    {
      question: 'How much better are the results compared to Simplified alone?',
      answer: 'Users report 340% better watch time, 250% more subscribers, and 180% higher engagement when combining great visuals with optimized scripts.'
    },
    {
      question: 'Is there a migration discount from Simplified?',
      answer: 'Yes! We offer 40% off your first 2 months plus free setup assistance to help you integrate script optimization into your existing Simplified workflow.'
    }
  ],

  tubebuddy: [
    {
      question: 'How is GenScript different from TubeBuddy?',
      answer: 'While TubeBuddy focuses on keyword research and SEO optimization, GenScript specializes in creating high-retention scripts using AI. We help you create content that not only gets discovered but keeps viewers watching until the end.'
    },
    {
      question: 'Can I use both TubeBuddy and GenScript together?',
      answer: "Absolutely! Many creators use TubeBuddy for keyword research and GenScript for script generation. They complement each other perfectly. However, GenScript also includes essential SEO features, so you might find you don't need both."
    },
    {
      question: 'Do you have keyword research like TubeBuddy?',
      answer: 'Yes! While our focus is on retention-optimized scripts, we include keyword research and SEO optimization in all our plans. Our approach is to find keywords that not only have search volume but also align with high-retention content strategies.'
    },
    {
      question: 'Why is your starting price higher than TubeBuddy?',
      answer: 'Our AI script generation technology requires more advanced infrastructure than basic keyword tools. However, the time saved and results achieved (68%+ average retention) provide significantly better ROI. Most users report 3-5x return on their investment.'
    },
    {
      question: 'Can you import my TubeBuddy data?',
      answer: "Yes! Our migration team helps you transfer your keyword lists, tags, and optimization settings. We'll also analyze your best-performing content to train our AI on your unique style."
    },
    {
      question: "What about TubeBuddy's browser extension?",
      answer: "We offer a web-based platform that's accessible from any device. While we don't have a browser extension yet, our interface is optimized for quick script generation and you can easily copy content directly to YouTube."
    }
  ]
};

/**
 * Generates an array of 3 JSON-LD schemas for an alternatives page:
 * 1. WebPage (with SoftwareApplication mainEntity)
 * 2. FAQPage
 * 3. BreadcrumbList (3 levels: Home → Alternatives → Competitor)
 */
export function generateSchemas(slug, competitorName) {
  const faqs = competitorFAQs[slug];
  if (!faqs) {
    throw new Error(`No FAQ data found for slug: ${slug}`);
  }

  const pageUrl = `https://genscript.io/alternatives/${slug}`;

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `${competitorName} Alternative for YouTube Scripts | GenScript`,
    url: pageUrl,
    description: `Compare GenScript vs ${competitorName} for YouTube script generation. AI-powered scripts with 68%+ retention optimization, voice matching, and unlimited generation.`,
    mainEntity: {
      '@type': 'SoftwareApplication',
      name: 'GenScript',
      applicationCategory: 'YouTube Script Generator',
      operatingSystem: 'Web',
      offers: {
        '@type': 'AggregateOffer',
        lowPrice: '0',
        highPrice: '199',
        priceCurrency: 'USD'
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        reviewCount: '2500'
      },
      featureList: [
        'AI YouTube script generation',
        '68%+ retention optimization',
        'Voice matching technology',
        'Built-in fact checking',
        'PVSS viral framework',
        'Psychographic targeting'
      ]
    }
  };

  const faqPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://genscript.io'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Alternatives',
        item: 'https://genscript.io/alternatives'
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: `${competitorName} Alternative`,
        item: pageUrl
      }
    ]
  };

  return [webPageSchema, faqPageSchema, breadcrumbSchema];
}
