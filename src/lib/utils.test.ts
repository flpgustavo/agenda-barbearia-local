import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });

  it("resolves tailwind conflicts (later wins)", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("accepts arrays", () => {
    expect(cn(["p-4", "m-2"])).toBe("p-4 m-2");
  });

  it("filters out falsy values", () => {
    expect(cn("a", null, undefined, false, "b")).toBe("a b");
  });
});
