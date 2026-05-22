import { getAppHomePath } from "@/lib/auth/app-routes";

/** Sau đăng nhập — vào dashboard quản lý của role. */
export function getPostLoginPath(role: unknown): string {
  return getAppHomePath(role);
}
