import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithIntl } from "@/test/render-with-intl";
import { PawpassHero } from "./PawpassHero";

describe("PawpassHero", () => {
  it("renders hero title and actions", () => {
    renderWithIntl(<PawpassHero />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      /caring close to your pets/i
    );
    expect(
      screen.getByRole("button", { name: /Register a pet/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /View pets/i })
    ).toBeInTheDocument();
  });

  it("renders trust points with icons", () => {
    renderWithIntl(<PawpassHero />);
    expect(screen.getByText("Verified vet records")).toBeInTheDocument();
    expect(screen.getByText("Care reminders")).toBeInTheDocument();
    expect(screen.getByText("Trusted by sitters")).toBeInTheDocument();
  });

  it("renders sample pet profile card", () => {
    renderWithIntl(<PawpassHero />);
    expect(screen.getByText("Luna")).toBeInTheDocument();
    expect(screen.getByText("Healthy")).toBeInTheDocument();
    expect(screen.getByText("Next checkup")).toBeInTheDocument();
    expect(screen.getByText(/28\s*kg/)).toBeInTheDocument();
    expect(screen.getByText("Sep 12")).toBeInTheDocument();
  });

  it("renders the Spanish localization", () => {
    renderWithIntl(<PawpassHero />, "es");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "El cuidado de tus mascotas, siempre cerca",
    );
    expect(screen.getByText("Próxima revisión")).toBeInTheDocument();
    expect(screen.getByText(/28\s*kg/)).toBeInTheDocument();
    expect(screen.getByText(/12 sept/i)).toBeInTheDocument();
  });
});
