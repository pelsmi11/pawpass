import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusCard } from "./status-card";

describe("StatusCard", () => {
  it("renders card title and badge", () => {
    render(<StatusCard />);
    expect(screen.getByText("Recent pets")).toBeInTheDocument();
    expect(screen.getByText("Healthy")).toBeInTheDocument();
  });

  it("renders alert and disabled input", () => {
    render(<StatusCard />);
    expect(screen.getByText("All good")).toBeInTheDocument();
    expect(screen.getByLabelText("Search pets")).toBeInTheDocument();
    expect(screen.getByLabelText("Search pets")).toBeDisabled();
  });
});
