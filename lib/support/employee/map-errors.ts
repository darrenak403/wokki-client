import { extractApiMessage } from "@/lib/api/normalize-response";
import { mapAuthFailureMessage } from "@/lib/support/auth/map-auth-error";
import type { ApiError, ApiResponse } from "@/types/api";

const EMPLOYEE_ERROR_MESSAGES: Record<string, string> = {
  VALIDATION_FAILED: "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.",
  AUTH_FORBIDDEN: "Bạn không có quyền thực hiện thao tác này.",
  ME_NO_EMPLOYEE: "Tài khoản chưa được liên kết nhân viên. Liên hệ quản lý.",
  SELF_NO_EMPLOYEE: "Tài khoản chưa được liên kết nhân viên. Liên hệ quản lý.",
  SELF_PAYMENT_QR_INVALID: "Ảnh QR không hợp lệ. Dùng JPEG/PNG/WebP, tối đa 5MB.",
  CLOUDINARY_NOT_CONFIGURED: "Chưa cấu hình tải ảnh. Liên hệ quản trị hệ thống.",
  SWAP_NO_EMPLOYEE: "Tài khoản chưa được liên kết nhân viên.",
  ATTENDANCE_NO_EMPLOYEE: "Tài khoản chưa được liên kết nhân viên.",
  SWAP_NOT_FOUND: "Không tìm thấy yêu cầu đổi ca.",
  SWAP_ASSIGNMENT_NOT_FOUND: "Không tìm thấy phân ca.",
  ATTENDANCE_NO_ASSIGNMENT: "Hôm nay bạn không có ca để chấm công.",
  ATTENDANCE_ASSIGNMENT_WINDOW_PASSED: "Ca này đã kết thúc, không thể Vào ca nữa.",
  SWAP_NOT_OWNER: "Bạn không phải người liên quan yêu cầu này.",
  SWAP_FORBIDDEN: "Không được phép thực hiện thao tác này.",
  SWAP_CUTOFF_EXCEEDED: "Đã quá hạn đổi ca tuần sau.",
  SWAP_SAME_EMPLOYEE: "Không thể đổi ca với chính mình.",
  SWAP_SCHEDULE_NOT_PUBLISHED: "Lịch chưa được công bố.",
  ATTENDANCE_NO_OPEN: "Chưa có lần chấm công đang mở.",
  SWAP_OPEN_EXISTS: "Đã có yêu cầu đổi ca đang chờ cho phân ca này.",
  SWAP_INVALID_TRANSITION: "Không thể chuyển trạng thái yêu cầu.",
  SWAP_PEER_ACCEPTED_EXISTS: "Yêu cầu đã được xử lý.",
  SWAP_OVERRIDE_APPROVED: "Trưởng ca đã duyệt đổi ca.",
  SWAP_OVERRIDE_REJECTED: "Trưởng ca đã từ chối đổi ca.",
  ATTENDANCE_OPEN_EXISTS: "Bạn đang có lần chấm công chưa kết thúc.",
  ATTENDANCE_ADJUSTED: "Đã điều chỉnh chấm công.",
  ATTENDANCE_NOTE_REQUIRED: "Ghi chú điều chỉnh là bắt buộc.",
  ATTENDANCE_PERIOD_LOCKED: "Kỳ lương đã khóa — không thể chỉnh chấm công.",
  ATTENDANCE_NOT_FOUND: "Không tìm thấy bản ghi chấm công.",
  SWAP_POST_COVER_ACCEPTOR_ASSIGNMENT_NOT_ALLOWED: "Nhường ca không cần chọn ca của bạn — chỉ đổi chéo mới chọn ca trả.",
  SWAP_POST_COVER_NO_OPEN_SLOT: "Bạn không còn chỗ trống trong lịch để nhận ca này (trùng ca, nghỉ giữa ca, hoặc vượt giới hạn ca).",
  SWAP_POST_ALREADY_TAKEN: "Bài đăng đã được người khác nhận. Vui lòng làm mới bảng tin.",
  SWAP_POST_OPEN_EXISTS: "Ca này đã có bài đăng đang mở.",
  SWAP_POST_SCHEDULE_NOT_DRAFT: "Chỉ đổi ca khi lịch còn Nháp (Draft).",
  SWAP_POST_POLICY_ROLE_MISMATCH: "Không đủ vai trò cho ca này theo chính sách tổ chức.",
  SWAP_POST_POLICY_REST_CONFLICT: "Vi phạm quy tắc nghỉ giữa các ca.",
  SWAP_POST_POLICY_WEEKLY_CAP: "Vượt giới hạn số ca trong tuần.",
  SWAP_POST_POLICY_DAILY_CAP: "Vượt giới hạn số ca trong ngày.",
  SWAP_POST_POLICY_OVERLAP: "Trùng ca hoặc chồng lấn thời gian.",
  SWAP_POST_SELF_ACCEPT: "Bạn không thể nhận bài đăng của chính mình.",
  SWAP_POST_ACCEPTOR_ASSIGNMENT_REQUIRED: "Cần chọn ca của bạn để đổi chéo.",
  INTERNAL_ERROR: "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.",
};

const GENERIC_ERROR = "Đã xảy ra lỗi. Vui lòng thử lại.";

function mapCode(code?: string): string | null {
  if (!code) return null;
  return EMPLOYEE_ERROR_MESSAGES[code] ?? null;
}

export function mapEmployeeFailureMessage(message?: unknown, messageCode?: string): string {
  const authMapped = mapAuthFailureMessage(message, messageCode);
  if (messageCode && mapCode(messageCode)) return mapCode(messageCode)!;
  const parsed = extractApiMessage(message);
  const fromCode = mapCode(parsed.code);
  if (fromCode) return fromCode;
  if (authMapped !== GENERIC_ERROR) return authMapped;
  if (parsed.text.trim()) return parsed.text.trim();
  return GENERIC_ERROR;
}

export function mapEmployeeResponseFailure(
  response: Pick<ApiResponse<unknown>, "message">
): string {
  return mapEmployeeFailureMessage(response.message, response.message.code);
}

export function mapEmployeeError(error: unknown): string {
  if (!error) return GENERIC_ERROR;
  if (typeof error === "string") return mapEmployeeFailureMessage(error);

  const apiError = error as ApiError;
  if (apiError.httpStatus === 429) {
    return "Quá nhiều thao tác chấm công. Vui lòng thử lại sau vài giây.";
  }
  if (apiError.messageCode) {
    const mapped = mapCode(apiError.messageCode);
    if (mapped) return mapped;
  }

  const body = apiError.data as Record<string, unknown> | undefined;
  const fromBody = extractApiMessage(body?.message);
  const code =
    apiError.messageCode ?? (typeof fromBody.code === "string" ? fromBody.code : undefined);
  const mapped = mapCode(code);
  if (mapped) return mapped;

  if (typeof apiError.message === "string" && apiError.message.trim()) {
    return apiError.message.trim();
  }

  return GENERIC_ERROR;
}
