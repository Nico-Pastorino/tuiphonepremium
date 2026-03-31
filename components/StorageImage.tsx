"use client"

import { useEffect, useState } from "react"
import type { CSSProperties, ImgHTMLAttributes } from "react"

type StorageImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  src: string
  optimizedSrc?: string
  originalSrc?: string
  debugLabel?: string
  fill?: boolean
  priority?: boolean
  quality?: number
  unoptimized?: boolean
}

const DEBUG_IMAGE_URLS = process.env.NEXT_PUBLIC_DEBUG_IMAGE_URLS === "true" || process.env.NODE_ENV !== "production"

export function StorageImage({
  src,
  optimizedSrc,
  originalSrc,
  debugLabel,
  onError,
  fill,
  priority,
  quality,
  unoptimized,
  style,
  className,
  alt,
  loading,
  ...props
}: StorageImageProps) {
  const fallbackChain = [src, optimizedSrc, originalSrc].filter((value, index, array): value is string => {
    return Boolean(value) && array.indexOf(value) === index
  })
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    setCurrentIndex(0)
  }, [src, optimizedSrc, originalSrc])

  const currentSrc = fallbackChain[currentIndex] ?? ""
  const computedStyle: CSSProperties = fill
    ? { position: "absolute", inset: 0, width: "100%", height: "100%", ...(style ?? {}) }
    : (style ?? {})

  return (
    <img
      {...props}
      src={currentSrc}
      alt={alt ?? ""}
      className={className}
      style={computedStyle}
      loading={loading ?? "lazy"}
      onError={(event) => {
        const nextIndex = currentIndex + 1
        if (nextIndex < fallbackChain.length) {
          const nextSrc = fallbackChain[nextIndex]
          if (DEBUG_IMAGE_URLS) {
            console.log(`[storage-image] fallback ${debugLabel ?? alt ?? "image"}`, {
              failed: currentSrc,
              next: nextSrc,
            })
          }
          setCurrentIndex(nextIndex)
        } else if (DEBUG_IMAGE_URLS) {
          console.warn(`[storage-image] all fallbacks failed ${debugLabel ?? alt ?? "image"}`, {
            failed: currentSrc,
          })
        }
        onError?.(event)
      }}
    />
  )
}
