import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ClientLifecycleCard } from "./ClientLifecycleCard";

const mockDistribuicao = {
  novatosPercent: 25,
  emTestePercent: 25,
  estabelecidosPercent: 25,
  leaisPercent: 25,
};

const mockCounts = {
  novatos: 5,
  emTeste: 5,
  estabelecidos: 5,
  leais: 5,
};

describe("ClientLifecycleCard", () => {
  it("renders title and description", () => {
    render(<ClientLifecycleCard distribuicao={mockDistribuicao} counts={mockCounts} tempoMedioMeses={6} loading={false} />);
    expect(screen.getByText("Ciclo de Vida do Cliente")).toBeInTheDocument();
    expect(screen.getByText("Tempo médio: 6 meses")).toBeInTheDocument();
  });

  it("renders all 4 stage labels", () => {
    render(<ClientLifecycleCard distribuicao={mockDistribuicao} counts={mockCounts} tempoMedioMeses={6} loading={false} />);
    expect(screen.getByText("Novatos (0\u20133 meses)")).toBeInTheDocument();
    expect(screen.getByText("Em Teste (3\u20136 meses)")).toBeInTheDocument();
    expect(screen.getByText("Estabelecidos (6\u201312 meses)")).toBeInTheDocument();
    expect(screen.getByText("Leais (12+ meses)")).toBeInTheDocument();
  });

  it("shows skeleton when loading", () => {
    const { container } = render(<ClientLifecycleCard distribuicao={mockDistribuicao} counts={mockCounts} tempoMedioMeses={6} loading={true} />);
    expect(container.querySelector(".h-\\[200px\\]")).toBeTruthy();
  });

  it("shows empty state when all counts are zero", () => {
    const emptyCounts = { novatos: 0, emTeste: 0, estabelecidos: 0, leais: 0 };
    render(<ClientLifecycleCard distribuicao={mockDistribuicao} counts={emptyCounts} tempoMedioMeses={0} loading={false} />);
    expect(screen.getByText("Nenhum dado no período")).toBeInTheDocument();
  });

  it("displays count and percentage per stage", () => {
    render(<ClientLifecycleCard distribuicao={mockDistribuicao} counts={mockCounts} tempoMedioMeses={6} loading={false} />);
    expect(screen.getAllByText("5 cliente(s) (25%)")).toHaveLength(4);
  });
});
