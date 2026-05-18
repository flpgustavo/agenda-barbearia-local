'use client'

import { useEffect, useRef } from 'react'
import { useTour } from './TourContext'

// --- Constants ---
const STORAGE_KEY_COMPLETED = 'tour_completed'
const STORAGE_KEY_SEEN_AT = 'tour_seen_at'

// --- Helpers ---
function shouldShowTour(): boolean {
  try {
    const completed = localStorage.getItem(STORAGE_KEY_COMPLETED)
    const seenAt = localStorage.getItem(STORAGE_KEY_SEEN_AT)
    return !completed && !seenAt
  } catch {
    return false
  }
}

/**
 * Checks if the user has seen the tour before but didn't complete it.
 */
function hasIncompleteTour(): boolean {
  try {
    const completed = localStorage.getItem(STORAGE_KEY_COMPLETED)
    const seenAt = localStorage.getItem(STORAGE_KEY_SEEN_AT)
    return !completed && !!seenAt
  } catch {
    return false
  }
}

// --- Component ---
export function TourTrigger() {
  const { start, hasSeenTour } = useTour()
  const triggeredRef = useRef(false)

  useEffect(() => {
    // Only trigger once
    if (triggeredRef.current) return
    if (hasSeenTour) return

    if (shouldShowTour()) {
      // First time — start tour automatically
      triggeredRef.current = true
      const timer = setTimeout(() => {
        start(0)
      }, 800) // Small delay to let UI settle

      return () => clearTimeout(timer)
    }

    if (hasIncompleteTour()) {
      // User saw the tour before but didn't finish — could offer resume
      // For now, just start from the beginning
      triggeredRef.current = true
      const timer = setTimeout(() => {
        start(0)
      }, 800)

      return () => clearTimeout(timer)
    }
  }, [start, hasSeenTour])

  // This component is invisible — it just triggers the tour
  return null
}
