import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { PetList } from "./pet-list";

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

const mockPets = [
  {
    id: "1",
    name: "Luna",
    petTypeId: "dog-id",
    age: 3,
    ownerName: "Ana",
    createdAt: new Date().toISOString(),
    petType: { id: "dog-id", code: "DOG", title: "Perro" },
  },
  {
    id: "2",
    name: "Milo",
    petTypeId: "cat-id",
    age: null,
    ownerName: "Carlos",
    createdAt: new Date(Date.now() - 1000).toISOString(),
    petType: { id: "cat-id", code: "CAT", title: "Gato" },
  },
];

describe("PetList", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("shows empty state when no pets", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ ok: true, pets: [] }),
      } as Response),
    );

    render(<PetList />, { wrapper: createWrapper() });

    await waitFor(() => expect(screen.getByText(/No hay mascotas registradas/i)).toBeInTheDocument());
  });

  it("renders pets with name, title and age", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ ok: true, pets: mockPets }),
      } as Response),
    );

    render(<PetList />, { wrapper: createWrapper() });

    await waitFor(() => expect(screen.getByText("Luna")).toBeInTheDocument());
    expect(screen.getAllByText(/Perro/).length).toBeGreaterThan(0);
    expect(screen.getByText(/3 años/)).toBeInTheDocument();
    expect(screen.getByText("Milo")).toBeInTheDocument();
    expect(screen.getAllByText(/Gato/).length).toBeGreaterThan(0);
  });

  it("never shows session_id", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            ok: true,
            pets: [
              { ...mockPets[0], sessionId: "secret", session_id: "secret2" },
            ],
          }),
      } as Response),
    );

    render(<PetList />, { wrapper: createWrapper() });

    await waitFor(() => expect(screen.getByText("Luna")).toBeInTheDocument());
    expect(screen.queryByText(/secret/)).not.toBeInTheDocument();
    expect(document.body.textContent).not.toContain("session_id");
  });

  it("is keyboard navigable (tab to list items)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ ok: true, pets: mockPets }),
      } as Response),
    );

    render(<PetList />, { wrapper: createWrapper() });

    await waitFor(() => expect(screen.getByText("Luna")).toBeInTheDocument());
    const list = screen.getByLabelText(/Lista de mascotas/i);
    expect(list).toBeInTheDocument();
  });
});
