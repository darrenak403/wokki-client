// App constants
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Waiting List";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Cookie keys
export const AUTH_TOKEN_KEY = "auth-token";

// Query keys
export const QUERY_KEYS = {
  USER: "user",
  USERS: "users",
  REFERRAL_STATS: "referral-stats",
  PRODUCTS: "products",
  ORDERS: "orders",
  REGISTER: "register",
  CHAT_CONVERSATIONS: "chat-conversations",
  CHAT_MESSAGES: "chat-messages",
  CHAT_USERS: "chat-users",
  SHIFT_CONFIGS: "shift-configs",
  SHIFTS: "shifts",
  MOCK_EMPLOYEES: "mock-employees",
  AVAILABILITY: "availability",
  STAFFING_DEMAND: "staffing-demand",
} as const;

// Routes
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  PROFILE: "/profile",
} as const;
