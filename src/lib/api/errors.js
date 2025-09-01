export class ApiError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message)
    this.statusCode = statusCode
    this.details = details
    this.name = 'ApiError'
  }
}

export function handleApiError(error) {
  console.error('API Error:', error)

  if (error instanceof ApiError) {
    return Response.json(
      {
        error: error.message,
        details: error.details,
      },
      { status: error.statusCode }
    )
  }

  if (error.name === 'ValidationError') {
    return Response.json(
      {
        error: 'Validation failed',
        details: error.errors,
      },
      { status: 400 }
    )
  }

  return Response.json(
    {
      error: 'Internal server error',
    },
    { status: 500 }
  )
}

export const ApiErrors = {
  BadRequest: (message = 'Bad request', details = null) =>
    new ApiError(message, 400, details),
  Unauthorized: (message = 'Unauthorized', details = null) =>
    new ApiError(message, 401, details),
  Forbidden: (message = 'Forbidden', details = null) =>
    new ApiError(message, 403, details),
  NotFound: (message = 'Not found', details = null) =>
    new ApiError(message, 404, details),
  TooManyRequests: (message = 'Too many requests', details = null) =>
    new ApiError(message, 429, details),
  InternalError: (message = 'Internal server error', details = null) =>
    new ApiError(message, 500, details),
}