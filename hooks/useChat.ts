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

const STALE_MS = 30 * 1000;
const MESSAGE_LIMIT = 50;

/** Oldest-first for thread UI (page 0 = newest batch from API). */
export function flattenChatMessages(
  data: InfiniteData<MessageListResponse> | undefined,
): MessageResponse[] {
  if (!data?.pages.length) return [];
  const merged = [...data.pages].reverse().flatMap((page) => page.items);
  return merged.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function appendChatMessageToCache(
  queryClient: ReturnType<typeof useQueryClient>,
  channelId: string,
  message: MessageResponse,
): void {
  queryClient.setQueryData<InfiniteData<MessageListResponse>>(
    chatKeys.messages(channelId),
    (old) => {
      if (!old?.pages.length) {
        return {
          pages: [{ items: [message], nextCursor: null, hasMore: false }],
          pageParams: [undefined],
        };
      }
      const exists = old.pages.some((page) => page.items.some((m) => m.id === message.id));
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

export function useCreateChannelMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateChannelRequest) => fetchChat.createChannel(data),
    onSuccess: (channel) => {
      void queryClient.invalidateQueries({ queryKey: chatKeys.channels() });
      toast.success(
        channel.type === 0 ? "Đã mở kênh Direct." : "Đã tạo nhóm chat.",
      );
    },
    onError: (error) => toast.error(mapChatError(error)),
  });
}
