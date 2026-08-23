import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithIntl } from "@/test/render-with-intl";
import { StatusCard } from "./StatusCard";

describe("StatusCard", () => {
  it("renders section heading and count badge", () => {
    renderWithIntl(<StatusCard />);
    expect(
      screen.getByRole("heading", { name: "Recent pets" })
    ).toBeInTheDocument();
    expect(screen.getByText("2 registered")).toBeInTheDocument();
  });

  it("renders pet rows with semantic badges", () => {
    renderWithIntl(<StatusCard />);
    expect(screen.getByText("Luna")).toBeInTheDocument();
    expect(screen.getByText("Milo")).toBeInTheDocument();
    expect(screen.getByText("Healthy")).toBeInTheDocument();
    expect(screen.getByText("Due soon")).toBeInTheDocument();
  });

  it("renders enabled labeled search input", () => {
    renderWithIntl(<StatusCard />);
    const input = screen.getByLabelText("Search pets");
    expect(input).toBeEnabled();
  });

  it("renders vaccine reminder alert", () => {
    renderWithIntl(<StatusCard />);
    expect(screen.getByText("Vaccine reminder")).toBeInTheDocument();
    expect(screen.getByText(/rabies booster/i)).toBeInTheDocument();
    expect(screen.getByText(/August 30/)).toBeInTheDocument();
  });

  it("localizes counts and dates in Spanish", () => {
    renderWithIntl(<StatusCard />, "es");
    expect(screen.getByText("2 registradas")).toBeInTheDocument();
    expect(screen.getByText(/3 may/i)).toBeInTheDocument();
    expect(screen.getByText(/30 de agosto/i)).toBeInTheDocument();
  });
});
