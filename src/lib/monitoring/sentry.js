import * as Sentry from '@sentry/nextjs'

export function initSentry() {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      debug: process.env.NODE_ENV === 'development',
      replaysOnErrorSampleRate: 1.0,
      replaysSessionSampleRate: 0.1,
      
      tracePropagationTargets: ['localhost', process.env.NEXT_PUBLIC_APP_URL, /^\//],
      
      beforeSend(event, hint) {
        if (event.exception) {
          const error = hint.originalException
          
          if (error && error.message) {
            if (error.message.includes('Non-Error')) {
              return null
            }
            
            if (error.message.includes('ResizeObserver')) {
              return null
            }
          }
        }
        
        if (event.request?.cookies) {
          delete event.request.cookies
        }
        
        return event
      },
    })
  }
}

export function captureException(error, context = {}) {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.captureException(error, {
      extra: context,
      tags: {
        section: context.section || 'unknown',
      },
    })
  }
  
  console.error('Error captured:', error, context)
}

export function captureMessage(message, level = 'info', context = {}) {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.captureMessage(message, level, {
      extra: context,
    })
  }
  
  if (level === 'error' || level === 'warning') {
    console.error(`${level}: ${message}`, context)
  } else {
    console.log(`${level}: ${message}`, context)
  }
}

export function setUser(user) {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.full_name,
    })
  }
}

export function clearUser() {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.setUser(null)
  }
}

export function addBreadcrumb(breadcrumb) {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.addBreadcrumb(breadcrumb)
  }
}

export function withSentry(handler, options = {}) {
  return async (...args) => {
    try {
      return await handler(...args)
    } catch (error) {
      captureException(error, {
        ...options,
        handler: handler.name || 'anonymous',
      })
      throw error
    }
  }
}