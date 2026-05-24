import { publicEnv } from "@/lib/env/public";

export const SITE = {
  name: publicEnv.appName,
  shortName: "Wokki",
  defaultDescription:
    "Wokki — nền tảng quản lý lịch ca, chấm công và nhân sự cho doanh nghiệp Việt Nam. Lên lịch minh bạch, đổi ca linh hoạt.",
  locale: "vi_VN",
} as const;

export function getSiteUrl(): string {
  return publicEnv.appUrl;
}
