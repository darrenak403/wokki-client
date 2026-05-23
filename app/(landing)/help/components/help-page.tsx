import Link from "next/link";
import { MarketingPageHeader } from "@/app/(landing)/about/components/marketing-page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "Wokki phù hợp loại hình nào?",
    a: "Retail, F&B, dịch vụ theo ca — từ quán nhỏ đến chuỗi nhiều chi nhánh. Cần lịch tuần, chấm công và đổi ca có quy trình.",
  },
  {
    q: "Nhân viên xem lịch ở đâu?",
    a: "Sau khi quản lý xuất bản lịch, nhân viên đăng nhập và xem ca trong mục lịch cá nhân — tới 28 ngày tới.",
  },
  {
    q: "Đổi ca hoạt động thế nào?",
    a: "Nhân viên gửi yêu cầu đổi với đồng nghiệp; đối tác accept/decline. Quản lý có thể override khi cần.",
  },
  {
    q: "Có hỗ trợ xuất báo cáo lương không?",
    a: "Gói Business trở lên có tổng hợp lương; Admin có thể Export CSV theo phòng ban và kỳ.",
  },
  {
    q: "Dữ liệu lưu ở đâu?",
    a: "Lưu trữ trên hạ tầng đám mây với sao lưu định kỳ. Chi tiết bảo mật có trong hợp đồng gói Enterprise.",
  },
] as const;

const topics = [
  {
    title: "Bắt đầu",
    items: ["Tạo chi nhánh & phòng ban", "Thêm nhân viên", "Tạo ca mẫu", "Xuất bản lịch tuần đầu"],
  },
  {
    title: "Quản lý",
    items: ["Gợi ý phân ca", "Duyệt đổi ca", "Điều chỉnh chấm công", "Tổng hợp lương"],
  },
  { title: "Nhân viên", items: ["Xem lịch", "Đổi ca", "Chấm vào / ra", "Chat đội"] },
] as const;

export function HelpPage() {
  return (
    <>
      <MarketingPageHeader
        badge="Trợ giúp"
        title="Trung tâm trợ giúp"
        description="Câu hỏi thường gặp, hướng dẫn theo vai trò và kênh liên hệ khi bạn cần hỗ trợ thêm."
      />

      <section className="mx-auto max-w-6xl space-y-12 px-6 py-12 md:px-10 md:py-16">
        <div>
          <h2 className="mb-4 text-xl font-semibold tracking-tight">Câu hỏi thường gặp</h2>
          <div className="divide-y rounded-xl border border-border">
            {faqs.map((item) => (
              <details key={item.q} className="group px-4 py-3">
                <summary className="cursor-pointer list-none text-sm font-medium marker:content-none [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center justify-between gap-2">
                    {item.q}
                    <span className="text-muted-foreground transition-transform group-open:rotate-180">
                      ▾
                    </span>
                  </span>
                </summary>
                <p className="mt-2 pb-1 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
              </details>
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-6 text-xl font-semibold tracking-tight">Hướng dẫn theo chủ đề</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {topics.map((topic) => (
              <Card key={topic.title} className="shadow-none">
                <CardHeader>
                  <CardTitle className="text-base">{topic.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                    {topic.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card className="border-dashed bg-muted/20 shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Vẫn cần hỗ trợ?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Email:{" "}
              <a
                href="mailto:support@wokki.app"
                className="font-medium text-foreground hover:underline"
              >
                support@wokki.app
              </a>
            </p>
            <p>Giờ làm việc: Thứ 2 – Thứ 6, 9:00–18:00 (GMT+7).</p>
            <Link href="/register" className={cn(buttonVariants({ size: "sm" }))}>
              Tạo tài khoản và thử ngay
            </Link>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
