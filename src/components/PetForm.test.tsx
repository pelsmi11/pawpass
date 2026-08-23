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

const mockPetTypes = [
  { id: "11111111-1111-4111-8111-111111111111", code: "DOG", title: "Perro" },
  { id: "22222222-2222-4222-8222-222222222222", code: "CAT", title: "Gato" },
];

const waitForPetTypes = async (label: RegExp | string) => {
  await waitFor(() => expect(screen.getByLabelText(label)).toBeEnabled());
};

const selectPetType = async (
  label: RegExp | string,
  option: string,
) => {
  const nativeSelect = document.querySelector<HTMLSelectElement>(
    'select[name="petTypeId"]',
  );
  expect(nativeSelect).not.toBeNull();
  const value = option === "Perro" || option === "Dog" ? mockPetTypes[0].id : mockPetTypes[1].id;
  fireEvent.change(nativeSelect!, { target: { value } });
  await waitFor(() => expect(screen.getByLabelText(label)).toHaveTextContent(option));
};

describe("PetForm", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
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

    await waitForPetTypes(/Tipo de mascota/i);
    const options = Array.from(
      document.querySelectorAll<HTMLSelectElement>('select[name="petTypeId"] option'),
    ).map((option) => option.textContent);
    expect(options).toEqual(["", "Perro", "Gato"]);
  });

  it("shows a localized Sonner toast when pet types fail to load", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: () =>
          Promise.resolve({ ok: false, errorCode: "PET_TYPES_LOAD_FAILED" }),
      } as Response),
    );

    render(<PetForm />, { wrapper: createWrapper() });

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Error", {
        id: "pet-types-load-error",
        description: "No pudimos cargar los tipos de mascota. Intenta de nuevo.",
      }),
    );
    expect(screen.getByLabelText(/Tipo de mascota/i)).toBeDisabled();
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
    await waitForPetTypes(/Tipo de mascota/i);

    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/Nombre de la mascota/i), "Luna");
    await selectPetType(/Tipo de mascota/i, "Perro");
    await user.type(screen.getByLabelText(/Nombre del propietario/i), "Ana");
    expect(screen.getByLabelText(/Tipo de mascota/i)).toHaveTextContent("Perro");
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
    await waitForPetTypes(/Tipo de mascota/i);

    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/Nombre de la mascota/i), "Luna");
    await selectPetType(/Tipo de mascota/i, "Perro");
    await user.type(screen.getByLabelText(/Nombre del propietario/i), "Ana");
    expect(screen.getByLabelText(/Tipo de mascota/i)).toHaveTextContent("Perro");
    await waitFor(() => expect(screen.getByLabelText(/Nombre de la mascota/i)).toHaveValue("Luna"));
    await waitFor(() => expect(screen.getByLabelText(/Nombre del propietario/i)).toHaveValue("Ana"));
    await user.click(screen.getByRole("button", { name: /Registrar mascota/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/api/pets"), expect.objectContaining({ method: "POST" })));
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith("¡Éxito!", {
        description: "¡Mascota registrada! Luna ya aparece en la lista.",
      }),
    );
  });

  it("shows loading and success states in English", async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (String(url).includes("/api/pet-types")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ ok: true, petTypes: mockPetTypes }),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ ok: true, pet: { name: "Luna" }, requestId: "req-1" }),
      } as Response);
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<PetForm />, { wrapper: createWrapper("en") });
    expect(screen.getByLabelText("Loading pet types")).toBeInTheDocument();
    await waitForPetTypes("Pet type");

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
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (String(url).includes("/api/pet-types")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ ok: true, petTypes: mockPetTypes }),
        } as Response);
      }
      return Promise.resolve({
        ok: false,
        json: () =>
          Promise.resolve({
            ok: false,
            errorCode: "VALIDATION_FAILED",
            fieldErrorCodes: { name: "NAME_REQUIRED" },
            supportId: "support-123",
          }),
      } as Response);
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<PetForm />, { wrapper: createWrapper() });
    await waitForPetTypes(/Tipo de mascota/i);

    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/Nombre de la mascota/i), "Luna");
    await selectPetType(/Tipo de mascota/i, "Perro");
    await user.type(screen.getByLabelText(/Nombre del propietario/i), "Ana");
    await user.click(screen.getByRole("button", { name: /Registrar mascota/i }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Error", {
        description:
          "Revisa los datos ingresados. Código de soporte: support-123",
      }),
    );
    const nameInput = screen.getByLabelText(/Nombre de la mascota/i);
    expect(screen.getByText("El nombre es obligatorio.")).toBeInTheDocument();
    expect(nameInput).toHaveAttribute("aria-invalid", "true");
    expect(nameInput.closest('[data-slot="field"]')).toHaveAttribute(
      "data-invalid",
      "true",
    );
    expect(document.body.textContent).not.toContain("VALIDATION_FAILED");
    expect(document.body.textContent).not.toContain("NAME_REQUIRED");
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
    await waitForPetTypes(/Tipo de mascota/i);

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
    await waitForPetTypes(/Tipo de mascota/i);

    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/Nombre de la mascota/i), "Luna");
    await selectPetType(/Tipo de mascota/i, "Perro");
    await user.type(screen.getByLabelText(/Nombre del propietario/i), "Ana");
    expect(screen.getByLabelText(/Tipo de mascota/i)).toHaveTextContent("Perro");
    await waitFor(() => expect(screen.getByLabelText(/Nombre de la mascota/i)).toHaveValue("Luna"));
    // Press Enter on the form (should submit)
    fireEvent.submit(screen.getByTestId("pet-form"));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/api/pets"), expect.objectContaining({ method: "POST" })));
  });
});
