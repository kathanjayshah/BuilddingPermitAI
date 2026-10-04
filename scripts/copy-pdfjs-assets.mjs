import { cpSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const srcRoot = join(root, "node_modules", "pdfjs-dist");
const destRoot = join(root, "public", "pdfjs");

const folders = ["wasm", "cmaps", "standard_fonts", "iccs"];

if (!existsSync(join(srcRoot, "wasm"))) {
  console.warn("pdfjs-dist not installed; skip copying PDF.js assets");
  process.exit(0);
}

mkdirSync(destRoot, { recursive: true });
for (const folder of folders) {
  const from = join(srcRoot, folder);
  const to = join(destRoot, folder);
  if (!existsSync(from)) continue;
  rmSync(to, { recursive: true, force: true });
  cpSync(from, to, { recursive: true });
}

console.log("Copied PDF.js assets to public/pdfjs/");
