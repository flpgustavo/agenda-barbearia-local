export interface TourStep {
  stepIndex: number;
  pageUrl: string;
  targetSelector: string;
  title: string;
  description: string;
}

export type TourStatus = 'idle' | 'active' | 'completed' | 'skipped';

export interface TourState {
  status: TourStatus;
  currentStepIndex: number;
  steps: TourStep[];
  isMobile: boolean;
}

export interface TourActions {
  startTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
  goToStep: (index: number) => void;
  completeStep: (stepIndex: number) => void;
  onEntityCreated: (stepIndex: number) => void;
}

export type TourContextValue = TourState & TourActions;
