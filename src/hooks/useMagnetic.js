import { useEffect, useRef } from 'react'

export const useMagnetic = (strength = 0.5) => {
  const ref = useRef(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const handleMouseMove = (e) => {
      const rect = element.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      
      const distance = Math.sqrt(
        Math.pow(e.clientX - centerX, 2) + 
        Math.pow(e.clientY - centerY, 2)
      )
      
      const maxDistance = 200
      
      if (distance < maxDistance) {
        const force = (maxDistance - distance) / maxDistance
        const deltaX = ((e.clientX - centerX) * force * strength)
        const deltaY = ((e.clientY - centerY) * force * strength)
        
        element.style.transform = `translate(${deltaX}px, ${deltaY}px)`
      } else {
        element.style.transform = 'translate(0, 0)'
      }
    }

    const handleMouseLeave = () => {
      element.style.transform = 'translate(0, 0)'
    }

    window.addEventListener('mousemove', handleMouseMove)
    element.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      element.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [strength])

  return ref
}