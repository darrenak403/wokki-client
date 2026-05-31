import { SWAP_POST_STATUS, SWAP_POST_TYPE, type SwapPostStatus, type SwapPostType } from "@/types/employee";

export function swapPostTypeLabel(type: SwapPostType): string {
  switch (type) {
    case SWAP_POST_TYPE.Cover:
      return "Nhường ca";
    case SWAP_POST_TYPE.CrossSwap:
      return "Đổi chéo";
    default:
      return "Không xác định";
  }
}

export function swapPostTypeHint(type: SwapPostType): string {
  switch (type) {
    case SWAP_POST_TYPE.Cover:
      return "Bạn nhường ca này. Người nhận chỉ cần còn chỗ trống trong lịch — không đổi ca của họ.";
    case SWAP_POST_TYPE.CrossSwap:
      return "Bạn muốn đổi ca này lấy ca của người nhận. Họ sẽ chọn ca của họ khi accept.";
    default:
      return "";
  }
}

export function swapPostStatusLabel(status: SwapPostStatus): string {
  switch (status) {
    case SWAP_POST_STATUS.Pending:
      return "Đang mở";
    case SWAP_POST_STATUS.Completed:
      return "Đã đổi";
    case SWAP_POST_STATUS.Hidden:
      return "Đã ẩn";
    case SWAP_POST_STATUS.Cancelled:
      return "Đã hủy";
    case SWAP_POST_STATUS.Expired:
      return "Hết hạn";
    default:
      return "Không xác định";
  }
}

export function formatSwapShiftLine(
  shiftName: string,
  startTime: string,
  endTime: string,
  date: string,
): string {
  const start = startTime.slice(0, 5);
  const end = endTime.slice(0, 5);
  const day = date.slice(8, 10);
  const month = date.slice(5, 7);
  return `${shiftName} · ${day}/${month} · ${start}–${end}`;
}
