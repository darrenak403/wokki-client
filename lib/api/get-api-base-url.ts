/** Base URL with trailing slash for axios (paths: `api/v1/...`). */
export function getApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8386";
  return raw.endsWith("/") ? raw : `${raw}/`;
}
