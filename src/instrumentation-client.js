// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://cf1dfd9576a20a84a6d7fc253026ae4c@o4510048989872128.ingest.us.sentry.io/4510048990789632",

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Enable logs to be sent to Sentry
  enableLogs: true,
});

// Required for Sentry to instrument Next.js navigations
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
