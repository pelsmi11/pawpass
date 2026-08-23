import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { useDemoLab } from "./useDemoLab";

const createWrapper = () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  // eslint-disable-next-line react/display-name
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
};

describe("useDemoLab", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches status", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ ok: true, demo: { databaseOutage: false, highLatency: false, latencyMs: 6000 } }),
      } as Response),
    );
    const { result } = renderHook(() => useDemoLab(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.status).toBeDefined());
    expect(result.current.status?.databaseOutage).toBe(false);
  });

  it("activates outage with token", async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (String(url).includes("/api/demo/status")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true, demo: { databaseOutage: false } }) } as Response);
      }
      if (String(url).includes("/api/demo/database-outage")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true, demo: { databaseOutage: true } }) } as Response);
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) } as Response);
    });
    vi.stubGlobal("fetch", fetchMock);
    const { result } = renderHook(() => useDemoLab(), { wrapper: createWrapper() });
    await result.current.activateOutage("test-token");
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/api/demo/database-outage"), expect.objectContaining({ headers: expect.objectContaining({ "x-demo-token": "test-token" }) }));
  });

  it("resets lab with token", async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (String(url).includes("/api/demo/status")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true, demo: { databaseOutage: true } }) } as Response);
      }
      if (String(url).includes("/api/demo/reset")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true, demo: { databaseOutage: false } }) } as Response);
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) } as Response);
    });
    vi.stubGlobal("fetch", fetchMock);
    const { result } = renderHook(() => useDemoLab(), { wrapper: createWrapper() });
    await result.current.resetLab("test-token");
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/api/demo/reset"), expect.objectContaining({ headers: expect.objectContaining({ "x-demo-token": "test-token" }) }));
  });
});
