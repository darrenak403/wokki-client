/** BE ChannelType: 0 Direct, 1 Group */
export type ChannelType = 0 | 1;

export const CHANNEL_TYPE = {
  Direct: 0,
  Group: 1,
} as const satisfies Record<string, ChannelType>;

export interface ChannelMember {
  employeeId: string;
  firstName: string;
  lastName: string;
  joinedAt: string;
}

export interface ChannelResponse {
  id: string;
  name: string | null;
  type: ChannelType;
  createdBy: string;
  createdAt: string;
  members: ChannelMember[];
}

export interface MessageResponse {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  body: string;
  isDeleted: boolean;
  createdAt: string;
}

export interface MessageListResponse {
  items: MessageResponse[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface CreateChannelRequest {
  type: ChannelType;
  name?: string | null;
  memberEmployeeIds: string[];
}

export interface SendMessageRequest {
  body: string;
}

export interface MessageListParams {
  before?: string;
  limit?: number;
}
