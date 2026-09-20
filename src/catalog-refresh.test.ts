import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getCatalog,
  startCatalogRefresh,
  stopCatalogRefresh,
} from "./index.js";

function stubCatalogFetch() {
  const hash = getCatalog().contentHash;
  const fetchMock = vi.fn(async (url: string | URL) => {
    const href = String(url);
    if (href.endsWith("/meta.json")) {
      return {
        ok: true,
        json: async () => ({ contentHash: hash, countries: [] }),
      };
    }
    return {
      ok: true,
      json: async () => ({
        country: getCatalog().countries.germany,
      }),
    };
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => {
  stopCatalogRefresh();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("startCatalogRefresh", () => {
  it("loads immediately and again on the interval", async () => {
    vi.useFakeTimers();
    const fetchMock = stubCatalogFetch();

    startCatalogRefresh({ intervalMs: 1_000 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await fetchMock.mock.results[0]?.value;

    await vi.advanceTimersByTimeAsync(1_000);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("defaults to a 24 hour interval", () => {
    const setIntervalSpy = vi.spyOn(globalThis, "setInterval");
    startCatalogRefresh();
    expect(setIntervalSpy).toHaveBeenCalledWith(
      expect.any(Function),
      24 * 60 * 60 * 1000,
    );
    setIntervalSpy.mockRestore();
  });

  it("replaces the previous timer when started again", async () => {
    vi.useFakeTimers();
    const fetchMock = stubCatalogFetch();

    startCatalogRefresh({ intervalMs: 1_000 });
    startCatalogRefresh({ intervalMs: 1_000 });
    expect(fetchMock).toHaveBeenCalledTimes(2);

    await vi.advanceTimersByTimeAsync(1_000);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("stops refreshing after stopCatalogRefresh", async () => {
    vi.useFakeTimers();
    const fetchMock = stubCatalogFetch();

    startCatalogRefresh({ intervalMs: 1_000 });
    stopCatalogRefresh();
    await vi.advanceTimersByTimeAsync(5_000);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("throws when intervalMs is not positive", () => {
    expect(() => startCatalogRefresh({ intervalMs: 0 })).toThrow(RangeError);
    expect(() => startCatalogRefresh({ intervalMs: -1 })).toThrow(RangeError);
  });
});
