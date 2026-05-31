import type { ChannelResponse } from "@/types/chat";
import { CHANNEL_TYPE } from "@/types/chat";
import type { OrgChatMemberResponse } from "@/types/chat";
import { ROLE_ADMIN } from "@/lib/types/roles";

const STORAGE_KEY = "wokki_chat_my_employee_id";

/** /auth/me has no employeeId — cache after send or first channel with members. */
export function getCachedMyEmployeeId(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(STORAGE_KEY);
}

export function cacheMyEmployeeId(employeeId: string): void {
  if (typeof window === "undefined" || !employeeId) return;
  sessionStorage.setItem(STORAGE_KEY, employeeId);
}

export function clearCachedMyEmployeeId(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
}

/** Try to infer self from channel membership when cache empty (best-effort). */
export function tryInferMyEmployeeIdFromChannels(channels: ChannelResponse[]): string | null {
  const cached = getCachedMyEmployeeId();
  if (cached) return cached;

  const counts = new Map<string, number>();
  for (const ch of channels) {
    for (const m of ch.members) {
      counts.set(m.employeeId, (counts.get(m.employeeId) ?? 0) + 1);
    }
  }
  if (counts.size === 0) return null;

  let bestId: string | null = null;
  let bestCount = 0;
  for (const [id, count] of counts) {
    if (count > bestCount) {
      bestCount = count;
      bestId = id;
    }
  }
  return bestId;
}

export function memberDisplayName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}

export function orgChatMemberSubtitle(member: OrgChatMemberResponse): string | null {
  if (member.isOrgAdmin || member.role?.toLowerCase() === ROLE_ADMIN.toLowerCase()) {
    return "Quản trị viên · Toàn chi nhánh";
  }
  const parts = [member.departmentName, member.locationName].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : null;
}

export function channelDisplayName(
  channel: ChannelResponse,
  myEmployeeId: string | null,
): string {
  if (channel.type === CHANNEL_TYPE.Organization) {
    return channel.name?.trim() || "Toàn công ty";
  }
  if (channel.type === CHANNEL_TYPE.Group && channel.name?.trim()) {
    return channel.name.trim();
  }
  if (channel.members.length === 0) return "Kênh chat";
  if (!myEmployeeId) {
    return channel.members
      .map((m) => `${m.firstName} ${m.lastName}`.trim())
      .join(" · ");
  }
  const peer = channel.members.find((m) => m.employeeId !== myEmployeeId);
  if (peer) return `${peer.firstName} ${peer.lastName}`.trim();
  return channel.members[0]
    ? `${channel.members[0].firstName} ${channel.members[0].lastName}`.trim()
    : "Direct";
}
