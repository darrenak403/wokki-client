import { assertChatSuccess } from "@/lib/support/chat/assert-success";
import { normalizeChannelList, normalizeChannelResponse } from "@/lib/support/chat/normalize-channel";
import { normalizeApiResponse } from "@/lib/api/normalize-response";
import apiService from "@/lib/api/core";
import type { ApiEnvelope } from "@/types/api";
import type {
  ChannelResponse,
  CreateChannelRequest,
  MessageListParams,
  MessageListResponse,
  MessageResponse,
  OrgChatMemberResponse,
  SendMessageRequest,
  UnreadCountResponse,
} from "@/types/chat";

export const fetchChat = {
  listChannels: async (): Promise<ChannelResponse[]> => {
    const response = await apiService.get<ApiEnvelope<ChannelResponse[]>>("api/v1/channels");
    const channels = assertChatSuccess(normalizeApiResponse(response.data));
    return normalizeChannelList(channels);
  },

  getUnreadCount: async (): Promise<UnreadCountResponse> => {
    const response = await apiService.get<ApiEnvelope<UnreadCountResponse>>(
      "api/v1/channels/unread-count",
    );
    return assertChatSuccess(normalizeApiResponse(response.data));
  },

  listOrgMembers: async (): Promise<OrgChatMemberResponse[]> => {
    const response = await apiService.get<ApiEnvelope<OrgChatMemberResponse[]>>(
      "api/v1/channels/org/members",
    );
    return assertChatSuccess(normalizeApiResponse(response.data));
  },

  createChannel: async (data: CreateChannelRequest): Promise<ChannelResponse> => {
    const response = await apiService.post<ApiEnvelope<ChannelResponse>>(
      "api/v1/channels",
      data,
    );
    const channel = assertChatSuccess(normalizeApiResponse(response.data));
    return normalizeChannelResponse(channel);
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
