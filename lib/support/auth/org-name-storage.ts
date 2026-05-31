const ORG_NAME_KEY = "wokki:orgName";

export function readCachedOrganizationName(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ORG_NAME_KEY);
}

export function writeCachedOrganizationName(name: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ORG_NAME_KEY, name.trim());
}

export function clearCachedOrganizationName(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ORG_NAME_KEY);
}

export const ORG_NAME_FALLBACK = "Tổ chức của bạn";

export function resolveOrganizationDisplayName(cached: string | null | undefined): string {
  const trimmed = cached?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : ORG_NAME_FALLBACK;
}
