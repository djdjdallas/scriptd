'use client'

import { useRef, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'

// PERFORMANCE FIX: Throttle function to limit mouse event frequency
function throttle(func, limit) {
  let inThrottle = false;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

export function TiltCard({ children, className, ...props }) {
  const [transformStyle, setTransformStyle] = useState('')
  const [glowStyle, setGlowStyle] = useState({})
  const itemRef = useRef(null)

  // Disable 3D transforms on touch devices to prevent GPU thrashing
  const isTouchDevice = typeof window !== 'undefined' &&
    ('ontouchstart' in window || navigator.maxTouchPoints > 0)

  // PERFORMANCE FIX: Throttled mouse handler to prevent 200+ re-renders/sec
  // Now limited to ~60fps (16ms throttle) instead of 100+ events/sec
  const handleMouseMove = useCallback(
    throttle((e) => {
      if (!itemRef.current) return

      const rect = itemRef.current.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height

      const tiltX = (y - 0.5) * 6
      const tiltY = (x - 0.5) * -6

      setTransformStyle(
        `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.01)`
      )

      setGlowStyle({
        background: `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(147, 51, 234, 0.2), transparent 50%)`,
        opacity: 1
      })
    }, 16), // 16ms = ~60fps
    []
  )

  const handleMouseLeave = () => {
    setTransformStyle('')
    setGlowStyle({ opacity: 0 })
  }

  return (
    <div
      ref={itemRef}
      onMouseMove={isTouchDevice ? undefined : handleMouseMove}
      onMouseLeave={isTouchDevice ? undefined : handleMouseLeave}
      style={{
        transform: isTouchDevice ? undefined : transformStyle,
        transition: isTouchDevice ? undefined : 'transform 0.3s ease-out'
      }}
      className={cn('relative', className)}
      {...props}
    >
      {!isTouchDevice && (
        <div
          className="absolute inset-0 rounded-2xl transition-opacity duration-300"
          style={{
            ...glowStyle,
            transition: 'opacity 0.3s ease-out'
          }}
        />
      )}
      {children}
    </div>
  )
}