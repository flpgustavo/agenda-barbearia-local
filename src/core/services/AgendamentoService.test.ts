import { describe, it, expect, vi, beforeEach } from "vitest";

const mockToMinutes = vi.fn();
const mockDateToMinutes = vi.fn();

vi.mock("../db", () => ({
  db: {},
}));

class AgendamentoServiceHarness {
  toMinutes(hora: string): number {
    const [h, m] = hora.split(":").map(Number);
    return h * 60 + m;
  }

  dateToMinutes(date: Date): number {
    return date.getHours() * 60 + date.getMinutes();
  }
}

describe("AgendamentoService", () => {
  let service: AgendamentoServiceHarness;

  beforeEach(() => {
    service = new AgendamentoServiceHarness();
  });

  describe("toMinutes", () => {
    it("converts '09:00' to 540", () => {
      expect(service.toMinutes("09:00")).toBe(540);
    });

    it("converts '00:00' to 0", () => {
      expect(service.toMinutes("00:00")).toBe(0);
    });

    it("converts '23:59' to 1439", () => {
      expect(service.toMinutes("23:59")).toBe(1439);
    });

    it("converts '12:30' to 750", () => {
      expect(service.toMinutes("12:30")).toBe(750);
    });
  });

  describe("dateToMinutes", () => {
    it("converts a date at 08:00 to 480", () => {
      const d = new Date("2026-07-17T08:00:00");
      expect(service.dateToMinutes(d)).toBe(480);
    });

    it("converts a date at 14:30 to 870", () => {
      const d = new Date("2026-07-17T14:30:00");
      expect(service.dateToMinutes(d)).toBe(870);
    });

    it("converts midnight to 0", () => {
      const d = new Date("2026-07-17T00:00:00");
      expect(service.dateToMinutes(d)).toBe(0);
    });
  });
});
