import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SiteHeader } from "./site-header";

describe("SiteHeader", () => {
  it("renders brand and badges", () => {
    render(<SiteHeader />);
    expect(screen.getByText("PawPass")).toBeInTheDocument();
    expect(screen.getByText("Warm & trusted")).toBeInTheDocument();
    expect(screen.getByText("Info")).toBeInTheDocument();
  });
});
