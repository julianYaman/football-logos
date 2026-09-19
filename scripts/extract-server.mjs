#!/usr/bin/env node
import http from "node:http";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { extractLogos } from "./catalog-parse.mjs";
import { EXTRA_COUNTRIES } from "./country-overrides.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const EXTRACT_DIR = join(ROOT, "scripts/.extract");
const PORT = Number(process.env.EXTRACT_PORT ?? 3847);

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, OPTIONS",
  "access-control-allow-headers": "content-type",
};

function send(res, status, body, extraHeaders = {}) {
  const json = JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(json),
    ...CORS,
    ...extraHeaders,
  });
  res.end(json);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

async function listSlugs() {
  try {
    const names = await readdir(EXTRACT_DIR);
    return names
      .filter((name) => name.endsWith(".json"))
      .map((name) => name.slice(0, -".json".length))
      .sort();
  } catch {
    return [];
  }
}

async function targetSlugs() {
  const directory = JSON.parse(
    await readFile(join(ROOT, "scripts/country-directory.json"), "utf8"),
  );
  return [...new Set([...directory.map((row) => row[0]), ...EXTRA_COUNTRIES.map((c) => c.slug)])];
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "OPTIONS") {
      res.writeHead(204, CORS);
      res.end();
      return;
    }
    const url = new URL(req.url ?? "/", `http://127.0.0.1:${PORT}`);
    if (req.method === "GET" && url.pathname === "/status") {
      const [done, targets] = await Promise.all([listSlugs(), targetSlugs()]);
      const remaining = targets.filter((slug) => !done.includes(slug));
      send(res, 200, {
        count: done.length,
        total: targets.length,
        remaining,
        slugs: done,
      });
      return;
    }
    if (req.method === "POST" && url.pathname === "/extract") {
      const payload = JSON.parse((await readBody(req)).toString("utf8"));
      const slug = String(payload?.slug ?? "").trim();
      const html = String(payload?.html ?? "");
      if (!slug || !html) {
        send(res, 400, { error: "slug and html are required" });
        return;
      }
      const logos = extractLogos(html, slug);
      await mkdir(EXTRACT_DIR, { recursive: true });
      await writeFile(
        join(EXTRACT_DIR, `${slug}.json`),
        `${JSON.stringify({ slug, logos }, null, 2)}\n`,
      );
      send(res, 200, { slug, logoCount: logos.length });
      return;
    }
    send(res, 404, { error: "not found" });
  } catch (error) {
    send(res, 500, { error: error instanceof Error ? error.message : String(error) });
  }
});

await mkdir(EXTRACT_DIR, { recursive: true });
server.listen(PORT, "127.0.0.1", () => {
  console.log(`extract server on http://127.0.0.1:${PORT}`);
});
