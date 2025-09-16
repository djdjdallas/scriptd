export const PLATFORMS = {
  YOUTUBE: { name: 'YouTube', color: '#FF0000', icon: 'youtube' },
  INSTAGRAM: { name: 'Instagram', color: '#E4405F', icon: 'instagram' },
  TIKTOK: { name: 'TikTok', color: '#000000', icon: 'music' },
  TWITTER: { name: 'X (Twitter)', color: '#1DA1F2', icon: 'twitter' },
  LINKEDIN: { name: 'LinkedIn', color: '#0A66C2', icon: 'linkedin' },
  FACEBOOK: { name: 'Facebook', color: '#1877F2', icon: 'facebook' },
  BLOG: { name: 'Blog', color: '#6B46C1', icon: 'file-text' },
  EMAIL: { name: 'Email', color: '#EA4335', icon: 'mail' },
  PODCAST: { name: 'Podcast', color: '#8B5CF6', icon: 'mic' }
};

export const CONTENT_TYPES = {
  VIDEO: 'Video',
  POST: 'Post',
  STORY: 'Story',
  REEL: 'Reel',
  SHORT: 'Short',
  ARTICLE: 'Article',
  NEWSLETTER: 'Newsletter',
  EPISODE: 'Episode',
  THREAD: 'Thread',
  CAROUSEL: 'Carousel'
};

export const CONTENT_STATUS = {
  IDEA: { name: 'Idea', color: '#94A3B8' },
  IN_PROGRESS: { name: 'In Progress', color: '#F59E0B' },
  READY: { name: 'Ready', color: '#3B82F6' },
  SCHEDULED: { name: 'Scheduled', color: '#8B5CF6' },
  PUBLISHED: { name: 'Published', color: '#10B981' },
  ARCHIVED: { name: 'Archived', color: '#6B7280' }
};

export const BEST_POSTING_TIMES = {
  YOUTUBE: ['9:00 AM', '12:00 PM', '3:00 PM', '6:00 PM'],
  INSTAGRAM: ['7:00 AM', '12:00 PM', '5:00 PM', '7:00 PM'],
  TIKTOK: ['6:00 AM', '9:00 AM', '7:00 PM', '10:00 PM'],
  TWITTER: ['8:00 AM', '12:00 PM', '5:00 PM', '6:00 PM'],
  LINKEDIN: ['7:30 AM', '12:00 PM', '5:30 PM'],
  FACEBOOK: ['9:00 AM', '3:00 PM', '7:00 PM'],
  BLOG: ['10:00 AM', '2:00 PM'],
  EMAIL: ['10:00 AM', '2:00 PM', '8:00 PM'],
  PODCAST: ['5:00 AM', '7:00 AM', '1:00 PM']
};

export const CONTENT_TEMPLATES = [
  {
    name: 'Weekly Newsletter',
    platform: 'EMAIL',
    type: 'NEWSLETTER',
    recurring: 'weekly',
    template: {
      title: 'Weekly Newsletter - [Week]',
      description: '1. Industry News\n2. Tips & Tricks\n3. Resource of the Week\n4. Community Spotlight',
      tags: ['newsletter', 'weekly'],
      estimatedTime: 120
    }
  },
  {
    name: 'Product Launch Campaign',
    platform: 'MULTIPLE',
    type: 'CAMPAIGN',
    template: {
      title: 'Product Launch - [Product Name]',
      description: 'Launch sequence:\n- Teaser\n- Announcement\n- Features highlight\n- Customer testimonials\n- Limited offer',
      tags: ['launch', 'product', 'campaign'],
      estimatedTime: 480
    }
  },
  {
    name: 'Tutorial Tuesday',
    platform: 'YOUTUBE',
    type: 'VIDEO',
    recurring: 'weekly',
    template: {
      title: 'Tutorial: [Topic]',
      description: '1. Introduction\n2. Prerequisites\n3. Step-by-step guide\n4. Common mistakes\n5. Call to action',
      tags: ['tutorial', 'education'],
      estimatedTime: 240
    }
  }
];