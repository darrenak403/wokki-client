#!/usr/bin/env node
/**
 * Writes runtime public env for the browser, then starts Next standalone server.
 * Set NEXT_PUBLIC_* on Dokploy / docker compose — no GitHub Variables required.
 */
const fs = require("fs");
const { spawn } = require("child_process");

const runtime = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:8386",
  appUrl: process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:6789",
  appName: process.env.NEXT_PUBLIC_APP_NAME?.trim() || "Wokki",
  env: process.env.NEXT_PUBLIC_ENV?.trim() || "production",
  cookieDomain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN?.trim() || "",
};

fs.mkdirSync("/app/public", { recursive: true });
fs.writeFileSync(
  "/app/public/__runtime-env.js",
  `window.__WOKKI_RUNTIME__=${JSON.stringify(runtime)};`
);

console.log("[entrypoint] runtime apiUrl:", runtime.apiUrl);

const child = spawn("node", ["server.js"], {
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 1);
});
