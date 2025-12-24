import { readFileSync, writeFileSync } from "fs";

try {
  const path = "public/sw.js";
  const src = readFileSync(path, "utf8");
  const match = src.match(/const CACHE_NAME = "vm-static-v(\d+)";/);
  const current = match ? parseInt(match[1], 10) : 0;
  const next = current + 1;
  const out = src.replace(/const CACHE_NAME = "vm-static-v\d+";/, `const CACHE_NAME = "vm-static-v${next}";`);
  writeFileSync(path, out);
  console.log("CACHE_NAME set to", `vm-static-v${next}`);
} catch (err) {
  console.error("Failed to bump SW cache version", err);
  process.exit(1);
}
