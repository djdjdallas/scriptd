import { LoginForm } from '@/components/auth/login-form'
import Link from 'next/link'

export const metadata = {
  title: 'Login - GenScript',
  description: 'Sign in to your GenScript account',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#030303] p-4">
      <div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div
          className="absolute -top-48 -left-48 w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[120px]"
          style={{ transform: "translateZ(0)" }}
        />
        <div
          className="absolute -bottom-48 -right-48 w-[500px] h-[500px] rounded-full bg-cyan-600/10 blur-[120px]"
          style={{ transform: "translateZ(0)" }}
        />
      </div>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center gap-2">
            <span className="w-3 h-3 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500" />
            <span className="font-display text-3xl text-white">GenScript</span>
          </Link>
          <p className="text-gray-400 mt-2">
            AI-powered YouTube script generation
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}