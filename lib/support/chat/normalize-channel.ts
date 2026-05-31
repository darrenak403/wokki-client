import { CHANNEL_TYPE, type ChannelResponse, type ChannelType } from "@/types/chat";

/** BE may return numeric enum (0|1|2) or string via JsonStringEnumConverter. */
export type RawChannelType = ChannelType | "Direct" | "Group" | "Organization" | string | number;

const STRING_TO_TYPE: Record<string, ChannelType> = {
  Direct: CHANNEL_TYPE.Direct,
  Group: CHANNEL_TYPE.Group,
  Organization: CHANNEL_TYPE.Organization,
};

export function normalizeChannelType(raw: RawChannelType | undefined | null): ChannelType {
  if (raw === undefined || raw === null) {
    return CHANNEL_TYPE.Direct;
  }

  if (raw === CHANNEL_TYPE.Direct || raw === CHANNEL_TYPE.Group || raw === CHANNEL_TYPE.Organization) {
    return raw;
  }

  if (typeof raw === "number" && raw >= 0 && raw <= 2) {
    return raw as ChannelType;
  }

  if (typeof raw === "string") {
    const mapped = STRING_TO_TYPE[raw];
    if (mapped !== undefined) return mapped;
    const parsed = Number(raw);
    if (!Number.isNaN(parsed) && parsed >= 0 && parsed <= 2) {
      return parsed as ChannelType;
    }
  }

  return CHANNEL_TYPE.Direct;
}

export function normalizeChannelResponse(channel: ChannelResponse): ChannelResponse {
  return {
    ...channel,
    type: normalizeChannelType(channel.type as RawChannelType),
  };
}

export function normalizeChannelList(channels: ChannelResponse[]): ChannelResponse[] {
  return channels.map(normalizeChannelResponse);
}
