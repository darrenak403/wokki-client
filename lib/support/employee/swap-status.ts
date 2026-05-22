import { SWAP_STATUS, type SwapStatus } from "@/types/employee";

export function swapStatusLabel(status: SwapStatus): string {
  switch (status) {
    case SWAP_STATUS.Pending:
      return "Chờ đối tác";
    case SWAP_STATUS.PeerAccepted:
      return "Đối tác đồng ý";
    case SWAP_STATUS.PeerDeclined:
      return "Từ chối";
    case SWAP_STATUS.ManagerApproved:
      return "Đã đổi ca";
    case SWAP_STATUS.ManagerRejected:
      return "Manager từ chối";
    case SWAP_STATUS.Cancelled:
      return "Đã hủy";
    default:
      return "Không xác định";
  }
}

export function isSwapPending(status: SwapStatus): boolean {
  return status === SWAP_STATUS.Pending;
}
