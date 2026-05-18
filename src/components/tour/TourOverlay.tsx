'use client'

import React, { useEffect, useState, useCallback, useRef } from 'react'

// --- Types ---
interface TourOverlayProps {
  targetSelector: string
  padding?: number
  borderRadius?: number
  children?: React.ReactNode
  onPositionCalculated?: (rect: DOMRect | null) => void
}

interface HighlightRect {
  top: number
  left: number
  width: number
  height: number
}

// --- Component ---
export function TourOverlay({
  targetSelector,
  padding = 8,
  borderRadius = 12,
  children,
  onPositionCalculated,
}: TourOverlayProps) {
  const [highlight, setHighlight] = useState<HighlightRect | null>(null)
  const [visible, setVisible] = useState(false)
  const rafRef = useRef<number | null>(null)

  const updatePosition = useCallback(() => {
    const target = document.querySelector(targetSelector) as HTMLElement | null

    if (!target) {
      setHighlight(null)
      onPositionCalculated?.(null)
      return
    }

    const rect = target.getBoundingClientRect()
    const highlightRect: HighlightRect = {
      top: rect.top - padding,
      left: rect.left - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
    }

    setHighlight(highlightRect)
    onPositionCalculated?.(rect)
  }, [targetSelector, padding, onPositionCalculated])

  // Position on mount and on resize/scroll
  useEffect(() => {
    // Initial positioning after a frame (ensures DOM is ready)
    const initTimeout = setTimeout(() => {
      updatePosition()
      setVisible(true)
    }, 100)

    const handleScroll = () => {
      if (rafRef.current !== null) return
      rafRef.current = requestAnimationFrame(() => {
        updatePosition()
        rafRef.current = null
      })
    }

    window.addEventListener('scroll', handleScroll, true)
    window.addEventListener('resize', handleScroll)

    return () => {
      clearTimeout(initTimeout)
      window.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('resize', handleScroll)
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [updatePosition])

  // Also re-check after a small delay to handle dynamic content
  useEffect(() => {
    if (!visible) return
    const interval = setInterval(updatePosition, 500)
    return () => clearInterval(interval)
  }, [visible, updatePosition])

  if (!highlight) return null

  return (
    <>
      {/* Full-screen semi-transparent overlay */}
      <div
        className="fixed inset-0 z-[9998]"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}
        aria-hidden="true"
      />

      {/* Highlight "hole" — renders above the dark overlay */}
      <div
        className="fixed z-[9999] pointer-events-none"
        style={{
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          // Use clip-path to create a "hole" over the target element
          clipPath: `polygon(
            0% 0%,
            100% 0%,
            100% 100%,
            0% 100%,
            0% 0%,
            ${highlight.left}px ${highlight.top}px,
            ${highlight.left}px ${highlight.top + highlight.height}px,
            ${highlight.left + highlight.width}px ${highlight.top + highlight.height}px,
            ${highlight.left + highlight.width}px ${highlight.top}px,
            ${highlight.left}px ${highlight.top}px
          )`,
        }}
      >
        {/* Invisible click-through area — the "hole" is transparent */}
      </div>

      {/* Highlight border ring */}
      <div
        className="fixed z-[10000] pointer-events-none animate-in fade-in zoom-in-95 duration-200"
        style={{
          top: highlight.top,
          left: highlight.left,
          width: highlight.width,
          height: highlight.height,
          borderRadius,
          boxShadow: '0 0 0 4px hsl(var(--primary)), 0 0 24px hsl(var(--primary) / 0.4)',
        }}
        aria-hidden="true"
      />

      {/* Children (tooltip) positioned relative to viewport */}
      {children && (
        <div className="fixed inset-0 z-[10001] pointer-events-none">
          {children}
        </div>
      )}
    </>
  )
}
