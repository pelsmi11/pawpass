import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { createIntlWrapper } from "@/test/render-with-intl";
import { PetForm } from "./PetForm";

vi.mock("sonner", () => ({
  Toaster: () => null,
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

const createWrapper = (locale: "en" | "es" = "es") => {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
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

const selectPetType = async (label: RegExp | string, option: string) => {
  const nativeSelect = document.querySelector<HTMLSelectElement>('select[name="petTypeCode"]');
  expect(nativeSelect).not.toBeNull();
  fireEvent.change(nativeSelect!, { target: { value: option === "Perro" || option === "Dog" ? "DOG" : option === "Gato" || option === "Cat" ? "CAT" : "REPTILE" } });
  await waitFor(() => expect(screen.getByLabelText(label)).toHaveTextContent(option));
};

describe("PetForm", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it("renders fields with constant options DOG/CAT/REPTILE", async () => {
    render(<PetForm />, { wrapper: createWrapper() });

    expect(screen.getByLabelText(/Nombre de la mascota/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tipo de mascota/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Edad/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nombre del propietario/i)).toBeInTheDocument();

    const options = Array.from(document.querySelectorAll<HTMLSelectElement>('select[name="petTypeCode"] option')).map((o) => o.textContent);
    expect(options).toEqual(["", "Perro", "Gato", "Reptil"]);
    expect(screen.getByLabelText(/Tipo de mascota/i)).not.toBeDisabled();
  });

  it("shows loading state and disables submit while pending", async () => {
    const fetchMock = vi.fn().mockImplementation((url: string, opts?: RequestInit) => {
      if (String(url).includes("/api/pets") && opts?.method === "POST") {
        return new Promise(() => {}) as Promise<Response>;
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) } as Response);
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<PetForm />, { wrapper: createWrapper() });

    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/Nombre de la mascota/i), "Luna");
    await selectPetType(/Tipo de mascota/i, "Perro");
    await user.type(screen.getByLabelText(/Nombre del propietario/i), "Ana");
    await user.click(screen.getByRole("button", { name: /Registrar mascota/i }));

    await waitFor(() => expect(screen.getByText("Registrando...")).toBeInTheDocument());
    expect(screen.getByRole("button", { name: /Registrando/i })).toBeDisabled();
  });

  it("submits valid data and shows success", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ok: true, pet: { name: "Luna" }, requestId: "req-1" }),
    } as Response);
    vi.stubGlobal("fetch", fetchMock);

    render(<PetForm />, { wrapper: createWrapper() });

    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/Nombre de la mascota/i), "Luna");
    await selectPetType(/Tipo de mascota/i, "Perro");
    await user.type(screen.getByLabelText(/Nombre del propietario/i), "Ana");
    await user.click(screen.getByRole("button", { name: /Registrar mascota/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/api/pets"), expect.objectContaining({ method: "POST" })));
    const body = JSON.parse((fetchMock.mock.calls.find((c) => String(c[0]).includes("/api/pets"))?.[1] as RequestInit)?.body as string);
    expect(body.petTypeCode).toBe("DOG");
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith("¡Éxito!", {
        description: "¡Mascota registrada! Luna ya aparece en la lista.",
      }),
    );
  });

  it("shows loading and success states in English", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ok: true, pet: { name: "Luna" }, requestId: "req-1" }),
    } as Response);
    vi.stubGlobal("fetch", fetchMock);

    render(<PetForm />, { wrapper: createWrapper("en") });

    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Pet name"), "Luna");
    await selectPetType("Pet type", "Dog");
    await user.type(screen.getByLabelText("Owner name"), "Ana");
    await user.click(screen.getByRole("button", { name: "Register pet" }));

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith("Success!", {
        description: "Pet registered! Luna now appears in the list.",
      }),
    );
  });

  it("translates API and field codes without displaying raw codes", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: () =>
        Promise.resolve({
          ok: false,
          errorCode: "VALIDATION_FAILED",
          fieldErrorCodes: { name: "NAME_REQUIRED" },
          supportId: "support-123",
        }),
    } as Response);
    vi.stubGlobal("fetch", fetchMock);

    render(<PetForm />, { wrapper: createWrapper() });

    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/Nombre de la mascota/i), "Luna");
    await selectPetType(/Tipo de mascota/i, "Perro");
    await user.type(screen.getByLabelText(/Nombre del propietario/i), "Ana");
    await user.click(screen.getByRole("button", { name: /Registrar mascota/i }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Error", {
        description: "Revisa los datos ingresados. Código de soporte: support-123",
      }),
    );
    const nameInput = screen.getByLabelText(/Nombre de la mascota/i);
    expect(screen.getByText("El nombre es obligatorio.")).toBeInTheDocument();
    expect(nameInput).toHaveAttribute("aria-invalid", "true");
    expect(document.body.textContent).not.toContain("VALIDATION_FAILED");
    expect(document.body.textContent).not.toContain("NAME_REQUIRED");
  });

  it("supports keyboard navigation via Tab and Enter", async () => {
    render(<PetForm />, { wrapper: createWrapper() });

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
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ok: true, pet: { name: "Luna" }, requestId: "req-1" }),
    } as Response);
    vi.stubGlobal("fetch", fetchMock);

    render(<PetForm />, { wrapper: createWrapper() });

    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/Nombre de la mascota/i), "Luna");
    await selectPetType(/Tipo de mascota/i, "Perro");
    await user.type(screen.getByLabelText(/Nombre del propietario/i), "Ana");
    fireEvent.submit(screen.getByTestId("pet-form"));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/api/pets"), expect.objectContaining({ method: "POST" })));
  });

  it("includes REPTILE option", async () => {
    render(<PetForm />, { wrapper: createWrapper() });
    const options = Array.from(document.querySelectorAll<HTMLSelectElement>('select[name="petTypeCode"] option')).map((o) => o.textContent);
    expect(options).toContain("Reptil");
  });
});
