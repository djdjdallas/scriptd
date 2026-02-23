export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/scripts/',
          '/channels/',
          '/settings/',
          '/billing/',
          '/admin/',
          '/teams/',
          '/onboarding/',
          '/login/',
          '/signup/',
          '/auth/',
        ],
      },
    ],
    sitemap: 'https://genscript.io/sitemap.xml',
  };
}
