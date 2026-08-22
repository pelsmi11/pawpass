import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PawpassHero } from "./pawpass-hero";

describe("PawpassHero", () => {
  it("renders hero title and actions", () => {
    render(<PawpassHero />);
    expect(screen.getByText(/Caring close to your pets/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Register a pet/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /View pets/i })).toBeInTheDocument();
  });

  it("renders semantic badges", () => {
    render(<PawpassHero />);
    expect(screen.getByText("Success")).toBeInTheDocument();
    expect(screen.getByText("Warning")).toBeInTheDocument();
    expect(screen.getByText("Info")).toBeInTheDocument();
    expect(screen.getByText("Error")).toBeInTheDocument();
    expect(screen.getByText("Disabled")).toBeInTheDocument();
  });

  it("renders welcome alert", () => {
    render(<PawpassHero />);
    expect(screen.getByText("Welcome")).toBeInTheDocument();
    expect(screen.getByText(/static placeholder/i)).toBeInTheDocument();
  });
});
