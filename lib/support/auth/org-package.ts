export const ORG_PACKAGE_NOT_ACTIVATED = "ORG_PACKAGE_NOT_ACTIVATED";
export const ORG_PACKAGE_EXPIRED = "ORG_PACKAGE_EXPIRED";

export const ORG_PACKAGE_PATH = "/org-package";

export type OrgPackageReason = "not-activated" | "expired";

const MESSAGES: Record<string, string> = {
  [ORG_PACKAGE_NOT_ACTIVATED]:
    "Tổ chức của bạn chưa được kích hoạt gói sử dụng. Vui lòng liên hệ Wokki để được bật gói.",
  [ORG_PACKAGE_EXPIRED]:
    "Gói sử dụng tổ chức đã hết hạn. Mọi tài khoản trong tổ chức cần được Wokki admin gia hạn trước khi tiếp tục.",
};

export function isOrgPackageCode(code?: string | null): boolean {
  return code === ORG_PACKAGE_NOT_ACTIVATED || code === ORG_PACKAGE_EXPIRED;
}

export function orgPackageReasonFromCode(code?: string | null): OrgPackageReason {
  return code === ORG_PACKAGE_EXPIRED ? "expired" : "not-activated";
}

export function orgPackageUserMessage(code?: string | null): string {
  if (!code || !isOrgPackageCode(code)) {
    return MESSAGES[ORG_PACKAGE_NOT_ACTIVATED]!;
  }
  return MESSAGES[code]!;
}

export function orgPackagePath(reason: OrgPackageReason): string {
  return `${ORG_PACKAGE_PATH}?reason=${reason}`;
}
