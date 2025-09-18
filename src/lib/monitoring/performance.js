import { captureMessage } from './sentry'
import { logger } from './logger'

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map()
    this.thresholds = {
      api: 1000,
      database: 500,
      render: 100,
      script_generation: 10000,
      export: 5000,
    }
  }

  startTimer(name, category = 'general') {
    const key = `${category}:${name}`
    this.metrics.set(key, {
      start: performance.now(),
      category,
      name,
    })
    return key
  }

  endTimer(key, metadata = {}) {
    const metric = this.metrics.get(key)
    if (!metric) {
      logger.warn('Timer not found', { key })
      return null
    }

    const end = performance.now()
    const duration = end - metric.start
    const threshold = this.thresholds[metric.category]

    const result = {
      name: metric.name,
      category: metric.category,
      duration,
      metadata,
      slow: threshold && duration > threshold,
    }

    if (result.slow) {
      logger.warn('Slow operation detected', result)
      
      if (process.env.NODE_ENV === 'production') {
        captureMessage(
          `Slow ${metric.category} operation: ${metric.name}`,
          'warning',
          result
        )
      }
    }

    this.metrics.delete(key)
    return result
  }

  async measureAsync(name, category, fn, metadata = {}) {
    const key = this.startTimer(name, category)
    try {
      const result = await fn()
      const timing = this.endTimer(key, metadata)
      return { result, timing }
    } catch (error) {
      const timing = this.endTimer(key, { ...metadata, error: true })
      throw error
    }
  }

  measure(name, category, fn, metadata = {}) {
    const key = this.startTimer(name, category)
    try {
      const result = fn()
      const timing = this.endTimer(key, metadata)
      return { result, timing }
    } catch (error) {
      const timing = this.endTimer(key, { ...metadata, error: true })
      throw error
    }
  }

  reportWebVitals(metric) {
    const thresholds = {
      FCP: 2500,
      LCP: 4000,
      CLS: 0.1,
      FID: 100,
      TTFB: 600,
    }

    const isGood = metric.value <= (thresholds[metric.name] || Infinity)
    
    const data = {
      metric: metric.name,
      value: metric.value,
      rating: metric.rating || (isGood ? 'good' : 'needs-improvement'),
      delta: metric.delta,
      id: metric.id,
    }

    if (!isGood) {
      logger.warn('Poor web vital metric', data)
      
      if (process.env.NODE_ENV === 'production') {
        captureMessage(
          `Poor ${metric.name} performance: ${metric.value}`,
          'warning',
          data
        )
      }
    } else {
      logger.debug('Web vital metric', data)
    }
  }
}

export const performanceMonitor = new PerformanceMonitor()

export function measureApiRoute(handler) {
  return async (req, res) => {
    const { result, timing } = await performanceMonitor.measureAsync(
      req.url,
      'api',
      () => handler(req, res),
      {
        method: req.method,
        userAgent: req.headers['user-agent'],
      }
    )
    
    if (res.setHeader) {
      res.setHeader('X-Response-Time', `${timing.duration}ms`)
    }
    
    return result
  }
}

export function measureDatabaseQuery(query, params) {
  return async (supabaseCall) => {
    const { result, timing } = await performanceMonitor.measureAsync(
      query,
      'database',
      supabaseCall,
      {
        paramCount: params?.length || 0,
      }
    )
    
    return result
  }
}

export function measureScriptGeneration(scriptType) {
  return async (generateFn) => {
    const { result, timing } = await performanceMonitor.measureAsync(
      `generate_${scriptType}`,
      'script_generation',
      generateFn,
      {
        scriptType,
      }
    )
    
    return result
  }
}

export function trackUserAction(action, category, metadata = {}) {
  logger.info('User action', {
    action,
    category,
    ...metadata,
  })
  
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      ...metadata,
    })
  }
}

export function trackConversion(value, currency = 'USD', metadata = {}) {
  logger.info('Conversion tracked', {
    value,
    currency,
    ...metadata,
    important: true,
  })
  
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'conversion', {
      value,
      currency,
      ...metadata,
    })
  }
}