'use client'

import { cn } from '@/lib/utils'

export function StaticCard({ children, className, ...props }) {
  return (
    <div className={cn('relative transition-colors duration-200 hover:bg-white/5', className)} {...props}>
      {children}
    </div>
  )
}
