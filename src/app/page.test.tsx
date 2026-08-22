import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Page from "./page";

describe("Page", () => {
  it("renders PawPass placeholders", () => {
    render(<Page />);
    expect(screen.getByText("PawPass")).toBeInTheDocument();
    expect(screen.getByText(/Caring close to your pets/i)).toBeInTheDocument();
    expect(screen.getByText("Recent pets")).toBeInTheDocument();
  });
});
