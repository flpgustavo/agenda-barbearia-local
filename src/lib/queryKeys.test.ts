import { describe, it, expect } from "vitest";
import { queryKeys } from "./queryKeys";

describe("queryKeys", () => {
  it("defines all required keys as const tuples", () => {
    expect(queryKeys.clientes).toEqual(["clientes"]);
    expect(queryKeys.servicos).toEqual(["servicos"]);
    expect(queryKeys.usuarios).toEqual(["usuarios"]);
    expect(queryKeys.transacoes).toEqual(["transacoes"]);
    expect(queryKeys.agendamentos).toEqual(["agendamentos"]);
    expect(queryKeys.agendamentosDetalhes).toEqual(["agendamentos", "detalhes"]);
  });

  it("agendamentoDetalhe returns correct tuple", () => {
    expect(queryKeys.agendamentoDetalhe("abc")).toEqual(["agendamentos", "detalhe", "abc"]);
  });
});
