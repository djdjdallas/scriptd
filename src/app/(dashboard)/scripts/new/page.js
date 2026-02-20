'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NewScriptPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new 11-step workflow
    router.push('/scripts/create');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen bg-[#030303]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto"></div>
        <p className="mt-4 text-gray-400">Redirecting to new workflow...</p>
      </div>
    </div>
  );
}