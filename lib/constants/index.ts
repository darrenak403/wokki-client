import { getApiBaseUrl, publicEnv } from "@/lib/env/public";
import { AUTH_TOKEN_COOKIE } from "@/lib/support/auth/session-cookies";

/** @see publicEnv — values from NEXT_PUBLIC_* (.env.local / Docker build args). */
export const APP_NAME = publicEnv.appName;
export const APP_URL = publicEnv.appUrl;
export const API_URL = publicEnv.apiUrl;
/** Same as `getApiBaseUrl()` — includes trailing slash for HTTP clients. */
export const API_BASE_URL = getApiBaseUrl();

/** Cookie name for JWT — must match `session-cookies.ts`. */
export const AUTH_TOKEN_KEY = AUTH_TOKEN_COOKIE;

// Legacy query keys (prefer `lib/api/query-keys.ts` for new code)
export const QUERY_KEYS = {
  USER: "user",
  USERS: "users",
  REFERRAL_STATS: "referral-stats",
  PRODUCTS: "products",
  ORDERS: "orders",
  CHAT_CONVERSATIONS: "chat-conversations",
  CHAT_MESSAGES: "chat-messages",
  CHAT_USERS: "chat-users",
  SHIFT_CONFIGS: "shift-configs",
  SHIFTS: "shifts",
  MOCK_EMPLOYEES: "mock-employees",
  AVAILABILITY: "availability",
  STAFFING_DEMAND: "staffing-demand",
} as const;

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  PROFILE: "/profile",
} as const;
