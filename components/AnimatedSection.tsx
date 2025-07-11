"use client"

import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import type { ReactNode } from "react"

interface AnimatedSectionProps {
  children: ReactNode
  className?: string
  animation?: "fadeUp" | "fadeLeft" | "fadeRight" | "scale" | "fadeIn"
  delay?: number
}

export function AnimatedSection({ children, className = "", animation = "fadeUp", delay = 0 }: AnimatedSectionProps) {
  const { ref, isVisible } = useScrollAnimation()

  const getAnimationClasses = () => {
    const baseClasses = "transition-all duration-1000 ease-out"

    if (!isVisible) {
      switch (animation) {
        case "fadeUp":
          return `${baseClasses} opacity-0 translate-y-20`
        case "fadeLeft":
          return `${baseClasses} opacity-0 -translate-x-20`
        case "fadeRight":
          return `${baseClasses} opacity-0 translate-x-20`
        case "scale":
          return `${baseClasses} opacity-0 scale-95`
        case "fadeIn":
          return `${baseClasses} opacity-0`
        default:
          return `${baseClasses} opacity-0 translate-y-20`
      }
    }

    return `${baseClasses} opacity-100 translate-y-0 translate-x-0 scale-100`
  }

  return (
    <div ref={ref} className={`${getAnimationClasses()} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}
