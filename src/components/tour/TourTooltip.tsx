'use client'

import React, { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// --- Types ---
type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right'

interface TourTooltipProps {
  title: string
  content?: string
  currentStep: number
  totalSteps: number
  onNext?: () => void
  onPrev?: () => void
  onSkip?: () => void
  /** Optional action label for the primary button (default: "Próximo") */
  nextLabel?: string
  /** Optional label when on the last step (default: "Concluir") */
  finishLabel?: string
  /** DOMRect of the target element for positioning */
  targetRect?: DOMRect | null
  /** Preferred placement relative to target */
  placement?: TooltipPlacement
  className?: string
}

// --- Placement calculator ---
function calculatePosition(
  targetRect: DOMRect,
  placement: TooltipPlacement,
  tooltipWidth: number,
  tooltipHeight: number,
  gap: number = 12,
): { top: number; left: number; arrowDirection: TooltipPlacement } {
  const { innerWidth: vw, innerHeight: vh } = window

  const positions: Record<TooltipPlacement, { top: number; left: number; arrowDirection: TooltipPlacement }> = {
    bottom: {
      top: targetRect.bottom + gap,
      left: targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
      arrowDirection: 'bottom',
    },
    top: {
      top: targetRect.top - tooltipHeight - gap,
      left: targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
      arrowDirection: 'top',
    },
    right: {
      top: targetRect.top + targetRect.height / 2 - tooltipHeight / 2,
      left: targetRect.right + gap,
      arrowDirection: 'right',
    },
    left: {
      top: targetRect.top + targetRect.height / 2 - tooltipHeight / 2,
      left: targetRect.left - tooltipWidth - gap,
      arrowDirection: 'left',
    },
  }

  let best = positions[placement]

  // Clamp to viewport boundaries
  best = {
    ...best,
    left: Math.max(gap, Math.min(best.left, vw - tooltipWidth - gap)),
    top: Math.max(gap, Math.min(best.top, vh - tooltipHeight - gap)),
  }

  return best
}

// --- Arrow component ---
function Arrow({ direction, position }: { direction: TooltipPlacement; position: { x: number; y: number } }) {
  const arrowSize = 8

  const arrowStyles: React.CSSProperties = {
    position: 'absolute',
    width: 0,
    height: 0,
    zIndex: -1,
  }

  switch (direction) {
    case 'bottom':
      return (
        <div
          style={{
            ...arrowStyles,
            top: -arrowSize,
            left: position.x,
            borderLeft: `${arrowSize}px solid transparent`,
            borderRight: `${arrowSize}px solid transparent`,
            borderBottom: `${arrowSize}px solid hsl(var(--popover))`,
          }}
        />
      )
    case 'top':
      return (
        <div
          style={{
            ...arrowStyles,
            bottom: -arrowSize,
            left: position.x,
            borderLeft: `${arrowSize}px solid transparent`,
            borderRight: `${arrowSize}px solid transparent`,
            borderTop: `${arrowSize}px solid hsl(var(--popover))`,
          }}
        />
      )
    case 'left':
      return (
        <div
          style={{
            ...arrowStyles,
            right: -arrowSize,
            top: position.y,
            borderTop: `${arrowSize}px solid transparent`,
            borderBottom: `${arrowSize}px solid transparent`,
            borderLeft: `${arrowSize}px solid hsl(var(--popover))`,
          }}
        />
      )
    case 'right':
      return (
        <div
          style={{
            ...arrowStyles,
            left: -arrowSize,
            top: position.y,
            borderTop: `${arrowSize}px solid transparent`,
            borderBottom: `${arrowSize}px solid transparent`,
            borderRight: `${arrowSize}px solid hsl(var(--popover))`,
          }}
        />
      )
  }
}

// --- Component ---
export function TourTooltip({
  title,
  content,
  currentStep,
  totalSteps,
  onNext,
  onPrev,
  onSkip,
  nextLabel,
  finishLabel,
  targetRect,
  placement = 'bottom',
  className,
}: TourTooltipProps) {
  const tooltipRef = React.useRef<HTMLDivElement>(null)
  const [position, setPosition] = React.useState<{ top: number; left: number; arrowDirection: TooltipPlacement } | null>(null)
  const [arrowPos, setArrowPos] = React.useState({ x: 0, y: 0 })
  const [mounted, setMounted] = React.useState(false)

  const isLastStep = currentStep >= totalSteps - 1
  const primaryLabel = isLastStep ? (finishLabel ?? 'Concluir') : (nextLabel ?? 'Próximo')

  // Calculate position after mount
  React.useEffect(() => {
    if (!targetRect || !tooltipRef.current) return

    const tooltip = tooltipRef.current
    const tooltipWidth = tooltip.offsetWidth || 280
    const tooltipHeight = tooltip.offsetHeight || 140

    const pos = calculatePosition(targetRect, placement, tooltipWidth, tooltipHeight)
    setPosition(pos)

    // Calculate arrow position relative to tooltip
    const arrowSize = 8
    setArrowPos({
      x: targetRect.left + targetRect.width / 2 - pos.left - arrowSize,
      y: targetRect.top + targetRect.height / 2 - pos.top - arrowSize,
    })

    setMounted(true)
  }, [targetRect, placement])

  // Show step progress text
  const stepText = useMemo(() => {
    return `${currentStep + 1} / ${totalSteps}`
  }, [currentStep, totalSteps])

  return (
    <div
      ref={tooltipRef}
      className={cn(
        'pointer-events-auto bg-popover text-popover-foreground rounded-xl border p-4 shadow-xl w-[280px]',
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        mounted && 'data-[state=open]:true',
        className,
      )}
      style={
        position
          ? {
              position: 'fixed',
              top: position.top,
              left: position.left,
              zIndex: 10002,
            }
          : {
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              visibility: 'hidden',
            }
      }
      role="dialog"
      aria-label={title}
    >
      {/* Arrow pointing to target */}
      {position && targetRect && (
        <Arrow direction={position.arrowDirection} position={arrowPos} />
      )}

      {/* Step indicator */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground">
          {stepText}
        </span>
        <div className="flex gap-1">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                i === currentStep
                  ? 'w-4 bg-primary'
                  : 'w-1.5 bg-muted-foreground/30',
              )}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <h3 className="text-base font-semibold leading-tight mb-1">{title}</h3>
      {content && (
        <p className="text-sm text-muted-foreground leading-relaxed">{content}</p>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
        <div>
          {currentStep > 0 && onPrev && (
            <Button variant="ghost" size="sm" onClick={onPrev}>
              Anterior
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onSkip && (
            <Button variant="ghost" size="sm" onClick={onSkip} className="text-muted-foreground">
              Pular
            </Button>
          )}

          {onNext && (
            <Button size="sm" onClick={onNext}>
              {primaryLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
