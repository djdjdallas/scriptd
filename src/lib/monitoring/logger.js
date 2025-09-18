import { captureMessage } from './sentry'

const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warning',
  INFO: 'info',
  DEBUG: 'debug',
}

class Logger {
  constructor(context = 'app') {
    this.context = context
    this.isDevelopment = process.env.NODE_ENV === 'development'
  }

  formatMessage(level, message, data = {}) {
    const timestamp = new Date().toISOString()
    return {
      timestamp,
      level,
      context: this.context,
      message,
      ...data,
    }
  }

  error(message, error = null, data = {}) {
    const formatted = this.formatMessage(LOG_LEVELS.ERROR, message, data)
    
    if (error) {
      formatted.error = {
        message: error.message,
        stack: error.stack,
        name: error.name,
      }
    }

    console.error(formatted)
    
    if (process.env.NODE_ENV === 'production') {
      captureMessage(message, 'error', formatted)
    }
    
    return formatted
  }

  warn(message, data = {}) {
    const formatted = this.formatMessage(LOG_LEVELS.WARN, message, data)
    console.warn(formatted)
    
    if (process.env.NODE_ENV === 'production') {
      captureMessage(message, 'warning', formatted)
    }
    
    return formatted
  }

  info(message, data = {}) {
    const formatted = this.formatMessage(LOG_LEVELS.INFO, message, data)
    console.info(formatted)
    
    if (process.env.NODE_ENV === 'production' && data.important) {
      captureMessage(message, 'info', formatted)
    }
    
    return formatted
  }

  debug(message, data = {}) {
    if (this.isDevelopment) {
      const formatted = this.formatMessage(LOG_LEVELS.DEBUG, message, data)
      console.debug(formatted)
      return formatted
    }
  }

  async logApiRequest(request, response, duration) {
    const logData = {
      method: request.method,
      url: request.url,
      status: response.status,
      duration: `${duration}ms`,
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || 'unknown',
    }

    if (response.status >= 500) {
      this.error('API request failed', null, logData)
    } else if (response.status >= 400) {
      this.warn('API request client error', logData)
    } else {
      this.info('API request completed', logData)
    }
  }

  async logDatabaseQuery(query, params, duration, error = null) {
    const logData = {
      query: query.substring(0, 200),
      paramCount: params?.length || 0,
      duration: `${duration}ms`,
    }

    if (error) {
      this.error('Database query failed', error, logData)
    } else if (duration > 1000) {
      this.warn('Slow database query', logData)
    } else {
      this.debug('Database query executed', logData)
    }
  }

  async logTeamActivity(teamId, userId, activityType, details = {}) {
    this.info('Team activity', {
      teamId,
      userId,
      activityType,
      details,
      important: true,
    })
  }

  async logSecurityEvent(eventType, userId, details = {}) {
    this.warn('Security event', {
      eventType,
      userId,
      details,
      important: true,
    })
  }

  async logPaymentEvent(eventType, userId, amount, details = {}) {
    this.info('Payment event', {
      eventType,
      userId,
      amount,
      currency: 'USD',
      details,
      important: true,
    })
  }

  createChildLogger(subContext) {
    return new Logger(`${this.context}:${subContext}`)
  }
}

export const createLogger = (context) => new Logger(context)

export const logger = new Logger('app')

export const apiLogger = new Logger('api')
export const dbLogger = new Logger('database')
export const authLogger = new Logger('auth')
export const paymentLogger = new Logger('payment')
export const teamLogger = new Logger('team')