'use client'

import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useTour } from './TourContext'
import { TourOverlay } from './TourOverlay'
import { TourTooltip } from './TourTooltip'
import { tourSteps } from './tourSteps'

// --- Component ---
export function WelcomeTour() {
  const router = useRouter()
  const pathname = usePathname()

  const {
    currentStep,
    isActive,
    totalSteps,
    next,
    prev,
    skip,
    setTotalSteps,
  } = useTour()

  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const [currentPath, setCurrentPath] = useState(pathname)
  const navigatingRef = useRef(false)
  const autoAdvanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const checkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Set total steps from tourSteps
  useEffect(() => {
    setTotalSteps(tourSteps.length)
  }, [setTotalSteps])

  // Track pathname changes
  useEffect(() => {
    setCurrentPath(pathname)
  }, [pathname])

  // Navigate to the correct page when step changes
  useEffect(() => {
    if (!isActive) return
    if (currentStep < 0 || currentStep >= tourSteps.length) return

    const step = tourSteps[currentStep]
    if (!step) return

    // If we're not on the right page, navigate there
    if (currentPath !== step.pageUrl) {
      navigatingRef.current = true
      router.push(step.pageUrl)
    }
  }, [currentStep, isActive, currentPath, router])

  // Reset navigating flag after pathname catches up
  useEffect(() => {
    if (navigatingRef.current) {
      navigatingRef.current = false
    }
  }, [pathname])

  // Handle position callback from TourOverlay
  const handlePositionCalculated = useCallback((rect: DOMRect | null) => {
    setTargetRect(rect)
  }, [])

  // Handle "next" click — navigate to the next step's page
  const handleNext = useCallback(() => {
    if (currentStep >= tourSteps.length - 1) {
      // Last step — conclude tour
      skip()
      return
    }

    const nextStep = tourSteps[currentStep + 1]
    if (nextStep) {
      // Navigate to the next page, then advance step
      router.push(nextStep.pageUrl)
      // Small delay to let navigation start before advancing step
      setTimeout(() => {
        next()
      }, 100)
    }
  }, [currentStep, next, skip, router])

  // Handle "previous" click — navigate to previous step's page
  const handlePrev = useCallback(() => {
    const prevStep = tourSteps[currentStep - 1]
    if (prevStep) {
      router.push(prevStep.pageUrl)
      setTimeout(() => {
        prev()
      }, 100)
    }
  }, [currentStep, prev, router])

  // Auto-advance: periodically check if the target element exists
  // (indicates the user has navigated to the correct page)
  useEffect(() => {
    if (!isActive) return
    if (currentStep < 0 || currentStep >= tourSteps.length) return

    const step = tourSteps[currentStep]

    // Clear existing intervals
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current)
    }
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current)
    }

    // Only auto-detect if we're on the correct page
    if (currentPath !== step.pageUrl) return

    // Check periodically if the target element is visible
    checkIntervalRef.current = setInterval(() => {
      const target = document.querySelector(step.targetSelector) as HTMLElement | null
      if (target) {
        const rect = target.getBoundingClientRect()
        // Check if element is visible (has dimensions)
        if (rect.width > 0 && rect.height > 0) {
          // Element is visible — tour is ready
          if (checkIntervalRef.current) {
            clearInterval(checkIntervalRef.current)
          }
        }
      }
    }, 300)

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current)
      }
      if (autoAdvanceTimeoutRef.current) {
        clearTimeout(autoAdvanceTimeoutRef.current)
      }
    }
  }, [isActive, currentStep, currentPath, tourSteps])

  // Don't render anything if tour is not active
  if (!isActive) return null

  const step = tourSteps[currentStep]
  if (!step) return null

  // Don't show overlay/tooltip if we're navigating to the correct page
  if (navigatingRef.current) return null

  // Don't show overlay/tooltip until we're on the correct page
  if (currentPath !== step.pageUrl) return null

  return (
    <TourOverlay
      targetSelector={step.targetSelector}
      padding={10}
      borderRadius={14}
      onPositionCalculated={handlePositionCalculated}
    >
      <TourTooltip
        title={step.title}
        content={step.content}
        currentStep={currentStep}
        totalSteps={tourSteps.length}
        onNext={handleNext}
        onPrev={currentStep > 0 ? handlePrev : undefined}
        onSkip={skip}
        targetRect={targetRect}
        placement="bottom"
      />
    </TourOverlay>
  )
}
