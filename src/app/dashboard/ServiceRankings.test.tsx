import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ServiceRankings } from "./ServiceRankings";

const mockRankings = {
  porQuantidade: [
    { servicoId: "1", nome: "Corte", quantidade: 20, receita: 800 },
    { servicoId: "2", nome: "Barba", quantidade: 15, receita: 450 },
  ],
  porReceita: [
    { servicoId: "2", nome: "Barba", quantidade: 15, receita: 450 },
    { servicoId: "1", nome: "Corte", quantidade: 20, receita: 800 },
  ],
};

describe("ServiceRankings", () => {
  it("renders title and description", () => {
    render(<ServiceRankings servicosRanking={mockRankings} loading={false} />);
    expect(screen.getByText("Serviços Mais Realizados")).toBeInTheDocument();
  });

  it("shows skeleton when loading", () => {
    const { container } = render(<ServiceRankings servicosRanking={mockRankings} loading={true} />);
    expect(container.querySelector(".h-40")).toBeTruthy();
  });

  it("shows empty state when no data", () => {
    const empty = { porQuantidade: [], porReceita: [] };
    render(<ServiceRankings servicosRanking={empty} loading={false} />);
    expect(screen.getByText("Nenhum serviço realizado no período.")).toBeInTheDocument();
  });

  it("renders service names", () => {
    render(<ServiceRankings servicosRanking={mockRankings} loading={false} />);
    expect(screen.getByText("Corte")).toBeInTheDocument();
    expect(screen.getByText("Barba")).toBeInTheDocument();
  });

  it("renders tab triggers", () => {
    render(<ServiceRankings servicosRanking={mockRankings} loading={false} />);
    expect(screen.getByText("Por Quantidade")).toBeInTheDocument();
    expect(screen.getByText("Por Receita")).toBeInTheDocument();
  });
});
