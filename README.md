# GenScript

AI-powered YouTube script generation platform built with Next.js 15, Supabase, and Stripe.

## Features

- **AI Script Generation** - Generate viral YouTube scripts using Claude, GPT-4, and other AI models
- **Voice Training** - Train AI to match your unique speaking style
- **Channel Analysis** - Analyze YouTube channels to understand content patterns
- **Trending Research** - Track trending topics and create action plans
- **Credit System** - Pay-per-use credits with subscription options
- **Team Collaboration** - Collaborate on scripts with team members (coming soon)

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: Stripe (subscriptions + one-time purchases)
- **AI Providers**: Anthropic (Claude), OpenAI (GPT-4), Groq, Perplexity
- **Analytics**: PostHog
- **Error Monitoring**: Sentry
- **Rate Limiting**: Vercel KV
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Stripe account

### Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_publishable_key
STRIPE_SECRET_KEY=your_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# AI Providers
ANTHROPIC_API_KEY=your_claude_key
OPENAI_API_KEY=your_openai_key
GROQ_API_KEY=your_groq_key
PERPLEXITY_API_KEY=your_perplexity_key

# YouTube
YOUTUBE_API_KEY=your_youtube_key
SUPADATA_API_KEY=your_supadata_key

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# Rate Limiting
KV_REST_API_URL=your_vercel_kv_url
KV_REST_API_TOKEN=your_vercel_kv_token

# Security
CRON_SECRET=your_cron_secret
```

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Database Setup

Apply migrations in `supabase/migrations/` to your Supabase database. For manual migrations, see `supabase/manual_migrations.sql`.

## Project Structure

```
src/
  app/                    # Next.js App Router pages
    (dashboard)/          # Authenticated dashboard pages
    api/                  # API routes
  components/             # React components
  lib/                    # Utilities and services
    ai/                   # AI providers and services
    api/                  # API utilities (rate limiting, validation)
    credits/              # Credit management
    stripe/               # Stripe integration
    supabase/             # Supabase clients
    youtube/              # YouTube API integration
```

## Key Files

| Area | File |
|------|------|
| Pricing/Credits | `src/lib/constants.js` |
| Database Schema | `database-schema.sql` |
| Stripe Webhooks | `src/app/api/webhooks/stripe/route.js` |
| Script Generation | `src/app/api/scripts/generate-enhanced/route.js` |
| Rate Limiting | `src/lib/api/rate-limit.js` |

## Deployment

Deploy on Vercel:

1. Connect your GitHub repository
2. Add environment variables in Vercel dashboard
3. Configure Stripe webhook endpoint: `https://your-domain.com/api/webhooks/stripe`
4. Set up Vercel KV for rate limiting

## License

Private - All rights reserved.
