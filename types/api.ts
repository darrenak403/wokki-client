/** BE envelope — bám docs/fe/2026-05-21-feat-wave1-auth.md §1 */
export interface AppMessage {
  code: string;
  text: string;
  statusCode: number;
}

export interface ApiValidationError {
  field: string;
  message: string;
}

/** JSON trả về từ API (wire format). */
export interface ApiEnvelope<T> {
  success: boolean;
  data: T | null;
  message: AppMessage | string | null;
  errors: ApiValidationError[] | null;
}

/** Normalized response dùng trong FE sau `normalizeApiResponse`. */
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: AppMessage;
  errors: ApiValidationError[] | null;
}

export interface ApiError {
  httpStatus?: number;
  message: string;
  messageCode?: string;
  status: false;
  errors?: ApiValidationError[];
  data?: unknown;
}

export interface RequestParams {
  [key: string]: string | number | boolean | undefined | null | string[];
}
