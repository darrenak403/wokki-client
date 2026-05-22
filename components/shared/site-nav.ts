export const SITE_NAV = [
  { href: "/", label: "Trang chủ" },
  { href: "/community", label: "Cộng đồng" },
  { href: "/pricing", label: "Bảng giá" },
  { href: "/about", label: "Về chúng tôi" },
  { href: "/help", label: "Trung tâm trợ giúp" },
] as const;

export const MARKETING_PATHS = SITE_NAV.map((item) => item.href);
