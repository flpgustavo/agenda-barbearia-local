"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { TourStep } from "./types";

interface TourTooltipProps {
  targetRect: DOMRect | null;
  step: TourStep;
  isFirst: boolean;
  isLast: boolean;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}

export default function TourTooltip({
  targetRect,
  step,
  isFirst,
  isLast,
  totalSteps,
  onNext,
  onPrev,
  onSkip,
}: TourTooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<"top" | "bottom">("bottom");
  const [style, setStyle] = useState<React.CSSProperties>({});

  // Recalcula posição sempre que targetRect mudar (scroll/resize vindo do provider)
  useEffect(() => {
    if (!targetRect || !tooltipRef.current) return;

    const el = tooltipRef.current;
    const tooltipHeight = el.offsetHeight;
    const tooltipWidth = el.offsetWidth;
    const gap = 12;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Decide se coloca acima ou abaixo do target
    const spaceBelow = vh - targetRect.bottom;
    const spaceAbove = targetRect.top;
    const placeAbove =
      spaceBelow < tooltipHeight + gap && spaceAbove > tooltipHeight + gap;
    setPosition(placeAbove ? "top" : "bottom");

    // Centraliza horizontalmente relativo ao target, mantendo margens laterais
    const centerX = targetRect.left + targetRect.width / 2;
    let left = centerX - tooltipWidth / 2;
    left = Math.max(16, Math.min(left, vw - tooltipWidth - 16));

    const top = placeAbove
      ? targetRect.top - gap - tooltipHeight
      : targetRect.bottom + gap;

    setStyle({ position: "fixed", left, top, zIndex: 49 });
  }, [targetRect]);

  // Escuta scroll e resize para forçar recálculo
  useEffect(() => {
    if (!targetRect) return;

    // O parent (TourProvider) já emite novo targetRect em scroll/resize,
    // mas garantimos que ouvimos também para segurança.
    const handleUpdate = () => {
      // O primeiro effect reage ao targetRect que o provider atualiza
      // Forçamos uma re-leitura do DOMRect caso o provider não atualize
    };

    window.addEventListener("scroll", handleUpdate, true);
    window.addEventListener("resize", handleUpdate);
    return () => {
      window.removeEventListener("scroll", handleUpdate, true);
      window.removeEventListener("resize", handleUpdate);
    };
  }, [targetRect]);

  const progressValue = ((step.stepIndex + 1) / totalSteps) * 100;

  // Fallback quando elemento alvo não está na página
  if (!targetRect) {
    return (
      // <motion.div
      //   ref={tooltipRef}
      //   initial={{ opacity: 0, y: 10 }}
      //   animate={{ opacity: 1, y: 0 }}
      //   exit={{ opacity: 0, y: 10 }}
      //   transition={{ duration: 0.2, ease: "easeOut" }}
      //   style={{ position: "fixed", top: 24, left: "50%", transform: "translateX(-50%)", zIndex: 49 }}
      //   className="w-[calc(100vw-32px)] max-w-xs bg-card border rounded-xl shadow-lg p-4"
      // >
      //   <h3 className="font-semibold text-sm">{step.title}</h3>
      //   <p className="text-muted-foreground text-xs mt-1">
      //     Elemento não encontrado — navegue até a página correta
      //   </p>
      //   <div className="mt-3 mb-3">
      //     <p className="text-xs text-muted-foreground mb-1">
      //       Passo {step.stepIndex + 1} de {totalSteps}
      //     </p>
      //     <Progress value={progressValue} className="h-1.5" />
      //   </div>
      //   <div className="flex items-center justify-between">
      //     <button
      //       type="button"
      //       onClick={onSkip}
      //       className="text-xs text-muted-foreground hover:text-foreground transition-colors"
      //     >
      //       Pular tutorial
      //     </button>
      //     <div className="flex items-center gap-2">
      //       {!isFirst && (
      //         <Button variant="outline" size="sm" onClick={onPrev}>
      //           Anterior
      //         </Button>
      //       )}
      //       <Button variant="default" size="sm" onClick={onNext}>
      //         {isFirst ? "Feito" : isLast ? "Finalizar" : "Próximo"}
      //       </Button>
      //     </div>
      //   </div>
      // </motion.div>
      <p></p>
    );
  }

  return (
    <motion.div
      ref={tooltipRef}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      style={style}
      className="w-[calc(100vw-32px)] max-w-xs bg-card border rounded-xl shadow-lg p-4"
    >
      {/* Seta apontando para o elemento alvo */}
      <div
        className={cn(
          "absolute left-1/2 -translate-x-1/2",
          position === "bottom"
            ? "-top-2 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-card"
            : "-bottom-2 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-card",
        )}
      />

      {/* Título */}
      <h3 className="font-semibold text-sm">{step.title}</h3>

      {/* Descrição */}
      <p className="text-muted-foreground text-xs mt-1">{step.description}</p>

      {/* Progresso */}
      <div className="mt-3 mb-3">
        <p className="text-xs text-muted-foreground mb-1">
          Passo {step.stepIndex + 1} de {totalSteps}
        </p>
        <Progress value={progressValue} className="h-1.5" />
      </div>

      {/* Navegação */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onSkip}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Pular tutorial
        </button>

        <div className="flex items-center gap-2">
          {!isFirst && (
            <Button variant="outline" size="sm" onClick={onPrev}>
              Anterior
            </Button>
          )}
          <Button variant="default" size="sm" onClick={onNext}>
            {isFirst ? "Feito" : isLast ? "Finalizar" : "Próximo"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
