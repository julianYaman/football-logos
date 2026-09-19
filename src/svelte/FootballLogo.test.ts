/** @vitest-environment jsdom */
import { describe, expect, it } from "vitest";
import FootballLogo from "./FootballLogo.svelte";

describe("FootballLogo (Svelte)", () => {
  it("renders a hashed PNG for a known club", () => {
    const host = document.createElement("div");
    document.body.append(host);
    const app = new FootballLogo({
      target: host,
      props: { country: "germany", club: "bayern-munchen", size: 48 },
    });
    const img = host.querySelector("img");
    expect(img?.getAttribute("src")).toContain(
      "/germany/512x512/bayern-munchen.",
    );
    expect(img?.getAttribute("loading")).toBe("lazy");
    app.$destroy();
    host.remove();
  });

  it("renders a placeholder when the lookup fails", () => {
    const host = document.createElement("div");
    document.body.append(host);
    const app = new FootballLogo({
      target: host,
      props: { country: "not-a-country" },
    });
    expect(host.querySelector("img")).toBeNull();
    expect(host.querySelector("span")?.getAttribute("role")).toBe("img");
    app.$destroy();
    host.remove();
  });
});
