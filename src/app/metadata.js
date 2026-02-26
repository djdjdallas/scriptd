export const homepageMetadata = {
  metadataBase: new URL("https://genscript.io"),
  title: "GenScript — Scale Your Voice | AI YouTube Script Generator",
  description: "GenScript is an AI YouTube script generator that matches your voice using Voice DNA technology. Generate retention-optimized scripts with the PVSS Framework. Trusted by 500+ creators. Free to start.",
  keywords: [
    "YouTube script generator",
    "AI content creation",
    "YouTube automation tools",
    "viral script writing",
    "content creator tools",
    "YouTube growth tools",
    "AI video scripts",
    "YouTube SEO tools"
  ],
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    apple: [
      { url: '/apple-icon.svg', type: 'image/svg+xml' }
    ]
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: "GenScript — Scale Your Voice | AI YouTube Script Generator",
    description: "Extract your voice DNA and generate YouTube scripts that sound like you. Compliance-checked, retention-optimized. Free trial available.",
    url: "https://genscript.io",
    siteName: "GenScript",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "GenScript - AI YouTube Script Generator"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "GenScript — Scale Your Voice",
    description: "Extract your voice DNA and generate YouTube scripts that sound authentically you. Trusted by 500+ creators.",
    images: ["/twitter-image.png"]
  },
  other: {
    "fb:app_id": "your-fb-app-id"
  }
};

export const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "GenScript",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "priceValidUntil": "2026-12-31",
    "availability": "https://schema.org/InStock"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "2500",
    "bestRating": "5"
  },
  "url": "https://genscript.io",
  "description": "AI YouTube script generator that matches your voice and optimizes for 70%+ viewer retention using Voice DNA technology and the PVSS Framework",
  "featureList": [
    "Voice DNA Extraction",
    "Compliance Engine",
    "Retention Optimizer",
    "One-Click Export",
    "Voice Matching",
    "Team Collaboration",
    "Fact Checking",
    "PVSS Framework"
  ],
  "screenshot": "https://genscript.io/screenshot.png",
  "softwareVersion": "1.0",
  "creator": {
    "@type": "Organization",
    "name": "GenScript",
    "url": "https://genscript.io"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+14242880215",
    "contactType": "customer support"
  }
};

export const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is GenScript?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "GenScript is an AI YouTube script generator that uses Voice DNA technology to match your unique speaking style. It produces retention-optimized, compliance-checked scripts so every video sounds like you wrote it."
      }
    },
    {
      "@type": "Question",
      "name": "How does Voice DNA Extraction work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Upload 3-5 of your existing scripts or transcripts. GenScript's AI analyzes 20+ speech patterns including catchphrases, pacing, humor style, and transitions to build a voice profile. Every script generated afterward matches your unique voice."
      }
    },
    {
      "@type": "Question",
      "name": "How does GenScript optimize for viewer retention?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "GenScript uses the PVSS (Pattern, Value, Story, Stakes) Framework to structure scripts for 70%+ viewer retention. Each section is engineered with proven hook formulas, open loops, and pacing techniques that keep viewers watching."
      }
    },
    {
      "@type": "Question",
      "name": "What makes GenScript different from ChatGPT or Jasper?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Unlike general-purpose AI writers, GenScript is built exclusively for YouTube. It includes Voice DNA matching, a YouTube compliance engine, retention optimization, and fact-checking — features that ChatGPT and Jasper do not offer."
      }
    },
    {
      "@type": "Question",
      "name": "Is there a free plan?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. GenScript offers a free plan that includes 3 scripts per month with compliance checking and retention optimization. Paid plans start at $29/month and unlock unlimited scripts, Voice DNA, and priority support."
      }
    },
    {
      "@type": "Question",
      "name": "What YouTube niches does GenScript work for?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "GenScript works across all YouTube niches including finance, tech reviews, education, true crime, health & wellness, gaming, and more. The Voice DNA system adapts to any content style or subject matter."
      }
    },
    {
      "@type": "Question",
      "name": "Does GenScript check YouTube compliance?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Every script is scanned by the built-in Compliance Engine, which checks for YouTube policy violations, AI-detection patterns, and content guidelines. You get a compliance score and specific suggestions before publishing."
      }
    }
  ]
};

export const organizationStructuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "GenScript",
  "url": "https://genscript.io",
  "logo": "https://genscript.io/logo.png",
  "description": "AI-powered YouTube script generation platform helping creators achieve viral growth.",
  "sameAs": [
    "https://twitter.com/genscript",
    "https://www.linkedin.com/company/genscript",
    "https://www.youtube.com/@genscript"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+14242880215",
    "contactType": "customer support",
    "areaServed": "Worldwide",
    "availableLanguage": ["English"]
  }
};

export const marketStatsStructuredData = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  "name": "YouTube AI Tools Market Statistics 2024",
  "description": "Comprehensive market research data on AI video generation and YouTube creator tools",
  "creator": {
    "@type": "Organization",
    "name": "Market Research"
  },
  "datePublished": "2024-01-01",
  "distribution": [
    {
      "@type": "DataDownload",
      "encodingFormat": "application/json",
      "contentUrl": "https://genscript.io/api/market-stats"
    }
  ],
  "variableMeasured": [
    {
      "@type": "PropertyValue",
      "name": "AI Video Market Size 2024",
      "value": "1.5 billion USD"
    },
    {
      "@type": "PropertyValue", 
      "name": "AI Video Market Size 2033",
      "value": "7.5 billion USD"
    },
    {
      "@type": "PropertyValue",
      "name": "Marketers Using AI for Outlining",
      "value": "71.7%"
    },
    {
      "@type": "PropertyValue",
      "name": "YouTube Creators Globally",
      "value": "69 million"
    },
    {
      "@type": "PropertyValue",
      "name": "Channel Growth with AI Tools",
      "value": "180% faster"
    }
  ]
};