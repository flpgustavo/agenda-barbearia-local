import { cn } from "@/lib/utils";

interface StepIndicatorProps {
    currentStep: number;
    totalSteps: number;
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
    return (
        <div className="flex items-center gap-2">
            {Array.from({ length: totalSteps }).map((_, index) => (
                <div key={index} className="flex items-center">
                    <div
                        className={cn(
                            "w-3 h-3 rounded-full border-2 transition-colors",
                            index < currentStep
                                ? "bg-primary border-primary"
                                : index === currentStep
                                ? "bg-primary/50 border-primary"
                                : "bg-muted border-muted-foreground"
                        )}
                    />
                    {index < totalSteps - 1 && (
                        <div
                            className={cn(
                                "w-8 h-0.5 transition-colors",
                                index < currentStep ? "bg-primary" : "bg-muted"
                            )}
                        />
                    )}
                </div>
            ))}
        </div>
    );
}