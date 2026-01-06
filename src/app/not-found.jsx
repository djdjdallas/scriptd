import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Search, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-200">404</h1>
          <div className="mt-[-2rem]">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Page not found
            </h2>
            <p className="text-gray-600">
              Sorry, we couldn&apos;t find the page you&apos;re looking for.
              It might have been moved or deleted.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="default" asChild>
            <Link href="/dashboard">
              <Home className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Link>
          </Button>

          <Button variant="outline" asChild>
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">
            Looking for something specific?
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link href="/scripts" className="text-sm text-blue-600 hover:underline">
              My Scripts
            </Link>
            <span className="text-gray-300">|</span>
            <Link href="/channels" className="text-sm text-blue-600 hover:underline">
              Channels
            </Link>
            <span className="text-gray-300">|</span>
            <Link href="/tools" className="text-sm text-blue-600 hover:underline">
              Tools
            </Link>
            <span className="text-gray-300">|</span>
            <Link href="/pricing" className="text-sm text-blue-600 hover:underline">
              Pricing
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
