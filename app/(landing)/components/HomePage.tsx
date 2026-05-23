import Image from "next/image";
import Link from "next/link";
import type React from "react";
import {
  CalendarDaysIcon,
  CheckIcon,
  CirclePlayIcon,
  ClockIcon,
  MessageSquareIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const trustedBrands = ["SAMSUNG", "RetailPro", "F&B Group", "CafeChain", "BOUTIQUE"];

const painPoints = [
  {
    icon: CalendarDaysIcon,
    title: "Lịch làm rối rắm",
    description:
      "Mất hàng giờ để xếp lịch, dễ trùng lặp ca và khó theo dõi sự thay đổi liên tục từ nhân viên.",
    tone: "bg-red-50 text-red-600",
  },
  {
    icon: ClockIcon,
    title: "Chấm công sai sót",
    description:
      "Ghi nhận giờ làm thủ công dễ dẫn đến sai lệch, gây tranh cãi và ảnh hưởng đến bảng lương cuối tháng.",
    tone: "bg-orange-50 text-orange-600",
  },
  {
    icon: MessageSquareIcon,
    title: "Liên lạc rời rạc",
    description:
      "Thông tin cập nhật qua nhiều kênh chat khác nhau khiến thông báo quan trọng dễ bị trôi và bỏ sót.",
    tone: "bg-indigo-50 text-indigo-600",
  },
] as const;

const pricingPlans = [
  {
    name: "Starter",
    description: "Cho cửa hàng nhỏ",
    price: "Miễn phí",
    suffix: "",
    features: ["Tối đa 10 nhân viên", "Xếp lịch cơ bản", "Ứng dụng di động"],
    cta: "Bắt đầu miễn phí",
    href: "/register",
    featured: false,
  },
  {
    name: "Business",
    description: "Cho chuỗi cửa hàng",
    price: "39.000đ",
    suffix: "/user/tháng",
    features: [
      "Không giới hạn nhân viên",
      "Quản lý đổi ca & nghỉ phép",
      "Chấm công GPS/Wifi",
      "Báo cáo xuất excel",
    ],
    cta: "Dùng thử 14 ngày",
    href: "/register",
    featured: true,
  },
  {
    name: "Enterprise",
    description: "Cho doanh nghiệp lớn",
    price: "Liên hệ",
    suffix: "",
    features: ["Mọi tính năng Business", "Tích hợp API/ERP", "Hỗ trợ chuyên trách 24/7"],
    cta: "Nhận báo giá",
    href: "/pricing",
    featured: false,
  },
] as const;

function MarketingSection({
  children,
  className,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn("px-6 py-20 md:px-10 md:py-24", className)}>
      <div className="mx-auto max-w-7xl">{children}</div>
    </section>
  );
}

function SectionHeader({
  title,
  description,
  className,
}: {
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div className={cn("text-center", className)}>
      <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h2>
      <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">{description}</p>
    </div>
  );
}

function FeatureBullets({ items }: { items: readonly string[] }) {
  return (
    <ul className="mt-6 space-y-3 text-sm">
      {items.map((item) => (
        <li key={item} className="flex items-center gap-2">
          <CheckIcon className="size-4 text-primary" />
          {item}
        </li>
      ))}
    </ul>
  );
}

function BrowserCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <Card className={cn("overflow-hidden rounded-xl shadow-xl shadow-brand-navy/10", className)}>
      <CardHeader className="flex h-8 flex-row items-center gap-2 border-b bg-muted/80 px-4 py-0">
        <span className="size-2.5 rounded-full bg-red-300" />
        <span className="size-2.5 rounded-full bg-amber-300" />
        <span className="size-2.5 rounded-full bg-emerald-300" />
      </CardHeader>
      <CardContent className="p-0">{children}</CardContent>
    </Card>
  );
}

function LaptopPreview() {
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const shifts = [
    { label: "Morning", className: "bg-emerald-100 text-emerald-700" },
    { label: "Night", className: "bg-amber-100 text-amber-700" },
    { label: "Evening", className: "bg-blue-100 text-blue-700" },
    { label: "Off", className: "bg-slate-100 text-slate-500" },
    { label: "Morning", className: "bg-emerald-100 text-emerald-700" },
    { label: "Evening", className: "bg-blue-100 text-blue-700" },
    { label: "Night", className: "bg-amber-100 text-amber-700" },
    { label: "Late", className: "bg-red-100 text-red-700" },
    { label: "Morning", className: "bg-emerald-100 text-emerald-700" },
    { label: "Evening", className: "bg-blue-100 text-blue-700" },
  ];

  return (
    <div className="mx-auto mt-14 max-w-5xl">
      <BrowserCard className="bg-gradient-to-br from-white via-[#f8faff] to-[#eef3fb] p-3 shadow-2xl shadow-brand-navy/15">
        <div className="flex justify-center px-4 py-10 md:px-12">
          <div className="relative w-full max-w-3xl">
            <div className="rounded-t-2xl border-x-8 border-t-8 border-slate-900 bg-slate-900 shadow-xl">
              <div className="overflow-hidden rounded-t-lg bg-white">
                <div className="grid min-h-[300px] grid-cols-[120px_1fr] md:min-h-[360px] md:grid-cols-[150px_1fr]">
                  <aside className="border-r bg-slate-50 p-4">
                    <p className="text-xs font-semibold text-brand-navy">Wokki</p>
                    <div className="mt-6 space-y-2">
                      {["Dashboard", "Schedule", "Attendance", "Swap", "Payroll"].map(
                        (item, index) => (
                          <div
                            key={item}
                            className={cn(
                              "rounded-md px-2 py-1.5 text-[10px]",
                              index === 1
                                ? "bg-brand-medium text-white"
                                : "text-muted-foreground",
                            )}
                          >
                            {item}
                          </div>
                        ),
                      )}
                    </div>
                  </aside>
                  <div className="p-4 md:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-sm font-semibold md:text-base">Weekly schedule</h2>
                        <p className="text-[11px] text-muted-foreground">
                          Cập nhật ca làm việc theo tuần
                        </p>
                      </div>
                      <div className="hidden gap-2 sm:flex">
                        {["63%", "104", "31"].map((item) => (
                          <div key={item} className="rounded-md border px-3 py-2 text-[10px]">
                            <p className="font-semibold">{item}</p>
                            <p className="text-muted-foreground">Status</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-5 grid grid-cols-5 overflow-hidden rounded-lg border text-[10px]">
                      {weekDays.map((day) => (
                        <div key={day} className="border-b border-r bg-slate-50 px-2 py-2 font-medium">
                          {day}
                        </div>
                      ))}
                      {shifts.map((shift, index) => (
                        <div key={`${shift.label}-${index}`} className="min-h-16 border-r p-2">
                          <span
                            className={cn(
                              "inline-flex rounded px-2 py-1 font-medium",
                              shift.className,
                            )}
                          >
                            {shift.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mx-auto h-4 w-[85%] rounded-b-2xl bg-slate-300" />
            <div className="mx-auto h-2 w-[55%] rounded-b-full bg-slate-200" />
          </div>
        </div>
      </BrowserCard>
    </div>
  );
}

function MiniSchedulePreview() {
  return (
    <BrowserCard className="bg-white">
      <div className="grid grid-cols-4 gap-3 p-5">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-5 rounded bg-slate-200" />
        ))}
        <div className="h-12 rounded bg-indigo-100" />
        <div className="col-span-2 h-12 rounded bg-emerald-200" />
        <div className="h-12 rounded bg-slate-200" />
      </div>
    </BrowserCard>
  );
}

function TrustedBrands() {
  return (
    <section className="border-b border-border bg-background px-6 py-10 md:px-10">
      <div className="mx-auto max-w-6xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Được tin dùng bởi các thương hiệu hàng đầu
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-sm font-semibold text-muted-foreground opacity-70">
          {trustedBrands.map((brand) => (
            <span key={brand}>{brand}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

function PainPointCard({ item }: { item: (typeof painPoints)[number] }) {
  const Icon = item.icon;

  return (
    <Card className="rounded-lg shadow-sm transition-transform hover:-translate-y-1">
      <CardHeader>
        <div className={cn("mb-4 flex size-12 items-center justify-center rounded-lg", item.tone)}>
          <Icon className="size-5" aria-hidden />
        </div>
        <CardTitle className="text-lg">{item.title}</CardTitle>
      </CardHeader>
      <CardContent className="-mt-2">
        <CardDescription className="leading-6">{item.description}</CardDescription>
      </CardContent>
    </Card>
  );
}

function PricingCard({ plan }: { plan: (typeof pricingPlans)[number] }) {
  return (
    <Card
      className={cn(
        "relative flex min-h-[360px] rounded-xl",
        plan.featured && "border-brand-navy shadow-xl shadow-brand-navy/15 md:-translate-y-4",
      )}
    >
      {plan.featured ? (
        <Badge className="absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-brand-navy text-[10px] uppercase text-white hover:bg-brand-navy">
          Phổ biến nhất
        </Badge>
      ) : null}
      <CardHeader className={cn(plan.featured && "pt-12")}>
        <CardTitle>{plan.name}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        <div>
          <span className="text-4xl font-bold tracking-tight">{plan.price}</span>
          {plan.suffix ? (
            <span className="ml-1 text-sm text-muted-foreground">{plan.suffix}</span>
          ) : null}
        </div>
        <FeatureBullets items={plan.features} />
        <Link
          href={plan.href}
          className={cn(
            buttonVariants({ variant: plan.featured ? "default" : "outline" }),
            "mt-8 w-full",
          )}
        >
          {plan.cta}
        </Link>
      </CardContent>
    </Card>
  );
}

export function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border bg-background px-6 pb-20 pt-16 md:px-10 md:pb-28 md:pt-24">
        <div className="absolute left-0 top-0 size-80 rounded-full bg-brand-light/25 blur-3xl" />
        <div className="absolute right-0 top-10 size-72 rounded-full bg-brand-medium/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl text-center">
          <h1 className="mx-auto max-w-3xl text-5xl font-bold leading-tight tracking-tight text-foreground md:text-7xl">
            Quản lý lịch ca &{" "}
            <span className="text-brand-navy">đội ngũ tinh gọn</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
            Giải pháp vận hành ca làm việc chuyên nghiệp cho Retail & F&B. Tối ưu thời
            gian, giảm thiểu sai sót và tăng cường kết nối đội ngũ.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/register" className={cn(buttonVariants({ size: "lg" }))}>
              Bắt đầu ngay hôm nay
            </Link>
            <Link
              href="#features"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "gap-2")}
            >
              <CirclePlayIcon className="size-4" aria-hidden />
              Xem Demo
            </Link>
          </div>
          <LaptopPreview />
        </div>
      </section>

      <TrustedBrands />

      <MarketingSection className="bg-background">
        <SectionHeader
          title="Nỗi lo của người quản lý"
          description="Những vấn đề thường gặp khi quản lý nhân sự theo cách thủ công."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {painPoints.map((item) => (
            <PainPointCard key={item.title} item={item} />
          ))}
        </div>
      </MarketingSection>

      <MarketingSection id="features" className="bg-[#f4effb]">
        <SectionHeader
          title="Tính năng nổi bật"
          description="Mọi công cụ bạn cần để vận hành trơn tru trong một nền tảng duy nhất."
        />
        <div className="mt-14 grid items-center gap-12 lg:grid-cols-2">
          <div>
            <Badge variant="secondary" className="mb-4 rounded-full">
              Lên Lịch Thông Minh
            </Badge>
            <h3 className="text-2xl font-bold tracking-tight md:text-3xl">
              Xếp lịch ca làm việc trong vài phút
            </h3>
            <p className="mt-4 leading-7 text-muted-foreground">
              Giao diện trực quan. Tự động cảnh báo trùng lặp hoặc vi phạm quy định làm việc.
              Nhân viên nhận thông báo ngay lập tức qua ứng dụng.
            </p>
            <FeatureBullets
              items={["Kéo thả dễ dàng", "Phân quyền linh hoạt", "Cảnh báo thông minh"]}
            />
          </div>
          <MiniSchedulePreview />
        </div>

        <div className="mt-16 grid items-center gap-12 lg:grid-cols-2">
          <div className="relative overflow-hidden rounded-xl border bg-white p-2 shadow-xl shadow-brand-navy/15">
            <Image
              src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=80"
              alt="Đội ngũ nhân viên đang trao đổi lịch làm việc"
              width={1200}
              height={800}
              className="h-72 rounded-lg object-cover md:h-80"
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
          </div>
          <div>
            <Badge className="mb-4 rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
              Quản Lý Linh Hoạt
            </Badge>
            <h3 className="text-2xl font-bold tracking-tight md:text-3xl">
              Đổi ca và xin nghỉ chủ động
            </h3>
            <p className="mt-4 leading-7 text-muted-foreground">
              Trao quyền cho nhân viên tự đề xuất đổi ca hoặc tìm người làm thay. Người quản lý chỉ
              cần duyệt với một chạm, giảm thiểu áp lực quản trị.
            </p>
            <FeatureBullets
              items={["Đề xuất đổi ca 1-1", "Xin nghỉ phép online", "Tự động cập nhật lịch"]}
            />
          </div>
        </div>
      </MarketingSection>

      <MarketingSection className="bg-background">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            title="Bảng giá minh bạch"
            description="Chọn gói dịch vụ phù hợp với quy mô doanh nghiệp của bạn."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {pricingPlans.map((plan) => (
              <PricingCard key={plan.name} plan={plan} />
            ))}
          </div>
        </div>
      </MarketingSection>

      <section className="bg-brand-medium px-6 py-20 text-white md:px-10">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
            Sẵn sàng tối ưu vận hành?
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-white/80">
            Tham gia cùng hàng ngàn quản lý đang sử dụng Wokki để tiết kiệm thời gian mỗi ngày.
          </p>
          <form className="mx-auto mt-8 flex max-w-lg flex-col gap-3 sm:flex-row">
            <Input
              type="email"
              placeholder="Nhập email của bạn..."
              className="h-11 flex-1 border-0 bg-white text-foreground shadow-sm ring-1 ring-white/20 focus-visible:ring-white"
            />
            <Button type="submit" className="bg-brand-navy hover:bg-brand-navy/90">
              Bắt đầu ngay
            </Button>
          </form>
          <p className="mt-4 text-xs text-white/70">
            Miễn phí 14 ngày dùng thử. Không cần thẻ tín dụng.
          </p>
        </div>
      </section>
    </>
  );
}
