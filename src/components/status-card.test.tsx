import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusCard } from "./status-card";

describe("StatusCard", () => {
  it("renders section heading and count badge", () => {
    render(<StatusCard />);
    expect(
      screen.getByRole("heading", { name: "Recent pets" })
    ).toBeInTheDocument();
    expect(screen.getByText("2 registered")).toBeInTheDocument();
  });

  it("renders pet rows with semantic badges", () => {
    render(<StatusCard />);
    expect(screen.getByText("Luna")).toBeInTheDocument();
    expect(screen.getByText("Milo")).toBeInTheDocument();
    expect(screen.getByText("Healthy")).toBeInTheDocument();
    expect(screen.getByText("Due soon")).toBeInTheDocument();
  });

  it("renders enabled labeled search input", () => {
    render(<StatusCard />);
    const input = screen.getByLabelText("Search pets");
    expect(input).toBeEnabled();
  });

  it("renders vaccine reminder alert", () => {
    render(<StatusCard />);
    expect(screen.getByText("Vaccine reminder")).toBeInTheDocument();
    expect(screen.getByText(/rabies booster/i)).toBeInTheDocument();
  });
});
