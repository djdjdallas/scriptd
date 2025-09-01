import { SignupForm } from '@/components/auth/signup-form'
import Link from 'next/link'

export const metadata = {
  title: 'Sign Up - GenScript',
  description: 'Create your GenScript account',
}

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              GenScript
            </h1>
          </Link>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            AI-powered YouTube script generation
          </p>
        </div>
        <SignupForm />
      </div>
    </div>
  )
}