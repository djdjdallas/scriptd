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

    const tiltX = (y - 0.5) * 20
    const tiltY = (x - 0.5) * -20

    setTransformStyle(
      `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.02)`
    )

    setGlowStyle({
      background: `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(147, 51, 234, 0.3), transparent 50%)`,
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