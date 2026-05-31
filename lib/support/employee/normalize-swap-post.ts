import {
  SWAP_POST_STATUS,
  SWAP_POST_TYPE,
  type SwapPostAuditResponse,
  type SwapPostResponse,
  type SwapPostStatus,
  type SwapPostType,
} from "@/types/employee";

/** BE returns string enums via JsonStringEnumConverter; FE uses numeric constants. */
export type RawSwapPostType = SwapPostType | "Cover" | "CrossSwap" | string | number;
export type RawSwapPostStatus =
  | SwapPostStatus
  | "Pending"
  | "Completed"
  | "Hidden"
  | "Cancelled"
  | "Expired"
  | string
  | number;

const TYPE_STRING: Record<string, SwapPostType> = {
  Cover: SWAP_POST_TYPE.Cover,
  CrossSwap: SWAP_POST_TYPE.CrossSwap,
};

const STATUS_STRING: Record<string, SwapPostStatus> = {
  Pending: SWAP_POST_STATUS.Pending,
  Completed: SWAP_POST_STATUS.Completed,
  Hidden: SWAP_POST_STATUS.Hidden,
  Cancelled: SWAP_POST_STATUS.Cancelled,
  Expired: SWAP_POST_STATUS.Expired,
};

export function normalizeSwapPostType(raw: RawSwapPostType | undefined | null): SwapPostType {
  if (raw === undefined || raw === null) return SWAP_POST_TYPE.Cover;
  if (raw === SWAP_POST_TYPE.Cover || raw === SWAP_POST_TYPE.CrossSwap) return raw;
  if (typeof raw === "string") {
    const mapped = TYPE_STRING[raw];
    if (mapped !== undefined) return mapped;
    const parsed = Number(raw);
    if (parsed === 0 || parsed === 1) return parsed as SwapPostType;
  }
  if (typeof raw === "number" && (raw === 0 || raw === 1)) return raw as SwapPostType;
  return SWAP_POST_TYPE.Cover;
}

export function normalizeSwapPostStatus(raw: RawSwapPostStatus | undefined | null): SwapPostStatus {
  if (raw === undefined || raw === null) return SWAP_POST_STATUS.Pending;
  if (
    raw === SWAP_POST_STATUS.Pending ||
    raw === SWAP_POST_STATUS.Completed ||
    raw === SWAP_POST_STATUS.Hidden ||
    raw === SWAP_POST_STATUS.Cancelled ||
    raw === SWAP_POST_STATUS.Expired
  ) {
    return raw;
  }
  if (typeof raw === "string") {
    const mapped = STATUS_STRING[raw];
    if (mapped !== undefined) return mapped;
    const parsed = Number(raw);
    if (!Number.isNaN(parsed) && parsed >= 0 && parsed <= 4) return parsed as SwapPostStatus;
  }
  if (typeof raw === "number" && raw >= 0 && raw <= 4) return raw as SwapPostStatus;
  return SWAP_POST_STATUS.Pending;
}

export function normalizeSwapPostResponse(post: SwapPostResponse): SwapPostResponse {
  return {
    ...post,
    type: normalizeSwapPostType(post.type as RawSwapPostType),
    status: normalizeSwapPostStatus(post.status as RawSwapPostStatus),
  };
}

export function normalizeSwapPostAuditResponse(row: SwapPostAuditResponse): SwapPostAuditResponse {
  return {
    ...row,
    type: normalizeSwapPostType(row.type as RawSwapPostType),
  };
}
