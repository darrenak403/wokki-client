import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getAppHomePath,
  isAppAreaPath,
  roleCanAccessAppPath,
} from "@/lib/auth/app-routes";
import { readAuthCookies, resolveRoleFromRequest } from "@/lib/auth/resolve-request-role";
import { MARKETING_PATHS } from "@/components/shared/site-nav";
const AUTH_ROUTES = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { token, roleCookie } = readAuthCookies(request);
  const role = resolveRoleFromRequest(token, roleCookie);

  const isPublicRoute = MARKETING_PATHS.some((r) => {
    if (r === "/") return pathname === "/";
    return pathname === r || pathname.startsWith(`${r}/`);
  });
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`));
  const isAppRoute = isAppAreaPath(pathname);

  // Legacy paths → khu app mới
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    const home = role ? getAppHomePath(role) : "/login";
    return NextResponse.redirect(new URL(home, request.url));
  }

  if (!token || !role) {
    if (isPublicRoute || isAuthRoute) return NextResponse.next();
    const res = NextResponse.redirect(new URL("/login", request.url));
    if (token) {
      res.cookies.delete("authToken");
      res.cookies.delete("authRole");
    }
    return res;
  }

  if (isAuthRoute) {
    return NextResponse.redirect(new URL(getAppHomePath(role), request.url));
  }

  if (isAppRoute) {
    if (roleCanAccessAppPath(role, pathname)) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL(getAppHomePath(role), request.url));
  }

  // Đã đăng nhập: marketing vẫn xem được; route lạ → về app home
  if (isPublicRoute) return NextResponse.next();

  return NextResponse.redirect(new URL(getAppHomePath(role), request.url));
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|webm|mp4|xml|glb)$).*)",
  ],
};
