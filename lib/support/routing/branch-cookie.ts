export const BRANCH_ID_COOKIE = "wokki:branchId";

export function setBranchIdCookie(locationId: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${BRANCH_ID_COOKIE}=${encodeURIComponent(locationId)}; path=/; SameSite=Lax`;
}

export function clearBranchIdCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${BRANCH_ID_COOKIE}=; path=/; max-age=0`;
}
