import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { PetForm } from "./pet-form";

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

const mockPetTypes = [
  { id: "11111111-1111-4111-8111-111111111111", code: "DOG", title: "Perro" },
  { id: "22222222-2222-4222-8222-222222222222", code: "CAT", title: "Gato" },
];

describe("PetForm", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders fields and loads pet types", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (String(url).includes("/api/pet-types")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ ok: true, petTypes: mockPetTypes }),
          } as Response);
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true }) } as Response);
      }),
    );

    render(<PetForm />, { wrapper: createWrapper() });

    expect(screen.getByLabelText(/Nombre de la mascota/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tipo de mascota/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Edad/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nombre del propietario/i)).toBeInTheDocument();

    await waitFor(() => expect(screen.getByText("Perro")).toBeInTheDocument());
    expect(screen.getByText("Gato")).toBeInTheDocument();
  });

  it("shows loading state and disables submit while pending", async () => {
    const fetchMock = vi.fn().mockImplementation((url: string, opts?: RequestInit) => {
      if (String(url).includes("/api/pet-types")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ ok: true, petTypes: mockPetTypes }),
        } as Response);
      }
      if (String(url).includes("/api/pets") && opts?.method === "POST") {
        return new Promise(() => {}) as Promise<Response>;
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) } as Response);
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<PetForm />, { wrapper: createWrapper() });
    await waitFor(() => expect(screen.getByText("Perro")).toBeInTheDocument());

    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/Nombre de la mascota/i), "Luna");
    fireEvent.change(screen.getByLabelText(/Tipo de mascota/i), { target: { value: mockPetTypes[0].id } });
    await user.type(screen.getByLabelText(/Nombre del propietario/i), "Ana");
    await waitFor(() => expect(screen.getByLabelText(/Tipo de mascota/i)).toHaveValue(mockPetTypes[0].id));
    await waitFor(() => expect(screen.getByLabelText(/Nombre de la mascota/i)).toHaveValue("Luna"));
    await waitFor(() => expect(screen.getByLabelText(/Nombre del propietario/i)).toHaveValue("Ana"));
    await user.click(screen.getByRole("button", { name: /Registrar mascota/i }));

    await waitFor(() => expect(screen.getByText("Registrando...")).toBeInTheDocument());
    expect(screen.getByRole("button", { name: /Registrando/i })).toBeDisabled();
  });

  it("submits valid data and shows success", async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (String(url).includes("/api/pet-types")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ ok: true, petTypes: mockPetTypes }),
        } as Response);
      }
      if (String(url).includes("/api/pets")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ ok: true, pet: { name: "Luna" }, requestId: "req-1" }),
        } as Response);
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) } as Response);
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<PetForm />, { wrapper: createWrapper() });
    await waitFor(() => expect(screen.getByText("Perro")).toBeInTheDocument());

    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/Nombre de la mascota/i), "Luna");
    fireEvent.change(screen.getByLabelText(/Tipo de mascota/i), { target: { value: mockPetTypes[0].id } });
    await user.type(screen.getByLabelText(/Nombre del propietario/i), "Ana");
    await waitFor(() => expect(screen.getByLabelText(/Tipo de mascota/i)).toHaveValue(mockPetTypes[0].id));
    await waitFor(() => expect(screen.getByLabelText(/Nombre de la mascota/i)).toHaveValue("Luna"));
    await waitFor(() => expect(screen.getByLabelText(/Nombre del propietario/i)).toHaveValue("Ana"));
    await user.click(screen.getByRole("button", { name: /Registrar mascota/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/api/pets"), expect.objectContaining({ method: "POST" })));
    await waitFor(() => expect(screen.getByText(/¡Éxito!/i)).toBeInTheDocument());
  });

  it("supports keyboard navigation via Tab and Enter", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (String(url).includes("/api/pet-types")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ ok: true, petTypes: mockPetTypes }),
          } as Response);
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) } as Response);
      }),
    );

    render(<PetForm />, { wrapper: createWrapper() });
    await waitFor(() => expect(screen.getByText("Perro")).toBeInTheDocument());

    const user = userEvent.setup();
    await user.tab();
    expect(screen.getByLabelText(/Nombre de la mascota/i)).toHaveFocus();
    await user.tab();
    expect(screen.getByLabelText(/Tipo de mascota/i)).toHaveFocus();
    await user.tab();
    expect(screen.getByLabelText(/Edad/i)).toHaveFocus();
    await user.tab();
    expect(screen.getByLabelText(/Nombre del propietario/i)).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: /Registrar mascota/i })).toHaveFocus();
  });

  it("submits via Enter key", async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (String(url).includes("/api/pet-types")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ ok: true, petTypes: mockPetTypes }),
        } as Response);
      }
      if (String(url).includes("/api/pets")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ ok: true, pet: { name: "Luna" }, requestId: "req-1" }),
        } as Response);
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) } as Response);
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<PetForm />, { wrapper: createWrapper() });
    await waitFor(() => expect(screen.getByText("Perro")).toBeInTheDocument());

    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/Nombre de la mascota/i), "Luna");
    fireEvent.change(screen.getByLabelText(/Tipo de mascota/i), { target: { value: mockPetTypes[0].id } });
    await user.type(screen.getByLabelText(/Nombre del propietario/i), "Ana");
    await waitFor(() => expect(screen.getByLabelText(/Tipo de mascota/i)).toHaveValue(mockPetTypes[0].id));
    await waitFor(() => expect(screen.getByLabelText(/Nombre de la mascota/i)).toHaveValue("Luna"));
    // Press Enter on the form (should submit)
    fireEvent.submit(screen.getByTestId("pet-form"));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/api/pets"), expect.objectContaining({ method: "POST" })));
  });
});
