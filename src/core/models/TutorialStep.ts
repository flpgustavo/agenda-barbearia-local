export type TutorialTargetType = 'clientes' | 'servicos' | 'agendamentos' | 'dashboard';

export interface TutorialStep {
    id: string;
    targetType: TutorialTargetType;
    targetSelector?: string;
    title: string;
    description: string;
    position: 'top' | 'bottom' | 'left' | 'right';
    actionLabel?: string;
}

export interface TutorialConfig {
    steps: TutorialStep[];
    isCompleted?: boolean;
    currentStepIndex?: number;
}

export interface UseTutorialReturn {
    isActive: boolean;
    currentStep: TutorialStep | null;
    currentStepIndex: number;
    totalSteps: number;
    goToNext: () => void;
    goToPrevious: () => void;
    goToStep: (index: number) => void;
    start: () => void;
    skip: () => void;
    complete: () => void;
}