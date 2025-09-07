'use client'

import { useRef, useState } from 'react'
import { cn } from '@/lib/utils'

export function TiltCard({ children, className, ...props }) {
  const [transformStyle, setTransformStyle] = useState('')
  const [glowStyle, setGlowStyle] = useState({})
  const itemRef = useRef(null)

  const handleMouseMove = (e) => {
    if (!itemRef.current) return

    const rect = itemRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height

    const tiltX = (y - 0.5) * 6  // Reduced from 20 to 6 degrees
    const tiltY = (x - 0.5) * -6  // Reduced from -20 to -6 degrees

    setTransformStyle(
      `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.01)`  // Also reduced scale from 1.02 to 1.01
    )

    setGlowStyle({
      background: `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(147, 51, 234, 0.2), transparent 50%)`,  // Reduced opacity from 0.3 to 0.2
      opacity: 1
    })
  }

  const handleMouseLeave = () => {
    setTransformStyle('')
    setGlowStyle({ opacity: 0 })
  }

  return (
    <div
      ref={itemRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: transformStyle,
        transition: 'transform 0.3s ease-out'
      }}
      className={cn('relative', className)}
      {...props}
    >
      <div
        className="absolute inset-0 rounded-2xl transition-opacity duration-300"
        style={{
          ...glowStyle,
          transition: 'opacity 0.3s ease-out'
        }}
      />
      {children}
    </div>
  )
}