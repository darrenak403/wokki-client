import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from "@microsoft/signalr";
import { getApiBaseUrl } from "@/lib/api/get-api-base-url";
import { store } from "@/lib/redux/store";
import type { MessageResponse } from "@/types/chat";

export type ReceiveMessageHandler = (message: MessageResponse) => void;
export type ChatHubStateListener = (state: HubConnectionState) => void;

let connection: HubConnection | null = null;
let startPromise: Promise<void> | null = null;
let joinedChannelId: string | null = null;
const receiveHandlers = new Set<ReceiveMessageHandler>();
const stateListeners = new Set<ChatHubStateListener>();

function getHubUrl(): string {
  const base = getApiBaseUrl().replace(/\/+$/, "");
  return `${base}/ws/chat`;
}

function getAccessToken(): string {
  try {
    return store.getState().auth.token ?? "";
  } catch {
    return "";
  }
}

function notifyHubState(): void {
  const state = getChatHubState();
  for (const listener of stateListeners) {
    listener(state);
  }
}

/** SignalR may emit PascalCase until BE protocol is configured; normalize for UI cache. */
export function normalizeChatMessage(raw: Record<string, unknown>): MessageResponse {
  return {
    id: String(raw.id ?? raw.Id ?? ""),
    channelId: String(raw.channelId ?? raw.ChannelId ?? ""),
    senderId: String(raw.senderId ?? raw.SenderId ?? ""),
    senderName: String(raw.senderName ?? raw.SenderName ?? ""),
    body: String(raw.body ?? raw.Body ?? ""),
    isDeleted: Boolean(raw.isDeleted ?? raw.IsDeleted ?? false),
    createdAt: String(raw.createdAt ?? raw.CreatedAt ?? ""),
  };
}

function wireConnection(conn: HubConnection): void {
  conn.off("ReceiveMessage");
  conn.on("ReceiveMessage", (raw: Record<string, unknown>) => {
    const message = normalizeChatMessage(raw);
    for (const handler of receiveHandlers) {
      handler(message);
    }
  });

  conn.onclose(() => notifyHubState());
  conn.onreconnecting(() => notifyHubState());
  conn.onreconnected(() => {
    notifyHubState();
    void tryJoinActiveChannel();
  });
}

function getOrCreateConnection(): HubConnection {
  if (connection) return connection;

  connection = new HubConnectionBuilder()
    .withUrl(getHubUrl(), {
      accessTokenFactory: () => getAccessToken(),
      withCredentials: true,
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
    .configureLogging(LogLevel.Warning)
    .build();

  wireConnection(connection);
  return connection;
}

async function tryJoinActiveChannel(): Promise<void> {
  if (!connection || connection.state !== HubConnectionState.Connected) return;
  if (!joinedChannelId) return;
  try {
    await connection.invoke("JoinChannel", joinedChannelId);
  } catch (err) {
    console.warn("[chat-hub] JoinChannel failed", err);
  }
}

export function subscribeReceiveMessage(handler: ReceiveMessageHandler): () => void {
  receiveHandlers.add(handler);
  return () => receiveHandlers.delete(handler);
}

export function subscribeChatHubState(listener: ChatHubStateListener): () => void {
  stateListeners.add(listener);
  listener(getChatHubState());
  return () => stateListeners.delete(listener);
}

export function getChatHubState(): HubConnectionState {
  return connection?.state ?? HubConnectionState.Disconnected;
}

/** Idempotent connect — safe to call from provider + ChatPanel. */
export async function ensureChatHubConnected(): Promise<void> {
  const token = getAccessToken();
  if (!token) return;

  const conn = getOrCreateConnection();

  if (conn.state === HubConnectionState.Connected) {
    notifyHubState();
    await tryJoinActiveChannel();
    return;
  }

  if (conn.state === HubConnectionState.Connecting && startPromise) {
    await startPromise;
    return;
  }

  if (conn.state !== HubConnectionState.Disconnected) {
    try {
      await conn.stop();
    } catch {
      connection = null;
      startPromise = null;
    }
  }

  const activeConn = getOrCreateConnection();

  startPromise = activeConn
    .start()
    .then(async () => {
      notifyHubState();
      await tryJoinActiveChannel();
    })
    .catch((err) => {
      console.error("[chat-hub] connect failed", err);
      throw err;
    })
    .finally(() => {
      startPromise = null;
    });

  await startPromise;
}

export async function startChatHub(_accessToken?: string): Promise<void> {
  await ensureChatHubConnected();
}

export async function stopChatHub(): Promise<void> {
  if (startPromise) {
    try {
      await startPromise;
    } catch {
      // ignore failed start while stopping
    }
  }

  if (!connection) return;

  try {
    if (connection.state !== HubConnectionState.Disconnected) {
      await connection.stop();
    }
  } finally {
    connection = null;
    startPromise = null;
    joinedChannelId = null;
    notifyHubState();
  }
}

export async function joinChatChannel(channelId: string): Promise<void> {
  joinedChannelId = channelId;
  await tryJoinActiveChannel();
}

export async function leaveChatChannel(channelId: string): Promise<void> {
  if (joinedChannelId === channelId) {
    joinedChannelId = null;
  }
  if (!connection || connection.state !== HubConnectionState.Connected) return;
  try {
    await connection.invoke("LeaveChannel", channelId);
  } catch {
    // Hub may already have left on disconnect
  }
}

export async function reconnectChatHub(_accessToken?: string): Promise<void> {
  const rejoinId = joinedChannelId;
  await stopChatHub();
  joinedChannelId = rejoinId;
  await ensureChatHubConnected();
}
