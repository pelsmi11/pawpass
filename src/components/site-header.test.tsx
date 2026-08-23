import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SiteHeader } from "./site-header";

describe("SiteHeader", () => {
  it("renders brand link and skip link", () => {
    render(<SiteHeader />);
    expect(screen.getByRole("link", { name: /pawpass home/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /skip to content/i })).toBeInTheDocument();
  });

  it("renders main navigation with links", () => {
    render(<SiteHeader />);
    const nav = screen.getByRole("navigation", { name: "Main" });
    expect(nav).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Pets" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Reminders" })).toBeInTheDocument();
  });

  it("renders primary CTA", () => {
    render(<SiteHeader />);
    expect(
      screen.getByRole("button", { name: /register a pet/i })
    ).toBeInTheDocument();
  });
});
