"use client";

import type { Servico } from "@/core/models/Servico";

interface ServiceSelectorRowProps {
  servicos: Servico[];
  servicoId: string | null;
  onSelect: (id: string) => void;
}

export function ServiceSelectorRow({ servicos, servicoId, onSelect }: ServiceSelectorRowProps) {
  if (servicos.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">Nenhum serviço cadastrado.</p>
        <p className="text-xs">Cadastre serviços em Serviços para ver a disponibilidade.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex gap-2 min-w-max">
        {servicos.map((servico) => (
          <button
            key={servico.id}
            onClick={() => onSelect(servico.id!)}
            className={`
              shrink-0 px-4 py-2 rounded-lg border text-sm font-medium transition-colors
              ${servicoId === servico.id
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-card-foreground border-border hover:bg-accent"
              }
            `}
          >
            <span>{servico.nome}</span>
            {servico.preco != null && (
              <span className="ml-2 text-xs opacity-70">
                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(servico.preco)}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
