import type { ApiEnvelope, ApiResponse, AppMessage, ApiValidationError } from "@/types/api";

const EMPTY_MESSAGE: AppMessage = {
  code: "",
  text: "",
  statusCode: 200,
};

export function extractApiMessage(message: unknown): AppMessage {
  if (message == null) return EMPTY_MESSAGE;

  if (typeof message === "string") {
    return { code: "", text: message, statusCode: 200 };
  }

  if (typeof message === "object") {
    const m = message as Partial<AppMessage>;
    return {
      code: typeof m.code === "string" ? m.code : "",
      text: typeof m.text === "string" ? m.text : "",
      statusCode: typeof m.statusCode === "number" ? m.statusCode : 200,
    };
  }

  return EMPTY_MESSAGE;
}

function normalizeErrors(errors: unknown): ApiValidationError[] | null {
  if (!Array.isArray(errors) || errors.length === 0) return null;

  const mapped = errors
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const e = item as Partial<ApiValidationError>;
      if (typeof e.field !== "string" || typeof e.message !== "string") return null;
      return { field: e.field, message: e.message };
    })
    .filter((item): item is ApiValidationError => item !== null);

  return mapped.length > 0 ? mapped : null;
}

export function normalizeApiResponse<T>(raw: ApiEnvelope<T>): ApiResponse<T> {
  const message = extractApiMessage(raw.message);

  return {
    success: Boolean(raw.success),
    data: raw.data ?? null,
    message,
    errors: normalizeErrors(raw.errors),
  };
}

export function getMessageCode(response: Pick<ApiResponse<unknown>, "message">): string {
  return response.message.code;
}
