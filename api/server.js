const fs = require("node:fs");
const path = require("node:path");

const distEntry = path.join(__dirname, "dist", "server.js");
const srcEntry = path.join(__dirname, "src", "server.ts");

const shouldUseDist =
  process.env.USE_DIST === "1" || process.env.NODE_ENV === "production";

if (shouldUseDist && fs.existsSync(distEntry)) {
  require(distEntry);
} else {
  require("tsx/cjs");
  require(srcEntry);
}
