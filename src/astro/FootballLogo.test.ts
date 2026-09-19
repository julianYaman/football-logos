import { readFileSync } from "node:fs";
import { transform } from "@astrojs/compiler";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./FootballLogo.astro", import.meta.url), "utf8");

describe("FootballLogo (Astro)", () => {
  it("compiles and uses the public resolver", async () => {
    const result = await transform(source, { filename: "FootballLogo.astro" });
    expect(result.code).toContain("resolveFootballLogo");
    expect(source).toContain("record.url");
    expect(source).toContain("<img");
    expect(source).toContain('role="img"');
  });
});
