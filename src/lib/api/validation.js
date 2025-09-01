import { z } from 'zod'

export const betaSignupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  company: z.string().optional(),
  useCase: z.string().min(10, 'Please describe your use case in at least 10 characters'),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions',
  }),
})

export const validateRequest = (schema) => {
  return async (request) => {
    try {
      const body = await request.json()
      const validated = schema.parse(body)
      return { success: true, data: validated }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: {
            message: 'Validation failed',
            errors: error.errors,
          },
        }
      }
      return {
        success: false,
        error: {
          message: 'Invalid request data',
        },
      }
    }
  }
}