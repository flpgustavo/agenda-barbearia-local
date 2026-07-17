import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { InactiveClients } from "./InactiveClients";

const mockVisitas = {
  "cli-1": { nome: "Carlos", ultimaData: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString() },
  "cli-2": { nome: "João", ultimaData: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString() },
  "cli-3": { nome: "Maria", ultimaData: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
};

describe("InactiveClients", () => {
  it("renders title and description", () => {
    render(<InactiveClients ultimaVisitaPorCliente={mockVisitas} loading={false} />);
    expect(screen.getByText("Clientes Inativos")).toBeInTheDocument();
    expect(screen.getByText("Sem visitas há mais de 30 dias")).toBeInTheDocument();
  });

  it("shows skeleton when loading", () => {
    const { container } = render(<InactiveClients ultimaVisitaPorCliente={{}} loading={true} />);
    expect(container.querySelector(".h-40")).toBeTruthy();
  });

  it("shows all clients active message when none exceed threshold", () => {
    const recentVisits = {
      "cli-1": { nome: "Carlos", ultimaData: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
    };
    render(<InactiveClients ultimaVisitaPorCliente={recentVisits} loading={false} />);
    expect(screen.getByText("Todos os clientes visitaram nos últimos 30 dias.")).toBeInTheDocument();
  });

  it("shows no data message when visit map is empty", () => {
    render(<InactiveClients ultimaVisitaPorCliente={{}} loading={false} />);
    expect(screen.getByText("Nenhum dado de cliente disponível.")).toBeInTheDocument();
  });

  it("switches threshold on button click", () => {
    render(<InactiveClients ultimaVisitaPorCliente={mockVisitas} loading={false} />);
    expect(screen.getByText("Carlos")).toBeInTheDocument();
    expect(screen.getByText("João")).toBeInTheDocument();

    fireEvent.click(screen.getByText("60 dias"));
    expect(screen.getByText("Carlos")).toBeInTheDocument();
    expect(screen.queryByText("João")).not.toBeInTheDocument();
  });
});
