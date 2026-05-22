import Link from "next/link";
import { ArrowRightIcon, CalendarDaysIcon, ClockIcon, UsersIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const highlights = [
  {
    icon: CalendarDaysIcon,
    title: "Lịch tuần, một nguồn sự thật",
    description: "Quản lý xuất bản lịch — nhân viên xem ca trên mọi thiết bị, không cần gọi hỏi.",
  },
  {
    icon: ClockIcon,
    title: "Chấm công gắn ca thật",
    description: "Số giờ làm và điều chỉnh có audit — đối soát lương nhanh, ít tranh cãi.",
  },
  {
    icon: UsersIcon,
    title: "Đội ngũ đồng bộ",
    description: "Đổi ca, chat và phân quyền trong cùng hệ thống — giảm app rời rạc.",
  },
] as const;

const stats = [
  { value: "3×", label: "Nhanh hơn khi lên lịch tuần" },
  { value: "28", label: "Ngày lịch cá nhân luôn cập nhật" },
  { value: "1", label: "Nền tảng cho ca, công và chat" },
] as const;

export function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,color-mix(in_oklab,var(--brand-light)_14%,transparent),transparent)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28">
          <Badge variant="secondary" className="mb-6 w-fit">
            Quản lý nhân sự &amp; lịch ca
          </Badge>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl md:leading-[1.08]">
            Vận hành ca làm việc như một sản phẩm — không như một file Excel
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">
            Wokki là nền tảng cho team retail, F&amp;B và dịch vụ: lên lịch, đổi ca, chấm công và
            trao đổi nội bộ — minh bạch từ quản lý đến nhân viên.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/register" className={cn(buttonVariants({ size: "lg" }))}>
              Dùng thử miễn phí
            </Link>
            <Link
              href="/pricing"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "gap-2")}
            >
              Xem bảng giá
              <ArrowRightIcon className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto grid max-w-6xl grid-cols-1 divide-y border-border sm:grid-cols-3 sm:divide-x sm:divide-y-0 md:px-10">
          {stats.map((item) => (
            <div key={item.label} className="px-6 py-8 text-center sm:py-10">
              <p className="text-3xl font-semibold text-primary md:text-4xl">{item.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 md:px-10 md:py-20">
        <div className="mb-10 max-w-xl">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Mọi thứ team cần mỗi tuần
          </h2>
          <p className="mt-2 text-muted-foreground">
            Thiết kế cho người vận hành thật — không phải slide sales generic.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {highlights.map(({ icon: Icon, title, description }) => (
            <Card key={title} className="shadow-none">
              <CardHeader>
                <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-5" aria-hidden />
                </div>
                <CardTitle className="text-base">{title}</CardTitle>
              </CardHeader>
              <CardContent className="-mt-2">
                <CardDescription>{description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-6 py-16 text-center md:px-10 md:py-20">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Bắt đầu với lịch tuần đầu tiên
          </h2>
          <p className="max-w-md text-muted-foreground">
            Tham gia cộng đồng Wokki hoặc xem hướng dẫn nếu bạn cần thêm thời gian tìm hiểu.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/register" className={cn(buttonVariants({ size: "lg" }))}>
              Tạo tài khoản
            </Link>
            <Link href="/help" className={cn(buttonVariants({ variant: "ghost", size: "lg" }))}>
              Trung tâm trợ giúp
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
