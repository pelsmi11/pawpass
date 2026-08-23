import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithIntl } from "@/test/render-with-intl";
import { PawpassHero } from "./PawpassHero";

describe("PawpassHero", () => {
  it("renders hero title and actions", () => {
    renderWithIntl(<PawpassHero />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/caring close to your pets/i);
    expect(screen.getByRole("button", { name: /Register a pet/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /View pets/i })).toBeInTheDocument();
  });

  it("does not render placeholder Luna card", () => {
    renderWithIntl(<PawpassHero />);
    expect(screen.queryByText("Luna")).not.toBeInTheDocument();
    expect(screen.queryByText("Healthy")).not.toBeInTheDocument();
  });

  it("renders the Spanish localization", () => {
    renderWithIntl(<PawpassHero />, "es");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("El cuidado de tus mascotas, siempre cerca");
  });
});
