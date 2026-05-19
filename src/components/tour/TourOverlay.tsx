"use client";

import { useId } from "react";

interface TourOverlayProps {
  targetRect: DOMRect | null;
}

export default function TourOverlay({ targetRect }: TourOverlayProps) {
  const id = useId();
  const maskId = `spotlight-${id}`;

  // Sem targetRect: overlay simples sem recorte
  if (!targetRect) {
    return (
      <div className="fixed inset-0 z-49 bg-black/60 pointer-events-none" />
    );
  }

  const padding = 8;
  const x = targetRect.left - padding;
  const y = targetRect.top - padding;
  const w = targetRect.width + padding * 2;
  const h = targetRect.height + padding * 2;

  return (
    <div className="fixed inset-0 z-49 pointer-events-none">
      <svg
        className="w-full h-full"
        style={{ pointerEvents: "none" }}
      >
        <defs>
          <mask id={maskId}>
            {/* Tudo visível (branco = mostra o overlay preto) */}
            <rect width="100%" height="100%" fill="white" />
            {/* Recorte onde o elemento alvo fica visível (preto = esconde overlay) */}
            <rect
              x={x}
              y={y}
              width={w}
              height={h}
              fill="black"
              rx={8}
            />
          </mask>
        </defs>

        {/* Overlay semi-transparente com recorte */}
        <rect
          width="100%"
          height="100%"
          fill="black"
          fillOpacity="0.6"
          mask={`url(#${maskId})`}
        />

        {/* Borda/glow ao redor do recorte */}
        <rect
          x={x}
          y={y}
          width={w}
          height={h}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          rx={8}
          className="opacity-80"
        />
      </svg>
    </div>
  );
}
