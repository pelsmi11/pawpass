import { describe, expect, it } from "vitest";
import { formatBadge, getStatusLabel, pluralize } from "./format";

describe("pluralize", () => {
  it("returns singular for count 1", () => {
    expect(pluralize(1, "pet", "pets")).toBe("pet");
  });

  it("returns plural for count 0", () => {
    expect(pluralize(0, "pet", "pets")).toBe("pets");
  });

  it("returns plural for count >1", () => {
    expect(pluralize(5, "pet", "pets")).toBe("pets");
  });
});

describe("formatBadge", () => {
  it("returns label without count", () => {
    expect(formatBadge("healthy")).toBe("healthy");
  });

  it("returns label with count", () => {
    expect(formatBadge("healthy", 3)).toBe("healthy (3)");
  });

  it("handles zero count", () => {
    expect(formatBadge("warning", 0)).toBe("warning (0)");
  });
});

describe("getStatusLabel", () => {
  it("returns Success for success", () => {
    expect(getStatusLabel("success")).toBe("Success");
  });

  it("returns Warning for warning", () => {
    expect(getStatusLabel("warning")).toBe("Warning");
  });

  it("returns Error for error", () => {
    expect(getStatusLabel("error")).toBe("Error");
  });

  it("returns Info for info", () => {
    expect(getStatusLabel("info")).toBe("Info");
  });

  it("returns Unknown for unknown code", () => {
    expect(getStatusLabel("unknown")).toBe("Unknown");
  });
});
