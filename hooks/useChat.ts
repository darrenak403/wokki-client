"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { chatKeys } from "@/lib/api/query-keys";
import { fetchChat } from "@/lib/api/services/fetchChat";
import { mapChatError } from "@/lib/support/chat/map-errors";
import { cacheMyEmployeeId } from "@/lib/support/chat/my-employee-id";
import type {
  CreateChannelRequest,
  MessageListResponse,
  MessageResponse,
  SendMessageRequest,
} from "@/types/chat";
import { CHANNEL_TYPE } from "@/types/chat";

const STALE_MS = 30 * 1000;
const MESSAGE_LIMIT = 50;

/** Oldest-first for thread UI (page 0 = newest batch from API). */
export function flattenChatMessages(
  data: InfiniteData<MessageListResponse> | undefined,
): MessageResponse[] {
  if (!data?.pages.length) return [];
  const merged = [...data.pages].reverse().flatMap((page) => page.items);
  const seen = new Set<string>();
  const unique: MessageResponse[] = [];
  for (const msg of merged) {
    const key = msg.id.toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    unique.push(msg);
  }
  return unique.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

function messageIdKey(message: MessageResponse): string {
  return message.id.toLowerCase();
}

export function appendChatMessageToCache(
  queryClient: ReturnType<typeof useQueryClient>,
  channelId: string,
  message: MessageResponse,
): void {
  const incomingKey = messageIdKey(message);
  if (!incomingKey) return;

  queryClient.setQueryData<InfiniteData<MessageListResponse>>(
    chatKeys.messages(channelId),
    (old) => {
      if (!old?.pages.length) {
        return {
          pages: [{ items: [message], nextCursor: null, hasMore: false }],
          pageParams: [undefined],
        };
      }
      const exists = old.pages.some((page) =>
        page.items.some((m) => messageIdKey(m) === incomingKey),
      );
      if (exists) return old;
      const [first, ...rest] = old.pages;
      return {
        ...old,
        pages: [{ ...first, items: [...first.items, message] }, ...rest],
      };
    },
  );
}

export function useChannelsQuery(enabled = true) {
  return useQuery({
    queryKey: chatKeys.channels(),
    queryFn: () => fetchChat.listChannels(),
    enabled,
    staleTime: STALE_MS,
  });
}

export function useInfiniteMessagesQuery(channelId: string | null) {
  return useInfiniteQuery({
    queryKey: chatKeys.messages(channelId ?? ""),
    queryFn: ({ pageParam }) =>
      fetchChat.listMessages(channelId!, {
        limit: MESSAGE_LIMIT,
        ...(pageParam ? { before: pageParam as string } : {}),
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore && lastPage.nextCursor ? lastPage.nextCursor : undefined,
    enabled: Boolean(channelId),
    staleTime: STALE_MS,
  });
}

export function useSendMessageMutation(channelId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SendMessageRequest) => {
      if (!channelId) throw new Error("Chưa chọn kênh");
      return fetchChat.sendMessage(channelId, data);
    },
    onSuccess: (message) => {
      cacheMyEmployeeId(message.senderId);
      if (channelId) {
        appendChatMessageToCache(queryClient, channelId, message);
        void queryClient.invalidateQueries({ queryKey: chatKeys.channels() });
      }
    },
    onError: (error) => toast.error(mapChatError(error)),
  });
}

export function useDeleteMessageMutation(channelId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (messageId: string) => {
      if (!channelId) throw new Error("Chưa chọn kênh");
      return fetchChat.deleteMessage(channelId, messageId);
    },
    onSuccess: () => {
      if (channelId) {
        void queryClient.invalidateQueries({ queryKey: chatKeys.messages(channelId) });
      }
      toast.success("Đã xóa tin nhắn.");
    },
    onError: (error) => toast.error(mapChatError(error)),
  });
}

export function useUnreadCountQuery(enabled = true) {
  return useQuery({
    queryKey: chatKeys.unreadCount(),
    queryFn: () => fetchChat.getUnreadCount(),
    enabled,
    staleTime: STALE_MS,
  });
}

export function useOrgMembersQuery(enabled = true) {
  return useQuery({
    queryKey: chatKeys.orgMembers(),
    queryFn: () => fetchChat.listOrgMembers(),
    enabled,
    staleTime: STALE_MS,
  });
}

export function useCreateDirectChannelMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (peerEmployeeId: string) =>
      fetchChat.createChannel({
        type: CHANNEL_TYPE.Direct,
        memberEmployeeIds: [peerEmployeeId],
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: chatKeys.channels() });
    },
    onError: (error) => toast.error(mapChatError(error)),
  });
}

export function useCreateChannelMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateChannelRequest) => fetchChat.createChannel(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: chatKeys.channels() });
      toast.success("Đã mở tin nhắn riêng.");
    },
    onError: (error) => toast.error(mapChatError(error)),
  });
}
