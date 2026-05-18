'use client'

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'

// --- Constants ---
const STORAGE_KEY_COMPLETED = 'tour_completed'
const STORAGE_KEY_SEEN_AT = 'tour_seen_at'

// --- Types ---
interface TourContextValue {
  currentStep: number
  isActive: boolean
  totalSteps: number
  next: () => void
  prev: () => void
  skip: () => void
  goTo: (step: number) => void
  start: (step?: number) => void
  reset: () => void
  hasSeenTour: boolean
  setTotalSteps: (total: number) => void
}

const TourContext = createContext<TourContextValue | null>(null)

// --- Constants padrão (serão sobrescritos via setTotalSteps) ---
const DEFAULT_TOTAL_STEPS = 5

// --- Provider Props ---
interface TourProviderProps {
  children: React.ReactNode
  totalSteps?: number
}

// --- Provider ---
export function TourProvider({
  children,
  totalSteps: initialTotalSteps = DEFAULT_TOTAL_STEPS,
}: TourProviderProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [totalSteps, setTotalStepsState] = useState(initialTotalSteps)
  const [hasSeenTour, setHasSeenTour] = useState(false)
  const initializedRef = useRef(false)

  // Check localStorage on mount
  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    try {
      const completed = localStorage.getItem(STORAGE_KEY_COMPLETED)
      const seenAt = localStorage.getItem(STORAGE_KEY_SEEN_AT)
      setHasSeenTour(!!completed || !!seenAt)
    } catch {
      // localStorage not available (SSR)
    }
  }, [])

  // Save progress to localStorage on step change (only when active)
  useEffect(() => {
    if (!isActive) return
    try {
      localStorage.setItem(STORAGE_KEY_SEEN_AT, new Date().toISOString())
    } catch {
      // localStorage not available
    }
  }, [currentStep, isActive])

  const next = useCallback(() => {
    setCurrentStep((prev) => {
      if (prev >= totalSteps - 1) {
        // Last step — complete the tour
        return prev
      }
      return prev + 1
    })
  }, [totalSteps])

  const prev = useCallback(() => {
    setCurrentStep((prev) => {
      if (prev <= 0) return 0
      return prev - 1
    })
  }, [])

  const skip = useCallback(() => {
    setIsActive(false)
    setCurrentStep(0)
    try {
      localStorage.setItem(STORAGE_KEY_COMPLETED, new Date().toISOString())
    } catch {
      // localStorage not available
    }
    setHasSeenTour(true)
  }, [])

  const goTo = useCallback((step: number) => {
    setCurrentStep(step)
  }, [])

  const start = useCallback((step?: number) => {
    setCurrentStep(step ?? 0)
    setIsActive(true)
  }, [])

  const reset = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY_COMPLETED)
      localStorage.removeItem(STORAGE_KEY_SEEN_AT)
    } catch {
      // localStorage not available
    }
    setHasSeenTour(false)
    setCurrentStep(0)
    setIsActive(false)
  }, [])

  const setTotalSteps = useCallback((total: number) => {
    setTotalStepsState(total)
  }, [])

  const value: TourContextValue = {
    currentStep,
    isActive,
    totalSteps,
    next,
    prev,
    skip,
    goTo,
    start,
    reset,
    hasSeenTour,
    setTotalSteps,
  }

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>
}

// --- Hook ---
export function useTour(): TourContextValue {
  const context = useContext(TourContext)
  if (!context) {
    throw new Error('useTour must be used within a TourProvider')
  }
  return context
}
