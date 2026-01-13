export default function sitemap() {
  const baseUrl = 'https://genscript.io';
  const currentDate = new Date().toISOString();

  // Core pages
  const routes = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tools`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ];

  // Tools pages
  const tools = [
    'hook-generator',
    'title-generator',
    'idea-generator',
    'thumbnail-ideas',
    'hashtag-generator',
    'transcript-extraction',
    'retention-optimizer',
    'length-calculator',
    'voice-matching',
    'faceless-youtube-generator',
    'pvss-framework',
    'youtube',
  ];

  tools.forEach(tool => {
    routes.push({
      url: `${baseUrl}/tools/${tool}`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  });

  // Learn pages
  const learnPages = [
    'youtube-script-writing',
    'viral-hooks',
    'youtube-algorithm-2025',
  ];

  learnPages.forEach(page => {
    routes.push({
      url: `${baseUrl}/learn/${page}`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    });
  });

  // Alternative pages
  const alternatives = [
    'vidiq',
    'tubebuddy',
    'jasper-ai',
    'copy-ai',
    'writesonic',
    'chatgpt',
    'invideo-ai',
    'pictory',
    'simplified',
    'subscribr-ai',
  ];

  alternatives.forEach(alt => {
    routes.push({
      url: `${baseUrl}/alternatives/${alt}`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    });
  });

  // For pages (creator types)
  const forPages = [
    'business-educators',
    'developers',
  ];

  forPages.forEach(page => {
    routes.push({
      url: `${baseUrl}/for/${page}`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    });
  });

  // Dynamic creator type + competitor alternative pages
  const creatorTypes = [
    'developers',
    'business-educators',
    'faceless-channels',
    'gaming-creators',
    'lifestyle-vloggers'
  ];

  const competitors = [
    'chatgpt',
    'jasper',
    'writesonic',
    'copy-ai',
    'rytr'
  ];

  creatorTypes.forEach(creatorType => {
    competitors.forEach(competitor => {
      routes.push({
        url: `${baseUrl}/for/${creatorType}/${competitor}-alternative`,
        lastModified: currentDate,
        changeFrequency: 'monthly',
        priority: 0.75,
      });
    });
  });

  // Special pages
  const specialPages = [
    {
      path: '/ai-script-writer-with-fact-checking',
      priority: 0.8,
    },
    {
      path: '/pvss-viral-methodology-generator',
      priority: 0.8,
    },
    {
      path: '/youtube-retention-optimization-tool',
      priority: 0.8,
    },
    {
      path: '/youtube-script-generator-faceless-channels',
      priority: 0.8,
    },
    {
      path: '/beta',
      priority: 0.7,
    },
  ];

  specialPages.forEach(({ path, priority }) => {
    routes.push({
      url: `${baseUrl}${path}`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority,
    });
  });

  // Legal pages
  const legalPages = [
    { path: '/privacy', priority: 0.3 },
    { path: '/terms', priority: 0.3 },
    { path: '/terms-voice-cloning', priority: 0.3 },
  ];

  legalPages.forEach(({ path, priority }) => {
    routes.push({
      url: `${baseUrl}${path}`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority,
    });
  });

  return routes;
}
