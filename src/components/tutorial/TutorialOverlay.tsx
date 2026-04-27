'use client';

import { useEffect, useRef, useState } from "react";
import { TutorialStep } from "@/core/models/TutorialStep";
import { Button } from "@/components/ui/button";
import { StepIndicator } from "./StepIndicator";
import { ChevronLeft, ChevronRight, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface TutorialOverlayProps {
    step: TutorialStep;
    isFirst: boolean;
    isLast: boolean;
    onNext: () => void;
    onPrevious: () => void;
    onSkip: () => void;
    onComplete?: () => void;
}

export function TutorialOverlay({
    step,
    isFirst,
    isLast,
    onNext,
    onPrevious,
    onSkip,
    onComplete,
}: TutorialOverlayProps) {
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!step.targetSelector) {
            setTargetRect(null);
            return;
        }

        const updatePosition = () => {
            const element = document.querySelector(step.targetSelector as string);
            if (element) {
                setTargetRect(element.getBoundingClientRect());
            } else {
                setTargetRect(null);
            }
        };

        updatePosition();
        window.addEventListener("resize", updatePosition);
        const observer = new MutationObserver(updatePosition);
        observer.observe(document.body, { childList: true, subtree: true });

        return () => {
            window.removeEventListener("resize", updatePosition);
            observer.disconnect();
        };
    }, [step.targetSelector]);

    const getCardPosition = () => {
        if (!targetRect) return "center";

        switch (step.position) {
            case "top":
                return { bottom: `${window.innerHeight - targetRect.top + 16}px`, left: "50%", transform: "translateX(-50%)" };
            case "bottom":
                return { top: `${targetRect.bottom + 16}px`, left: "50%", transform: "translateX(-50%)" };
            case "left":
                return { top: "50%", right: `${window.innerWidth - targetRect.left + 16}px`, transform: "translateY(-50%)" };
            case "right":
                return { top: "50%", left: `${targetRect.right + 16}px`, transform: "translateY(-50%)" };
            default:
                return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
        }
    };

    const cardStyle = getCardPosition();
    const isCentered = step.position === "center" || !step.targetSelector;

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-50 flex items-center justify-center"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onSkip}
            />

            {/* Highlight Area */}
            {targetRect && (
                <div
                    className="absolute rounded-lg border-2 border-primary bg-primary/10 animate-pulse"
                    style={{
                        top: targetRect.top - 8,
                        left: targetRect.left - 8,
                        width: targetRect.width + 16,
                        height: targetRect.height + 16,
                    }}
                />
            )}

            {/* Card */}
            <div
                className={cn(
                    "absolute z-10 w-full max-w-md rounded-lg border bg-background p-6 shadow-2xl",
                    isCentered && "relative bg-background"
                )}
                style={isCentered ? {} : cardStyle as React.CSSProperties}
            >
                <div className="mb-4 flex items-center justify-between">
                    <StepIndicator currentStep={0} totalSteps={3} />
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onSkip}
                        className="h-8 w-8"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <h2 className="mb-2 text-lg font-semibold">{step.title}</h2>
                <p className="mb-6 text-sm text-muted-foreground">
                    {step.description}
                </p>

                <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                        {!isFirst && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onPrevious}
                            >
                                <ChevronLeft className="mr-1 h-4 w-4" />
                                Anterior
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onSkip}
                        >
                            Pular
                        </Button>
                    </div>

                    {isLast ? (
                        <Button size="sm" onClick={onComplete}>
                            <Check className="mr-2 h-4 w-4" />
                            Concluir Tutorial
                        </Button>
                    ) : (
                        <Button size="sm" onClick={onNext}>
                            {step.actionLabel || "Próximo"}
                            <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}