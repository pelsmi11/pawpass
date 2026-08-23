import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithIntl } from "@/test/render-with-intl";
import { SiteHeader } from "./SiteHeader";

describe("SiteHeader", () => {
  it("renders brand link and skip link", () => {
    renderWithIntl(<SiteHeader />);
    expect(screen.getByRole("link", { name: /pawpass home/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /skip to content/i })).toBeInTheDocument();
  });

  it("renders main navigation with links", () => {
    renderWithIntl(<SiteHeader />);
    const nav = screen.getByRole("navigation", { name: "Main" });
    expect(nav).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Pets" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Lab" })).toBeInTheDocument();
  });

  it("renders primary CTA", () => {
    renderWithIntl(<SiteHeader />);
    expect(
      screen.getByRole("button", { name: /register a pet/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Language" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Switch to English" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Switch to Spanish" })).toHaveAttribute(
      "href",
      "/es",
    );
  });
});
