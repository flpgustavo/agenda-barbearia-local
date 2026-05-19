"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import type { TourActions, TourContextValue, TourStatus, TourStep } from "./types";
import { TOUR_STEPS } from "./tourSteps";
import TourOverlay from "./TourOverlay";
import TourTooltip from "./TourTooltip";

// ─── Tipos internos ────────────────────────────────────────────────

type TourAction =
  | { type: "START" }
  | { type: "NEXT" }
  | { type: "PREV" }
  | { type: "GO_TO"; index: number }
  | { type: "COMPLETE_STEP"; stepIndex: number }
  | { type: "SKIP" }
  | { type: "SET_STEPS"; steps: TourStep[] }
  | { type: "SET_MOBILE"; isMobile: boolean };

interface TourProviderState {
  status: TourStatus;
  currentStepIndex: number;
  steps: TourStep[];
  isMobile: boolean;
  completedSteps: string[];
}

const initialState: TourProviderState = {
  status: "idle",
  currentStepIndex: 0,
  steps: [],
  isMobile: false,
  completedSteps: [],
};

// ─── Reducer ──────────────────────────────────────────────────────

function tourReducer(
  state: TourProviderState,
  action: TourAction,
): TourProviderState {
  switch (action.type) {
    case "START":
      if (state.steps.length === 0 || !state.isMobile) return state;
      return { ...state, status: "active", currentStepIndex: 0 };

    case "NEXT": {
      if (state.currentStepIndex >= state.steps.length - 1) {
        return { ...state, status: "completed" };
      }
      return { ...state, currentStepIndex: state.currentStepIndex + 1 };
    }

    case "PREV":
      return {
        ...state,
        currentStepIndex: Math.max(0, state.currentStepIndex - 1),
      };

    case "GO_TO": {
      if (action.index < 0 || action.index >= state.steps.length) return state;
      return { ...state, currentStepIndex: action.index };
    }

    case "COMPLETE_STEP": {
      const stepKey = `step-${action.stepIndex}`;
      const completed = state.completedSteps.includes(stepKey)
        ? state.completedSteps
        : [...state.completedSteps, stepKey];
      return { ...state, completedSteps: completed };
    }

    case "SKIP":
      return { ...state, status: "skipped" };

    case "SET_STEPS":
      return { ...state, steps: action.steps };

    case "SET_MOBILE":
      return { ...state, isMobile: action.isMobile };

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────

export const TourContext = createContext<TourContextValue | undefined>(
  undefined,
);

// ─── Provider ─────────────────────────────────────────────────────

export function TourProvider({
  children,
  initialSteps = [],
}: {
  children: React.ReactNode;
  initialSteps?: TourStep[];
}) {
  const [state, dispatch] = useReducer(tourReducer, {
    ...initialState,
    steps: initialSteps,
  });

  const router = useRouter();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentStep = state.steps[state.currentStepIndex];

  // ── Mobile detection (300ms debounce) ────────────────────────────
  useEffect(() => {
    function checkMobile() {
      dispatch({ type: "SET_MOBILE", isMobile: window.innerWidth <= 640 });
    }

    checkMobile();

    let timeoutId: ReturnType<typeof setTimeout>;
    function handleResize() {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkMobile, 300);
    }

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  // ── Carregar steps do TOUR_STEPS no mount ──────────────────────
  useEffect(() => {
    if (TOUR_STEPS.length > 0) {
      dispatch({ type: "SET_STEPS", steps: TOUR_STEPS });
    }
  }, []);

  // ── Auto-navegação entre páginas ─────────────────────────────
  useEffect(() => {
    if (state.status !== "active") return;

    const step = state.steps[state.currentStepIndex];
    if (step && step.pageUrl !== window.location.pathname) {
      router.push(step.pageUrl);
    }
  }, [state.currentStepIndex, state.status, state.steps, router]);

  // ── Atualizar targetRect ────────────────────────────────────────
  const updateTargetRect = useCallback(() => {
    if (state.status !== "active" || !currentStep) {
      setTargetRect(null);
      return;
    }

    const element = document.querySelector(currentStep.targetSelector);
    if (element) {
      setTargetRect(element.getBoundingClientRect());
    } else {
      setTargetRect(null);
    }
  }, [state.status, currentStep]);

  // Recalcular em scroll/resize
  useEffect(() => {
    updateTargetRect();

    if (state.status !== "active") return;

    function handleScrollResize() {
      updateTargetRect();
    }

    window.addEventListener("scroll", handleScrollResize, true);
    window.addEventListener("resize", handleScrollResize);

    return () => {
      window.removeEventListener("scroll", handleScrollResize, true);
      window.removeEventListener("resize", handleScrollResize);
    };
  }, [state.status, currentStep, updateTargetRect]);

  // Polling quando elemento não está no DOM (ex: navegação entre páginas)
  useEffect(() => {
    if (state.status !== "active" || targetRect !== null) {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      return;
    }

    pollRef.current = setInterval(() => {
      updateTargetRect();
    }, 500);

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [state.status, targetRect, updateTargetRect]);

  // ── Actions expostas no context ─────────────────────────────────
  const onEntityCreated = useCallback((stepIndex: number) => {
    dispatch({ type: "COMPLETE_STEP", stepIndex });
    setTimeout(() => dispatch({ type: "NEXT" }), 500);
  }, []);

  const actions: TourActions = {
    startTour: () => dispatch({ type: "START" }),
    nextStep: () => dispatch({ type: "NEXT" }),
    prevStep: () => dispatch({ type: "PREV" }),
    skipTour: () => dispatch({ type: "SKIP" }),
    goToStep: (index: number) => dispatch({ type: "GO_TO", index }),
    completeStep: (stepIndex: number) =>
      dispatch({ type: "COMPLETE_STEP", stepIndex }),
    onEntityCreated,
  };

  const contextValue: TourContextValue = {
    status: state.status,
    currentStepIndex: state.currentStepIndex,
    steps: state.steps,
    isMobile: state.isMobile,
    ...actions,
  };

  const isTourVisible = state.status === "active" && state.isMobile;

  return (
    <TourContext.Provider value={contextValue}>
      {children}

      {isTourVisible && (
        <>
          <TourOverlay targetRect={targetRect} onSkip={actions.skipTour} />
          {currentStep && (
            <TourTooltip
              targetRect={targetRect}
              step={currentStep}
              isFirst={state.currentStepIndex === 0}
              isLast={state.currentStepIndex === state.steps.length - 1}
              totalSteps={state.steps.length}
              onNext={actions.nextStep}
              onPrev={actions.prevStep}
              onSkip={actions.skipTour}
            />
          )}
        </>
      )}
    </TourContext.Provider>
  );
}
