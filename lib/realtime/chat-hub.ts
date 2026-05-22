import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from "@microsoft/signalr";
import { getApiBaseUrl } from "@/lib/api/get-api-base-url";
import type { MessageResponse } from "@/types/chat";

export type ReceiveMessageHandler = (message: MessageResponse) => void;
export type ChatHubStateListener = (state: HubConnectionState) => void;

let connection: HubConnection | null = null;
let currentToken: string | null = null;
let joinedChannelId: string | null = null;
const receiveHandlers = new Set<ReceiveMessageHandler>();
const stateListeners = new Set<ChatHubStateListener>();

function buildHubUrl(accessToken: string): string {
  const base = getApiBaseUrl().replace(/\/$/, "");
  const wsBase = base.replace(/^http:/, "ws:").replace(/^https:/, "wss:");
  return `${wsBase}/ws/chat?access_token=${encodeURIComponent(accessToken)}`;
}

function notifyHubState(): void {
  const state = getChatHubState();
  for (const listener of stateListeners) {
    listener(state);
  }
}

function attachReceiveHandler(conn: HubConnection): void {
  conn.off("ReceiveMessage");
  conn.on("ReceiveMessage", (message: MessageResponse) => {
    for (const handler of receiveHandlers) {
      handler(message);
    }
  });
}

function wireConnectionLifecycle(conn: HubConnection): void {
  conn.onclose(() => notifyHubState());
  conn.onreconnecting(() => notifyHubState());
  conn.onreconnected(() => {
    notifyHubState();
    void tryJoinActiveChannel();
  });
}

async function tryJoinActiveChannel(): Promise<void> {
  if (!connection || connection.state !== HubConnectionState.Connected) return;
  if (!joinedChannelId) return;
  await connection.invoke("JoinChannel", joinedChannelId);
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

export async function startChatHub(accessToken: string): Promise<void> {
  if (!accessToken) return;

  if (connection && currentToken !== accessToken) {
    await stopChatHub();
  }

  if (connection?.state === HubConnectionState.Connected) {
    return;
  }

  if (connection?.state === HubConnectionState.Connecting) {
    return;
  }

  if (!connection) {
    currentToken = accessToken;
    connection = new HubConnectionBuilder()
      .withUrl(buildHubUrl(accessToken))
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();
    attachReceiveHandler(connection);
    wireConnectionLifecycle(connection);
  }

  if (connection.state === HubConnectionState.Disconnected) {
    await connection.start();
    notifyHubState();
    await tryJoinActiveChannel();
  }
}

export async function stopChatHub(): Promise<void> {
  if (!connection) return;
  try {
    if (connection.state !== HubConnectionState.Disconnected) {
      await connection.stop();
    }
  } finally {
    connection = null;
    currentToken = null;
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

export async function reconnectChatHub(accessToken: string): Promise<void> {
  const rejoinId = joinedChannelId;
  await stopChatHub();
  joinedChannelId = rejoinId;
  await startChatHub(accessToken);
}
