import { assertChatSuccess } from "@/lib/support/chat/assert-success";
import { normalizeApiResponse } from "@/lib/api/normalize-response";
import apiService from "@/lib/api/core";
import type { ApiEnvelope } from "@/types/api";
import type {
  ChannelResponse,
  CreateChannelRequest,
  MessageListParams,
  MessageListResponse,
  MessageResponse,
  SendMessageRequest,
} from "@/types/chat";

export const fetchChat = {
  listChannels: async (): Promise<ChannelResponse[]> => {
    const response = await apiService.get<ApiEnvelope<ChannelResponse[]>>("api/v1/channels");
    return assertChatSuccess(normalizeApiResponse(response.data));
  },

  createChannel: async (data: CreateChannelRequest): Promise<ChannelResponse> => {
    const response = await apiService.post<ApiEnvelope<ChannelResponse>>(
      "api/v1/channels",
      data,
    );
    return assertChatSuccess(normalizeApiResponse(response.data));
  },

  listMessages: async (
    channelId: string,
    params: MessageListParams = {},
  ): Promise<MessageListResponse> => {
    const query: Record<string, string | number> = {
      limit: params.limit ?? 50,
    };
    if (params.before) query.before = params.before;

    const response = await apiService.get<ApiEnvelope<MessageListResponse>>(
      `api/v1/channels/${channelId}/messages`,
      query,
    );
    return assertChatSuccess(normalizeApiResponse(response.data));
  },

  sendMessage: async (
    channelId: string,
    data: SendMessageRequest,
  ): Promise<MessageResponse> => {
    const response = await apiService.post<ApiEnvelope<MessageResponse>>(
      `api/v1/channels/${channelId}/messages`,
      data,
    );
    return assertChatSuccess(normalizeApiResponse(response.data));
  },

  deleteMessage: async (channelId: string, messageId: string): Promise<MessageResponse> => {
    const response = await apiService.delete<ApiEnvelope<MessageResponse>>(
      `api/v1/channels/${channelId}/messages/${messageId}`,
    );
    return assertChatSuccess(normalizeApiResponse(response.data));
  },
};
