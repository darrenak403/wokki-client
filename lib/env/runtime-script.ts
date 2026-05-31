import type { WokkiRuntimeConfig } from "@/lib/env/runtime-config";

/** Server-only: read container env at request time (Dokploy / docker compose). */
export function readServerRuntimeConfig(): WokkiRuntimeConfig {
  return {
    apiUrl: process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:8386",
    appUrl: process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:6789",
    appName: process.env.NEXT_PUBLIC_APP_NAME?.trim() || "Wokki",
    env: process.env.NEXT_PUBLIC_ENV?.trim() || "production",
    cookieDomain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN?.trim() || "",
  };
}

export function buildRuntimeConfigScript(config: WokkiRuntimeConfig): string {
  return `window.__WOKKI_RUNTIME__=${JSON.stringify(config)};`;
}
