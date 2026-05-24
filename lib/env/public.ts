/**
 * NEXT_PUBLIC_* — single source of truth (browser + build time).
 * Defaults align with `.env.example`, `package.json` (port 6789), Wokki API (8386).
 */

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

const rawAppName = process.env.NEXT_PUBLIC_APP_NAME?.trim();
const rawAppUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
const rawApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
const rawEnv = process.env.NEXT_PUBLIC_ENV?.trim();

export const publicEnv = {
  /** Display name (metadata, SEO). */
  appName: rawAppName || "Wokki",
  /** Canonical site origin, no trailing slash — matches NEXT_PUBLIC_APP_URL. */
  appUrl: stripTrailingSlash(rawAppUrl || "http://localhost:6789"),
  /** API origin, no trailing slash — matches NEXT_PUBLIC_API_URL. */
  apiUrl: stripTrailingSlash(rawApiUrl || "http://localhost:8386"),
  /** `development` | `production` — cookies, logging. */
  env: (rawEnv === "production" ? "production" : "development") as "development" | "production",
  cookieDomain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN?.trim() || undefined,
} as const;

/** Axios base URL — trailing slash, paths like `api/v1/...`. */
export function getApiBaseUrl(): string {
  return `${publicEnv.apiUrl}/`;
}

export function isProductionEnv(): boolean {
  return publicEnv.env === "production" || process.env.NODE_ENV === "production";
}
