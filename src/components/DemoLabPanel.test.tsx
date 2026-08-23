import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { createIntlWrapper } from "@/test/render-with-intl";
import { DemoLabPanel } from "./DemoLabPanel";

vi.mock("@/hooks/useDemoLab", () => ({
  useDemoLab: vi.fn(),
}));

import { useDemoLab } from "@/hooks/useDemoLab";

const createWrapper = (locale: "en" | "es" = "en") => {
  const qc = new QueryClient();
  const IntlWrapper = createIntlWrapper(locale);
  // eslint-disable-next-line react/display-name
  return ({ children }: { children: React.ReactNode }) => (
    <IntlWrapper>
      <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    </IntlWrapper>
  );
};

describe("DemoLabPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useDemoLab).mockReturnValue({
      token: "",
      setToken: vi.fn(),
      status: { databaseOutage: false, highLatency: false, latencyMs: 6000, updatedAt: new Date().toISOString() },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
      activateOutage: vi.fn().mockResolvedValue({ ok: true } as never),
      resetLab: vi.fn().mockResolvedValue({ ok: true } as never),
      isActivating: false,
      isResetting: false,
      lastSupportId: null,
    } as never);
  });

  it("renders heading and status", () => {
    render(<DemoLabPanel />, { wrapper: createWrapper("en") });
    expect(screen.getByText("Lab controls")).toBeInTheDocument();
    expect(screen.getByText(/Database outage/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Demo token/i)).toBeInTheDocument();
  });

  it("shows input password and clear", async () => {
    const setToken = vi.fn();
    vi.mocked(useDemoLab).mockReturnValue({
      token: "abc",
      setToken,
      status: { databaseOutage: false, highLatency: false, latencyMs: 6000, updatedAt: "" },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
      activateOutage: vi.fn(),
      resetLab: vi.fn(),
      isActivating: false,
      isResetting: false,
      lastSupportId: null,
    } as never);
    render(<DemoLabPanel />, { wrapper: createWrapper() });
    const input = screen.getByLabelText(/Demo token|Token de demo/i) as HTMLInputElement;
    expect(input.type).toBe("password");
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /Clear|Limpiar/i }));
    expect(setToken).toHaveBeenCalledWith("");
  });

  it("opens confirm dialog before outage and cancels", async () => {
    const activateOutage = vi.fn().mockResolvedValue({});
    vi.mocked(useDemoLab).mockReturnValue({
      token: "tok",
      setToken: vi.fn(),
      status: { databaseOutage: false, highLatency: false, latencyMs: 6000, updatedAt: "" },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
      activateOutage,
      resetLab: vi.fn(),
      isActivating: false,
      isResetting: false,
      lastSupportId: null,
    } as never);
    render(<DemoLabPanel />, { wrapper: createWrapper("en") });
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Activate outage" }));
    // Dialog appears with description
    expect(screen.getByText(/The next registration will fail/i)).toBeInTheDocument();
    expect(activateOutage).not.toHaveBeenCalled();
    // Cancel
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(activateOutage).not.toHaveBeenCalled();
  });

  it("confirms outage via dialog and calls activateOutage", async () => {
    const activateOutage = vi.fn().mockResolvedValue({});
    vi.mocked(useDemoLab).mockReturnValue({
      token: "tok",
      setToken: vi.fn(),
      status: { databaseOutage: false, highLatency: false, latencyMs: 6000, updatedAt: "" },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
      activateOutage,
      resetLab: vi.fn(),
      isActivating: false,
      isResetting: false,
      lastSupportId: null,
    } as never);
    render(<DemoLabPanel />, { wrapper: createWrapper("en") });
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Activate outage" }));
    expect(screen.getByText(/The next registration will fail/i)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Accept" }));
    expect(activateOutage).toHaveBeenCalledWith("tok");
  });

  it("confirms reset via dialog and calls resetLab", async () => {
    const resetLab = vi.fn().mockResolvedValue({});
    vi.mocked(useDemoLab).mockReturnValue({
      token: "tok",
      setToken: vi.fn(),
      status: { databaseOutage: true, highLatency: false, latencyMs: 6000, updatedAt: "" },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
      activateOutage: vi.fn(),
      resetLab,
      isActivating: false,
      isResetting: false,
      lastSupportId: null,
    } as never);
    render(<DemoLabPanel />, { wrapper: createWrapper("en") });
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Reset lab" }));
    expect(screen.getByText(/clear outage state/i)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Accept" }));
    expect(resetLab).toHaveBeenCalledWith("tok");
  });

  it("shows loading and error states", () => {
    vi.mocked(useDemoLab).mockReturnValue({
      token: "",
      setToken: vi.fn(),
      status: undefined,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
      activateOutage: vi.fn(),
      resetLab: vi.fn(),
      isActivating: false,
      isResetting: false,
      lastSupportId: null,
    } as never);
    const { rerender } = render(<DemoLabPanel />, { wrapper: createWrapper() });
    expect(screen.getByText(/Loading status|Cargando estado/i)).toBeInTheDocument();
    vi.mocked(useDemoLab).mockReturnValue({
      token: "",
      setToken: vi.fn(),
      status: undefined,
      isLoading: false,
      isError: true,
      refetch: vi.fn(),
      activateOutage: vi.fn(),
      resetLab: vi.fn(),
      isActivating: false,
      isResetting: false,
      lastSupportId: null,
    } as never);
    rerender(<DemoLabPanel />);
    expect(screen.getByText(/Could not load status|No se pudo cargar/i)).toBeInTheDocument();
  });

  it("shows supportId with copy", async () => {
    vi.mocked(useDemoLab).mockReturnValue({
      token: "tok",
      setToken: vi.fn(),
      status: { databaseOutage: true, highLatency: false, latencyMs: 6000, updatedAt: "" },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
      activateOutage: vi.fn(),
      resetLab: vi.fn(),
      isActivating: false,
      isResetting: false,
      lastSupportId: "support-123",
    } as never);
    render(<DemoLabPanel />, { wrapper: createWrapper() });
    expect(screen.getByText(/support-123/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Copy|Copiar/i })).toBeInTheDocument();
  });
});
