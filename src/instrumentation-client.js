// This file configures the initialization of Sentry and PostHog on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
import posthog from 'posthog-js';

// Initialize Sentry
Sentry.init({
  dsn: "https://cf1dfd9576a20a84a6d7fc253026ae4c@o4510048989872128.ingest.us.sentry.io/4510048990789632",

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  // PERFORMANCE FIX: Reduced from 1.0 to 0.15 to avoid 20-30% throughput loss from telemetry overhead
  tracesSampleRate: process.env.NODE_ENV === 'development' ? 0.01 : 0.15,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // PERFORMANCE FIX: Disabled log sending to reduce overhead
  enableLogs: false,
});

// Initialize PostHog
// IMPORTANT: Never combine this approach with other client-side PostHog initialization approaches,
// especially components like a PostHogProvider. instrumentation-client.js is the correct solution
// for initializing client-side PostHog in Next.js 15.3+ apps.
posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
  api_host: "/ingest",
  ui_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  capture_pageview: 'history_change', // Tracks SPA navigations as pageviews
  autocapture: true, // Captures clicks, form submissions, etc.
  capture_exceptions: true, // Enables capturing unhandled exceptions via Error Tracking
  debug: process.env.NODE_ENV === "development",
  persistence: 'localStorage+cookie', // Ensures user identification persists
});

// Required for Sentry to instrument Next.js navigations
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
