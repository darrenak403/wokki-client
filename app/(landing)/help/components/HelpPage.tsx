import Link from "next/link";
import { MarketingPageHeader } from "@/app/(landing)/about/components/MarketingPageHeader";
import Register from "@/app/(landing)/components/Register";
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
        eyebrow="Tìm câu trả lời nhanh cho những việc thường gặp khi triển khai lịch ca, chấm công và đổi ca."
      />

      <section className="mx-auto max-w-7xl space-y-20 px-6 py-16 md:px-10 md:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <span className="inline-block rounded-full border border-neutral-300 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
              FAQ
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-neutral-900 md:text-5xl dark:text-white">
              Câu hỏi thường gặp.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
              Các câu trả lời được viết theo ngôn ngữ vận hành, ngắn gọn và dễ áp dụng cho đội
              quản lý chi nhánh.
            </p>
          </div>
          <div className="divide-y overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900">
            {faqs.map((item) => (
              <details key={item.q} className="group px-5 py-4">
                <summary className="cursor-pointer list-none text-sm font-semibold text-neutral-900 marker:content-none dark:text-white [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center justify-between gap-2">
                    {item.q}
                    <span className="text-[#4C88C6] transition-transform group-open:rotate-180">
                      ▾
                    </span>
                  </span>
                </summary>
                <p className="mt-3 pb-1 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-8 text-center">
            <span className="inline-block rounded-full border border-neutral-300 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
              Theo vai trò
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-neutral-900 md:text-5xl dark:text-white">
              Hướng dẫn theo chủ đề.
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {topics.map((topic) => (
              <Card
                key={topic.title}
                className="border-neutral-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#4C88C6]/10 dark:border-neutral-800 dark:bg-neutral-900"
              >
                <CardHeader>
                  <CardTitle className="text-lg">{topic.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-neutral-500 dark:text-neutral-400">
                    {topic.items.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#4C88C6]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card className="border-[#BCE8F5]/40 bg-[#EEF6FB] shadow-none dark:border-[#4C88C6]/30 dark:bg-[#0B1E3D]">
          <CardHeader>
            <CardTitle className="text-2xl text-neutral-900 dark:text-white">
              Vẫn cần hỗ trợ?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-neutral-600 dark:text-neutral-300">
            <p>
              Email:{" "}
              <a
                href="mailto:support@wokki.app"
                className="font-semibold text-neutral-900 hover:underline dark:text-white"
              >
                support@wokki.app
              </a>
            </p>
            <p>Giờ làm việc: Thứ 2 - Thứ 6, 9:00-18:00 (GMT+7).</p>
            <Link
              href="/#dang-ky"
              className={cn(
                buttonVariants({ size: "sm" }),
                "bg-gradient-to-r from-[#102854] via-[#4C88C6] to-[#1D4D8F]"
              )}
            >
              Tạo tài khoản và thử ngay
            </Link>
          </CardContent>
        </Card>
      </section>
      <Register />
    </>
  );
}
