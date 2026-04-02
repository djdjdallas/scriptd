"use client";

import * as Sentry from "@sentry/nextjs";
import NextError from "next/error";
import { useEffect } from "react";
import posthog from "posthog-js";

export default function GlobalError({ error }) {
  useEffect(() => {
    // Send error to Sentry
    Sentry.captureException(error);

    // Send error to PostHog with full exception details.
    // captureException automatically extracts type, message, and stack trace
    // from Error objects. Pass additional properties for context.
    posthog.captureException(error, {
      $exception_source: 'global_error_boundary',
      $current_url: typeof window !== 'undefined' ? window.location.href : undefined,
    });
  }, [error]);

  return (
    <html>
      <body>
        {/* `NextError` is the default Next.js error page component. Its type
        definition requires a `statusCode` prop. However, since the App Router
        does not expose status codes for errors, we simply pass 0 to render a
        generic error message. */}
        <NextError statusCode={0} />
      </body>
    </html>
  );
}
