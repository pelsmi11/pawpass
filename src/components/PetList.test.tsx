import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { createIntlWrapper } from "@/test/render-with-intl";
import { PetList } from "./PetList";

vi.mock("sonner", () => ({
  Toaster: () => null,
  toast: { error: vi.fn() },
}));

const createWrapper = (locale: "en" | "es" = "es") => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const IntlWrapper = createIntlWrapper(locale);
  const IntlQueryWrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <IntlWrapper>
        <QueryClientProvider client={qc}>{children}</QueryClientProvider>
      </IntlWrapper>
    );
  };
  return IntlQueryWrapper;
};

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
    vi.clearAllMocks();
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

  it("shows loading, empty and error states in English", async () => {
    let resolveRequest: ((value: Response) => void) | undefined;
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(
        () =>
          new Promise<Response>((resolve) => {
            resolveRequest = resolve;
          }),
      ),
    );

    const loading = render(<PetList />, { wrapper: createWrapper("en") });
    expect(screen.getByText("Registered pets")).toBeInTheDocument();
    expect(document.querySelector('[aria-busy="true"]')).toBeInTheDocument();

    resolveRequest?.({
      ok: true,
      json: () => Promise.resolve({ ok: true, pets: [] }),
    } as Response);
    await waitFor(() =>
      expect(screen.getByText(/No pets have been registered yet/i)).toBeInTheDocument(),
    );
    loading.unmount();

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ ok: false, errorCode: "PETS_LOAD_FAILED" }),
      } as Response),
    );
    render(<PetList />, { wrapper: createWrapper("en") });
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "We couldn't load your pets",
        expect.objectContaining({
          description: "We couldn't load the pets. Try again.",
          id: "pets-load-error",
          action: expect.objectContaining({ label: "Try again" }),
        }),
      ),
    );
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
  });

  it("shows loading and error states in Spanish", async () => {
    vi.stubGlobal("fetch", vi.fn(() => new Promise<Response>(() => {})));
    const loading = render(<PetList />, { wrapper: createWrapper("es") });
    expect(screen.getByText("Mascotas registradas")).toBeInTheDocument();
    expect(document.querySelector('[aria-busy="true"]')).toBeInTheDocument();
    loading.unmount();

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ ok: false, errorCode: "PETS_LOAD_FAILED" }),
      } as Response),
    );
    render(<PetList />, { wrapper: createWrapper("es") });
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "No pudimos cargar tus mascotas",
        expect.objectContaining({
          description: "No pudimos cargar las mascotas. Intenta de nuevo.",
          id: "pets-load-error",
          action: expect.objectContaining({ label: "Reintentar" }),
        }),
      ),
    );
    expect(screen.getByRole("button", { name: "Reintentar" })).toBeInTheDocument();
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

  it("localizes singular age and known pet types in English", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            ok: true,
            pets: [{ ...mockPets[0], age: 1 }],
          }),
      } as Response),
    );

    render(<PetList />, { wrapper: createWrapper("en") });

    await waitFor(() => expect(screen.getByText("Dog")).toBeInTheDocument());
    expect(screen.getByText(/1 year/)).toBeInTheDocument();
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

  it("uses the catalog title for an unknown pet type code", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            ok: true,
            pets: [
              {
                ...mockPets[0],
                petType: { id: "bird-id", code: "BIRD", title: "Ave" },
              },
            ],
          }),
      } as Response),
    );

    render(<PetList />, { wrapper: createWrapper() });

    await waitFor(() => expect(screen.getByText("Ave")).toBeInTheDocument());
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
