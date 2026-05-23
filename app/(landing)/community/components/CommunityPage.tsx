import Link from "next/link";
import { BookOpenIcon, MessageCircleIcon, UsersIcon } from "lucide-react";
import { MarketingPageHeader } from "@/app/(landing)/about/components/MarketingPageHeader";
import Conclusion from "@/app/(landing)/components/Conclusion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const channels = [
  {
    icon: MessageCircleIcon,
    title: "Discord",
    description: "Trao đổi nhanh với quản lý chi nhánh khác — tips lên lịch, đổi ca và chấm công.",
    status: "Sắp mở",
  },
  {
    icon: BookOpenIcon,
    title: "Blog & playbook",
    description: "Case study F&B/retail, checklist tuần vận hành và mẫu policy đổi ca.",
    status: "Đang cập nhật",
  },
  {
    icon: UsersIcon,
    title: "Sự kiện online",
    description: "Office hours hàng tháng với đội sản phẩm — hỏi roadmap và best practices.",
    status: "Đăng ký sớm",
  },
] as const;

const posts = [
  {
    tag: "Thực hành tốt",
    title: "5 lỗi thường gặp khi xuất bản lịch tuần",
    excerpt: "Quên khóa bản nháp, sai phòng ban, hoặc không thông báo nhân viên sau xuất bản.",
  },
  {
    tag: "Từ cộng đồng",
    title: "Cách quán 12 nhân viên giảm 40% tin nhắn hỏi ca",
    excerpt: "Chuyển sang Wokki + nhắc thông báo sau xuất bản lịch — nhân viên tự xem ca.",
  },
  {
    tag: "Sản phẩm",
    title: "Lộ trình Q3: chấm công ưu tiên mobile",
    excerpt: "Ưu tiên trải nghiệm chấm công trên điện thoại và hỗ trợ ngoại tuyến (đang khảo sát).",
  },
] as const;

export function CommunityPage() {
  return (
    <>
      <MarketingPageHeader
        badge="Cộng đồng"
        title="Cộng đồng Wokki"
        description="Học hỏi từ người vận hành giống bạn — chia sẻ playbook, tham gia sự kiện và theo dõi sản phẩm phát triển."
        eyebrow="Một nơi để quản lý ca làm bớt cô đơn: hỏi nhanh, học nhanh, áp dụng ngay."
      />

      <section className="mx-auto max-w-7xl space-y-20 px-6 py-16 md:px-10 md:py-24">
        <div className="grid gap-10 rounded-3xl bg-neutral-100 p-6 md:p-10 lg:grid-cols-[0.9fr_1.1fr] dark:bg-neutral-900">
          <div>
            <span className="inline-block rounded-full border border-neutral-300 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
              Playbook vận hành
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-neutral-900 md:text-5xl dark:text-white">
              Mỗi tuần một cách làm tốt hơn.
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { stat: "Office hours", label: "hỏi trực tiếp đội sản phẩm" },
              { stat: "Checklist", label: "mẫu xuất bản lịch tuần" },
              { stat: "Case study", label: "kinh nghiệm từ F&B và retail" },
            ].map((item) => (
              <div key={item.stat} className="rounded-2xl bg-white p-5 dark:bg-neutral-950">
                <p className="text-lg font-extrabold text-neutral-900 dark:text-white">
                  {item.stat}
                </p>
                <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {channels.map(({ icon: Icon, title, description, status }) => (
            <Card
              key={title}
              className="border-neutral-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#4C88C6]/10 dark:border-neutral-800 dark:bg-neutral-900"
            >
              <CardHeader>
                <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-[#EEF6FB] text-[#1D4D8F] dark:bg-[#0B1E3D] dark:text-[#BCE8F5]">
                  <Icon className="size-5" aria-hidden />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base">{title}</CardTitle>
                  <Badge variant="outline">{status}</Badge>
                </div>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        <div>
          <div className="mb-8 text-center">
            <span className="inline-block rounded-full border border-neutral-300 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
              Nội dung nổi bật
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-neutral-900 md:text-5xl dark:text-white">
              Bài viết cho người lên lịch thật.
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {posts.map((post) => (
              <Card
                key={post.title}
                className="border-neutral-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#4C88C6]/10 dark:border-neutral-800 dark:bg-neutral-900"
              >
                <CardHeader>
                  <Badge variant="secondary" className="w-fit">
                    {post.tag}
                  </Badge>
                  <CardTitle className="text-base leading-snug">{post.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{post.excerpt}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-[#BCE8F5]/40 bg-[#EEF6FB] px-6 py-12 text-center md:px-10 dark:border-[#4C88C6]/30 dark:bg-[#0B1E3D]">
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 md:text-4xl dark:text-white">
            Tham gia danh sách chờ cộng đồng
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
            Để lại email khi đăng ký tài khoản — chúng tôi mời bạn vào kênh Discord và newsletter
            đầu tiên.
          </p>
          <Link
            href="/#dang-ky"
            className={cn(
              buttonVariants({ size: "lg" }),
              "mt-6 bg-gradient-to-r from-[#102854] via-[#4C88C6] to-[#1D4D8F]"
            )}
          >
            Đăng ký Wokki
          </Link>
        </div>
      </section>
      <Conclusion />
    </>
  );
}
