import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ReturnFrequencyCard } from "./ReturnFrequencyCard";

const mockBuckets = {
  semanal: 10,
  quinzenal: 5,
  mensal: 3,
  trimestral: 2,
  outros: 1,
};

describe("ReturnFrequencyCard", () => {
  it("renders title and description", () => {
    render(<ReturnFrequencyCard buckets={mockBuckets} mediaDias={15} loading={false} />);
    expect(screen.getByText("Frequência de Retorno")).toBeInTheDocument();
    expect(screen.getByText("Média: 15 dias")).toBeInTheDocument();
  });

  it("renders all 5 bucket labels", () => {
    render(<ReturnFrequencyCard buckets={mockBuckets} mediaDias={15} loading={false} />);
    expect(screen.getByText("Semanal")).toBeInTheDocument();
    expect(screen.getByText("Quinzenal")).toBeInTheDocument();
    expect(screen.getByText("Mensal")).toBeInTheDocument();
    expect(screen.getByText("Trimestral")).toBeInTheDocument();
    expect(screen.getByText("Outros")).toBeInTheDocument();
  });

  it("shows skeleton when loading", () => {
    const { container } = render(<ReturnFrequencyCard buckets={mockBuckets} mediaDias={15} loading={true} />);
    expect(container.querySelector(".h-\\[200px\\]")).toBeTruthy();
  });

  it("shows empty state when all buckets are zero", () => {
    const empty = { semanal: 0, quinzenal: 0, mensal: 0, trimestral: 0, outros: 0 };
    render(<ReturnFrequencyCard buckets={empty} mediaDias={0} loading={false} />);
    expect(screen.getByText("Nenhum dado no período")).toBeInTheDocument();
  });

  it("displays count and percentage per bucket", () => {
    render(<ReturnFrequencyCard buckets={mockBuckets} mediaDias={15} loading={false} />);
    expect(screen.getByText("10 cliente(s) (48%)")).toBeInTheDocument();
    expect(screen.getByText("5 cliente(s) (24%)")).toBeInTheDocument();
  });
});
