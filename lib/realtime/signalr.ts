import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from "@microsoft/signalr";
import { getApiBaseUrl } from "@/lib/env/public";
import { store } from "@/lib/redux/store";

let connection: HubConnection | null = null;
let startPromise: Promise<HubConnection | null> | null = null;
/** Backend MVP chỉ có ChatHub `/ws/chat`; `/hubs/app` chưa triển khai. */
let appHubUnavailable = false;

function getBaseUrl(): string {
  return getApiBaseUrl();
}

export function getHubUrl(): string {
  return new URL("/hubs/app", getBaseUrl()).toString();
}

function getAccessToken(): string | null {
  try {
    return store.getState().auth.token;
  } catch {
    return null;
  }
}

function isAppHubMissingError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("404") ||
    message.includes("Not Found") ||
    message.includes("Failed to fetch") ||
    // Server returned non-2xx during negotiate HTTP request
    message.includes("stopped during negotiation") ||
    message.includes("negotiate")
  );
}

export function isAppHubEnabled(): boolean {
  return !appHubUnavailable;
}

export function getHubConnection(): HubConnection {
  if (typeof window === "undefined") throw new Error("SignalR chỉ chạy trên browser");
  if (connection) return connection;

  connection = new HubConnectionBuilder()
    .withUrl(getHubUrl(), { accessTokenFactory: () => getAccessToken() || "" })
    .withAutomaticReconnect()
    .configureLogging(
      process.env.NODE_ENV === "development" ? LogLevel.Warning : LogLevel.Warning,
    )
    .build();

  connection.onreconnecting((err) => console.info("[SignalR] reconnecting...", err));
  connection.onreconnected((id) => console.info("[SignalR] reconnected:", id));
  connection.onclose((err) => console.info("[SignalR] closed", err));

  return connection;
}

async function resetConnection(): Promise<void> {
  if (!connection) return;
  try {
    await connection.stop();
  } catch {
    // ignore stop errors
  } finally {
    connection = null;
    startPromise = null;
  }
}

/** Kết nối app hub; trả về null nếu server chưa có `/hubs/app` (MVP). */
export async function startHubConnection(): Promise<HubConnection | null> {
  if (appHubUnavailable) return null;

  let conn = getHubConnection();
  if (conn.state === HubConnectionState.Connected) return conn;

  if (conn.state === HubConnectionState.Connecting && startPromise) {
    return startPromise;
  }

  if (conn.state !== HubConnectionState.Disconnected) {
    await resetConnection();
    conn = getHubConnection(); // fresh connection after reset
  }

  startPromise = conn
    .start()
    .then(() => {
      startPromise = null;
      return conn;
    })
    .catch((err) => {
      startPromise = null;
      if (isAppHubMissingError(err)) {
        appHubUnavailable = true;
        console.warn(
          "[SignalR] App hub /hubs/app chưa có trên server — bỏ qua thông báo realtime (chat vẫn dùng /ws/chat).",
        );
        return null;
      }
      throw err;
    });

  return startPromise;
}

export async function stopHubConnection(): Promise<void> {
  if (!connection) return;
  try {
    await connection.stop();
  } finally {
    connection = null;
    startPromise = null;
  }
}
