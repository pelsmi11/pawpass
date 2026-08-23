import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PawpassHero } from "./pawpass-hero";

describe("PawpassHero", () => {
  it("renders hero title and actions", () => {
    render(<PawpassHero />);
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
    render(<PawpassHero />);
    expect(screen.getByText("Verified vet records")).toBeInTheDocument();
    expect(screen.getByText("Care reminders")).toBeInTheDocument();
    expect(screen.getByText("Trusted by sitters")).toBeInTheDocument();
  });

  it("renders sample pet profile card", () => {
    render(<PawpassHero />);
    expect(screen.getByText("Luna")).toBeInTheDocument();
    expect(screen.getByText("Healthy")).toBeInTheDocument();
    expect(screen.getByText("Next checkup")).toBeInTheDocument();
  });
});
