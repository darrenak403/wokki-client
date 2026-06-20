/**
 * Public env — server reads process.env at runtime (Dokploy / docker compose).
 * Browser reads window.__WOKKI_RUNTIME__ injected by docker/entrypoint.js before hydration.
 */

import { readBrowserRuntimeConfig } from "@/lib/env/runtime-config";

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

function fromProcess(name: string): string | undefined {
  return process.env[name]?.trim() || undefined;
}

function resolveValue(
  runtimeKey: keyof NonNullable<ReturnType<typeof readBrowserRuntimeConfig>>,
  processKey: string,
  fallback: string
): string {
  const runtime = readBrowserRuntimeConfig();
  const fromRuntime = runtime?.[runtimeKey]?.trim();
  if (fromRuntime) return fromRuntime;

  const fromEnv = fromProcess(processKey);
  if (fromEnv) return fromEnv;

  return fallback;
}

export const publicEnv = {
  get appName(): string {
    return resolveValue("appName", "NEXT_PUBLIC_APP_NAME", "Wokki");
  },
  get appUrl(): string {
    return stripTrailingSlash(
      resolveValue("appUrl", "NEXT_PUBLIC_APP_URL", "http://localhost:6789")
    );
  },
  get apiUrl(): string {
    return stripTrailingSlash(
      resolveValue("apiUrl", "NEXT_PUBLIC_API_URL", "http://localhost:8386")
    );
  },
  get env(): "development" | "production" {
    const raw = resolveValue("env", "NEXT_PUBLIC_ENV", "development");
    return raw === "production" ? "production" : "development";
  },
  get cookieDomain(): string | undefined {
    const runtime = readBrowserRuntimeConfig();
    const fromRuntime = runtime?.cookieDomain?.trim();
    if (fromRuntime) return fromRuntime;
    return fromProcess("NEXT_PUBLIC_COOKIE_DOMAIN");
  },
};

/** Axios base URL — trailing slash, paths like `api/v1/...`. */
export function getApiBaseUrl(): string {
  return `${publicEnv.apiUrl}/`;
}

export function isProductionEnv(): boolean {
  return publicEnv.env === "production" || process.env.NODE_ENV === "production";
}
