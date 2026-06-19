/** BE ChannelType: 0 Direct, 1 Group (legacy), 2 Organization */
export type ChannelType = 0 | 1 | 2;

export const CHANNEL_TYPE = {
  Direct: 0,
  Group: 1,
  Organization: 2,
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
  lastMessageAt: string | null;
  members: ChannelMember[];
}

/** GET /channels/unread-count */
export interface ChannelUnreadCountResponse {
  channelId: string;
  count: number;
}

export interface UnreadCountResponse {
  total: number;
  channels: ChannelUnreadCountResponse[];
}

export interface OrgChatMemberResponse {
  employeeId: string;
  firstName: string;
  lastName: string;
  role: string;
  isOrgAdmin: boolean;
  departmentName: string | null;
  locationName: string | null;
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
  type: typeof CHANNEL_TYPE.Direct;
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
