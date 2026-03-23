const fs = require("node:fs");
const path = require("node:path");

const distEntry = path.join(__dirname, "dist", "server.js");
const srcEntry = path.join(__dirname, "src", "server.ts");

const shouldUseDist =
  process.env.USE_DIST === "1" || process.env.NODE_ENV === "production";

if (shouldUseDist && fs.existsSync(distEntry)) {
  const mod = require(distEntry);
  if (mod && typeof mod.startServer === "function") {
    mod.startServer();
  }
} else {
  require("tsx/cjs");
  const mod = require(srcEntry);
  if (mod && typeof mod.startServer === "function") {
    mod.startServer();
  }
}
