import Link from "next/link";
import { BookOpenIcon, MessageCircleIcon, UsersIcon } from "lucide-react";
import { MarketingPageHeader } from "@/app/(landing)/components/marketing-page-header";
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
      />

      <section className="mx-auto max-w-6xl space-y-12 px-6 py-12 md:px-10 md:py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {channels.map(({ icon: Icon, title, description, status }) => (
            <Card key={title} className="shadow-none">
              <CardHeader>
                <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
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
          <h2 className="mb-6 text-xl font-semibold tracking-tight">Bài viết nổi bật</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {posts.map((post) => (
              <Card key={post.title} className="shadow-none">
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

        <div className="rounded-xl border border-border bg-muted/30 px-6 py-10 text-center md:px-10">
          <h2 className="text-xl font-semibold tracking-tight">Tham gia danh sách chờ cộng đồng</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Để lại email khi đăng ký tài khoản — chúng tôi mời bạn vào kênh Discord và newsletter
            đầu tiên.
          </p>
          <Link href="/register" className={cn(buttonVariants({ size: "lg" }), "mt-6")}>
            Đăng ký Wokki
          </Link>
        </div>
      </section>
    </>
  );
}
