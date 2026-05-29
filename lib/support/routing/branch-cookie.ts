export const BRANCH_ID_COOKIE = "wokki:branchId";

export function readBranchIdCookie(): string | null {
  if (typeof document === "undefined") return null;
  const cookie = document.cookie
    .split("; ")
    .find((value) => value.startsWith(`${BRANCH_ID_COOKIE}=`));
  if (!cookie) return null;
  try {
    return decodeURIComponent(cookie.slice(BRANCH_ID_COOKIE.length + 1));
  } catch {
    return null;
  }
}

export function setBranchIdCookie(locationId: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${BRANCH_ID_COOKIE}=${encodeURIComponent(locationId)}; path=/; SameSite=Lax`;
}

export function clearBranchIdCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${BRANCH_ID_COOKIE}=; path=/; max-age=0`;
}
