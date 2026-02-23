export const homepageMetadata = {
  metadataBase: new URL("https://genscript.io"),
  title: "GenScript — Scale Your Voice | AI YouTube Script Generator",
  description: "Extract your voice DNA and generate YouTube scripts that sound like you. Compliance-checked, retention-optimized, trusted by 500+ creators. Start free.",
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
  "description": "AI-powered YouTube script engine that extracts your voice DNA for compliance-checked, retention-optimized scripts.",
  "featureList": [
    "Voice DNA Extraction",
    "Compliance Engine",
    "Retention Optimizer",
    "One-Click Export",
    "Voice Matching",
    "Team Collaboration"
  ],
  "screenshot": "https://genscript.io/screenshot.png",
  "softwareVersion": "1.0",
  "creator": {
    "@type": "Organization",
    "name": "GenScript",
    "url": "https://genscript.io"
  }
};

export const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How much faster can I create content with GenScript?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Our users report 5x productivity boost on average, with some achieving up to 70% time savings using our AI tools. This allows creators to go from 12 to 34 monthly uploads."
      }
    },
    {
      "@type": "Question",
      "name": "What results can I expect using AI for YouTube scripts?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Creators using GenScript see an average 180% faster channel growth, 35% increase in click-through rates, and significantly improved engagement metrics."
      }
    },
    {
      "@type": "Question",
      "name": "Is GenScript suitable for my niche?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes! GenScript works across all YouTube niches. Our AI learns from your unique voice and style, adapting to any content category from education to entertainment."
      }
    },
    {
      "@type": "Question",
      "name": "How many creators use AI for content creation?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "71.7% of content marketers now use AI for content outlining, with 68% using it for ideation. By late 2025, 58% of mid-sized channels are expected to adopt automation tools."
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
    "telephone": "+1-555-123-4567",
    "contactType": "customer service",
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