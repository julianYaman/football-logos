import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FootballLogo } from "./FootballLogo.js";

describe("FootballLogo (React)", () => {
  it("renders a hashed PNG for a known club", () => {
    const html = renderToStaticMarkup(
      <FootballLogo country="germany" club="bayern-munchen" size={48} />,
    );
    expect(html).toContain(
      "https://assets.football-logos.cc/logos/germany/512x512/bayern-munchen.",
    );
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('width="48"');
  });

  it("renders a placeholder when the lookup fails", () => {
    const html = renderToStaticMarkup(
      <FootballLogo country="not-a-country" />,
    );
    expect(html).toContain('role="img"');
    expect(html).not.toContain("<img");
  });

  it("renders nothing when fallback is null", () => {
    const html = renderToStaticMarkup(
      <FootballLogo country="not-a-country" fallback={null} />,
    );
    expect(html).toBe("");
  });
});
