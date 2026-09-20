import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("index-catalog", () => {
  it("refuses a full recrawl on GitHub Actions", async () => {
    try {
      await execFileAsync(
        process.execPath,
        [join(ROOT, "scripts/index-catalog.mjs")],
        {
          cwd: ROOT,
          env: { ...process.env, GITHUB_ACTIONS: "true" },
        },
      );
      throw new Error("expected indexer to fail");
    } catch (error) {
      expect(error.code).toBe(1);
      expect(String(error.stderr)).toMatch(/--from-new/);
    }
  });
});
