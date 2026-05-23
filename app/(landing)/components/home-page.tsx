import Link from "next/link";
import { ArrowRightIcon, CalendarDaysIcon, CheckIcon, ClockIcon, Repeat2Icon, UsersIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const highlights = [
  {
    icon: CalendarDaysIcon,
    title: "Lịch tuần",
    description: "Tạo, xem và công bố lịch làm việc theo tuần để mọi người cùng theo một nguồn dữ liệu.",
  },
  {
    icon: ClockIcon,
    title: "Chấm công",
    description: "Clock in/out gắn với ca thật, giúp quản lý giờ công rõ ràng và dễ đối soát.",
  },
  {
    icon: Repeat2Icon,
    title: "Đổi ca",
    description: "Nhân viên gửi yêu cầu đổi ca, đối tác hoặc quản lý xử lý theo trạng thái minh bạch.",
  },
] as const;

const roles = [
  {
    title: "Admin",
    items: [
      "Quản lý tài khoản, chi nhánh, phòng ban và hồ sơ nhân sự.",
      "Thiết lập ca làm việc, quyền truy cập và dữ liệu nền tảng.",
      "Theo dõi chấm công, đổi ca và dữ liệu phục vụ payroll.",
    ],
  },
  {
    title: "Manager",
    items: [
      "Xếp lịch tuần, gán nhân viên và công bố lịch cho team.",
      "Duyệt đổi ca, xem chấm công team và theo dõi vận hành.",
      "Giảm trao đổi rời rạc bằng workflow rõ trạng thái.",
    ],
  },
  {
    title: "Staff",
    items: [
      "Xem lịch cá nhân, ca hôm nay và các ca sắp tới.",
      "Clock in/out, gửi yêu cầu đổi ca và theo dõi kết quả.",
    ],
  },
] as const;

function ProductPreview() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const cells = [
    { day: 1, label: "Ca sáng", time: "06:00 - 14:00", tone: "bg-emerald-100 text-emerald-800" },
    { day: 2, label: "Ca chiều", time: "14:00 - 22:00", tone: "bg-blue-100 text-blue-800" },
    { day: 3, label: "Ca kín", time: "22:00 - 23:00", tone: "bg-violet-100 text-violet-800" },
    { day: 4, label: "Ca tối", time: "18:00 - 02:00", tone: "bg-rose-100 text-rose-800" },
    { day: 5, label: "Ca chính", time: "08:00 - 16:00", tone: "bg-amber-100 text-amber-800" },
    { day: 7, label: "Đổi ca", time: "Pending", tone: "bg-sky-100 text-sky-800" },
    { day: 9, label: "Ca sáng", time: "06:00 - 14:00", tone: "bg-emerald-100 text-emerald-800" },
    { day: 10, label: "Ca chiều", time: "14:00 - 22:00", tone: "bg-blue-100 text-blue-800" },
    { day: 12, label: "Ca tối", time: "18:00 - 02:00", tone: "bg-rose-100 text-rose-800" },
    { day: 14, label: "Ca chính", time: "08:00 - 16:00", tone: "bg-amber-100 text-amber-800" },
  ];

  return (
    <div className="relative mx-auto w-full max-w-2xl lg:max-w-none">
      <div className="rounded-t-2xl border border-border bg-muted/50 px-5 pt-5 shadow-2xl shadow-brand-navy/10">
        <div className="overflow-hidden rounded-t-xl border border-border bg-background">
          <div className="grid min-h-[420px] grid-cols-[128px_1fr]">
            <aside className="bg-brand-medium p-4 text-white">
              <p className="text-sm font-semibold">Wokki</p>
              <nav className="mt-8 space-y-2 text-xs text-white/75">
                {["Trang chủ", "Lịch ca", "Đổi ca", "Chấm công", "Tin nhắn"].map((item) => (
                  <div
                    key={item}
                    className={cn(
                      "rounded-md px-2.5 py-2",
                      item === "Lịch ca" ? "bg-brand-navy text-white" : "bg-white/0",
                    )}
                  >
                    {item}
                  </div>
                ))}
              </nav>
            </aside>
            <div className="p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight">Lịch tuần</h2>
                  <p className="text-sm text-muted-foreground">Tháng 05, 2026</p>
                </div>
                <Badge variant="outline" className="rounded-md">Published</Badge>
              </div>
              <div className="mt-5 grid grid-cols-6 border-l border-t text-xs">
                {days.map((day) => (
                  <div key={day} className="border-b border-r bg-muted/40 px-2 py-2 font-medium">
                    {day}
                  </div>
                ))}
                {Array.from({ length: 18 }, (_, index) => {
                  const cell = cells.find((item) => item.day === index + 1);
                  return (
                    <div key={index} className="min-h-20 border-b border-r p-1.5">
                      <span className="text-[10px] text-muted-foreground">{index + 1}</span>
                      {cell ? (
                        <div className={cn("mt-1 rounded px-1.5 py-1 text-[10px] font-medium", cell.tone)}>
                          <p>{cell.label}</p>
                          <p className="font-normal opacity-80">{cell.time}</p>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        <div className="mx-auto h-4 w-2/3 rounded-b-2xl bg-muted" />
      </div>

      <div className="absolute left-2 top-1/2 w-[min(360px,80%)] -translate-y-1/2 rounded-lg border bg-background p-4 shadow-xl shadow-brand-navy/10 sm:left-0">
        <div className="flex items-start gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-brand-light/30 text-brand-navy">
            <Repeat2Icon className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Yêu cầu đổi ca</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Ca chiều muốn đổi sang ca sáng thứ Sáu.
            </p>
            <div className="mt-3 flex gap-2">
              <button className="h-8 flex-1 rounded-md bg-brand-medium text-xs font-medium text-white">
                Duyệt
              </button>
              <button className="h-8 flex-1 rounded-md border text-xs font-medium">
                Để sau
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HomePage() {
  return (
    <>
      <section className="overflow-hidden border-b border-border bg-background">
        <div className="mx-auto grid min-h-[calc(100vh-72px)] max-w-7xl items-center gap-12 px-6 py-20 md:px-10 lg:grid-cols-[0.9fr_1.1fr] lg:py-24">
          <div>
            <Badge variant="secondary" className="mb-6 w-fit">
              Quản lý ca làm việc
            </Badge>
            <h1 className="max-w-2xl text-5xl font-semibold leading-tight tracking-tight text-foreground md:text-6xl">
              Vận hành ca làm việc rõ ràng hơn
            </h1>
            <p className="mt-6 max-w-xl text-xl leading-8 text-muted-foreground">
              Lên lịch, đổi ca và chấm công trong một nền tảng tinh gọn cho đội ngũ vận hành.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/register" className={cn(buttonVariants({ size: "lg" }))}>
              Bắt đầu dùng miễn phí
            </Link>
            <Link
              href="/pricing"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "gap-2")}
            >
              Xem bảng giá
              <ArrowRightIcon className="size-4" aria-hidden />
            </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-4 text-sm text-muted-foreground">
              {["Lịch tuần", "Đổi ca", "Chấm công"].map((item) => (
                <span key={item} className="inline-flex items-center gap-2">
                  <CheckIcon className="size-4 text-primary" />
                  {item}
                </span>
              ))}
            </div>
          </div>
          <ProductPreview />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-24">
        <div className="mb-14 text-center">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Tính năng nổi bật</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {highlights.map(({ icon: Icon, title, description }) => (
            <Card key={title} className="rounded-lg shadow-lg shadow-brand-navy/5">
              <CardHeader>
                <div className="mb-3 flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-5" aria-hidden />
                </div>
                <CardTitle>{title}</CardTitle>
              </CardHeader>
              <CardContent className="-mt-2">
                <CardDescription className="leading-6">{description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-24">
          <h2 className="text-center text-3xl font-semibold tracking-tight md:text-4xl">Vai trò</h2>
          <div className="mt-14 grid gap-10 md:grid-cols-3">
            {roles.map((role) => (
              <div key={role.title}>
                <h3 className="text-2xl font-semibold tracking-tight">{role.title}</h3>
                <ul className="mt-5 list-disc space-y-3 pl-5 text-sm leading-6 text-muted-foreground">
                  {role.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
