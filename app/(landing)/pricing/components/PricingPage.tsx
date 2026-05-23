import Link from "next/link";
import { CheckIcon } from "lucide-react";
import { MarketingPageHeader } from "@/app/(landing)/about/components/MarketingPageHeader";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Starter",
    price: "Miễn phí",
    period: "đến 15 nhân viên",
    description: "Cho quán nhỏ hoặc đội thử nghiệm — đủ lịch ca và chấm công cơ bản.",
    features: [
      "Lịch tuần & xuất bản",
      "Chấm công vào / ra",
      "Đổi ca giữa nhân viên",
      "1 chi nhánh",
    ],
    cta: "Bắt đầu",
    href: "/register",
    highlighted: false,
  },
  {
    name: "Business",
    price: "990.000₫",
    period: "/ tháng",
    description: "Cho chuỗi vài chi nhánh — thêm báo cáo và quản lý đổi ca.",
    features: [
      "Mọi tính năng Starter",
      "Không giới hạn nhân viên",
      "Báo cáo công & tổng hợp lương",
      "Chat nhóm & tin nhắn riêng",
      "Đến 5 chi nhánh",
    ],
    cta: "Dùng thử 14 ngày",
    href: "/register",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Liên hệ",
    period: "tùy quy mô",
    description: "Tổ chức lớn — SSO, SLA và triển khai theo yêu cầu.",
    features: [
      "Mọi tính năng Business",
      "Chi nhánh không giới hạn",
      "Export payroll CSV nâng cao",
      "Hỗ trợ ưu tiên & đồng hành triển khai",
      "Tùy chỉnh quy trình",
    ],
    cta: "Liên hệ kinh doanh",
    href: "/help",
    highlighted: false,
  },
] as const;

export function PricingPage() {
  return (
    <>
      <MarketingPageHeader
        badge="Bảng giá"
        title="Bảng giá đơn giản, minh bạch"
        description="Chọn gói phù hợp quy mô đội ngũ. Nâng cấp khi bạn mở rộng — không phí ẩn cho tính năng cốt lõi."
      />

      <section className="mx-auto max-w-6xl px-6 py-12 md:px-10 md:py-16">
        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={cn(
                "flex flex-col shadow-none",
                plan.highlighted && "border-primary ring-1 ring-primary/20"
              )}
            >
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle>{plan.name}</CardTitle>
                  {plan.highlighted ? <Badge>Phổ biến</Badge> : null}
                </div>
                <div className="pt-2">
                  <span className="text-3xl font-semibold tracking-tight">{plan.price}</span>
                  <span className="ml-1 text-sm text-muted-foreground">{plan.period}</span>
                </div>
                <CardDescription className="pt-2">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-2 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-2 text-muted-foreground">
                      <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Link
                  href={plan.href}
                  className={cn(
                    buttonVariants({
                      variant: plan.highlighted ? "default" : "outline",
                    }),
                    "w-full"
                  )}
                >
                  {plan.cta}
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Giá tham khảo cho thị trường Việt Nam. Gói Enterprise có hợp đồng riêng theo số người dùng
          và chi nhánh.
        </p>
      </section>
    </>
  );
}
