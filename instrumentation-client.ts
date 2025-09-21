// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://cf1dfd9576a20a84a6d7fc253026ae4c@o4510048989872128.ingest.us.sentry.io/4510048990789632",
  
  // Environment
  environment: process.env.NODE_ENV,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: process.env.NODE_ENV === "development",

  // Session Replay using the simplified configuration
  // Sentry's Next.js SDK auto-configures replay, so we just set the sample rates
  replaysSessionSampleRate: 0.1,  // 10% of all sessions
  replaysOnErrorSampleRate: 1.0,   // 100% of sessions with errors
  
  // Ensure errors are sent immediately
  beforeSend(event) {
    // Log to console in development to verify errors are being captured
    if (process.env.NODE_ENV === "development") {
      console.log("Sentry capturing error:", event.exception);
    }
    return event;
  },
});