import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithIntl } from "@/test/render-with-intl";
import Page from "./page";

vi.mock("@/components/PetForm", () => ({ PetForm: () => <div>Pet form</div> }));
vi.mock("@/components/PetList", () => ({ PetList: () => <div>Pet list</div> }));

describe("localized page", () => {
  it("renders PawPass in English", () => {
    renderWithIntl(<Page />);
    expect(screen.getByText("PawPass")).toBeInTheDocument();
    expect(screen.getByText(/Caring close to your pets/i)).toBeInTheDocument();
    expect(screen.getByText("Recent pets")).toBeInTheDocument();
  });

  it("renders PawPass in Spanish", () => {
    renderWithIntl(<Page />, "es");
    expect(screen.getByText(/El cuidado de tus mascotas/i)).toBeInTheDocument();
    expect(screen.getByText("Mascotas recientes")).toBeInTheDocument();
  });
});
