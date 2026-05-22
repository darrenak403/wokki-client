export const SITE = {
  name: process.env.NEXT_PUBLIC_APP_NAME || "Wokki",
  shortName: "Wokki",
  defaultDescription:
    "Wokki — nền tảng quản lý lịch ca, chấm công và nhân sự cho doanh nghiệp Việt Nam. Lên lịch minh bạch, đổi ca linh hoạt.",
  locale: "vi_VN",
} as const;

export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  return url || "http://localhost:6789";
}
