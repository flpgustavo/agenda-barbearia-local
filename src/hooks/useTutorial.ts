import { useState, useEffect, useCallback } from "react";
import { TutorialStep, UseTutorialReturn } from "../core/models/TutorialStep";

const STORAGE_KEY = "agenda-tutorial-state";

interface StoredState {
    isActive: boolean;
    currentStepIndex: number;
    isCompleted: boolean;
    lastUpdated: number;
}

const defaultState: StoredState = {
    isActive: false,
    currentStepIndex: 0,
    isCompleted: false,
    lastUpdated: Date.now(),
};

function loadState(): StoredState {
    if (typeof window === "undefined") return defaultState;

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : defaultState;
    } catch {
        return defaultState;
    }
}

export function useTutorial(steps?: TutorialStep[]): UseTutorialReturn {
    const validSteps = steps || [];
    const totalSteps = validSteps.length;

    const [state, setState] = useState<StoredState>(() => loadState());

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (error) {
            console.error("Failed to persist tutorial state:", error);
        }
    }, [state]);

    const start = useCallback(() => {
        setState({
            ...defaultState,
            isActive: true,
            currentStepIndex: 0,
            lastUpdated: Date.now(),
        });
    }, []);

    const skip = useCallback(() => {
        setState((prev) => ({
            ...prev,
            isActive: false,
            lastUpdated: Date.now(),
        }));
    }, []);

    const complete = useCallback(() => {
        setState((prev) => ({
            ...prev,
            isActive: false,
            isCompleted: true,
            lastUpdated: Date.now(),
        }));
    }, []);

    const goToNext = useCallback(() => {
        setState((prev) => {
            if (prev.currentStepIndex >= totalSteps - 1) {
                return { ...prev, isActive: false, isCompleted: true, lastUpdated: Date.now() };
            }
            return {
                ...prev,
                currentStepIndex: prev.currentStepIndex + 1,
                lastUpdated: Date.now(),
            };
        });
    }, [totalSteps]);

    const goToPrevious = useCallback(() => {
        setState((prev) => ({
            ...prev,
            currentStepIndex: Math.max(0, prev.currentStepIndex - 1),
            lastUpdated: Date.now(),
        }));
    }, []);

    const goToStep = useCallback((index: number) => {
        setState((prev) => ({
            ...prev,
            currentStepIndex: Math.max(0, Math.min(index, totalSteps - 1)),
            lastUpdated: Date.now(),
        }));
    }, [totalSteps]);

    return {
        isActive: state.isActive,
        currentStep: state.isActive && validSteps[state.currentStepIndex]
            ? validSteps[state.currentStepIndex]
            : null,
        currentStepIndex: state.currentStepIndex,
        totalSteps,
        goToNext,
        goToPrevious,
        goToStep,
        start,
        skip,
        complete,
    };
}