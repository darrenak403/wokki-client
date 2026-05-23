import { MarketingPageHeader } from "@/app/(landing)/about/components/MarketingPageHeader";
import Conclusion from "@/app/(landing)/components/Conclusion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const values = [
  {
    title: "Minh bạch",
    text: "Lịch và công hiển thị giống nhau cho quản lý và nhân viên — giảm hiểu nhầm và tranh chấp.",
  },
  {
    title: "Tôn trọng thời gian",
    text: "Luồng đổi ca và chấm công ngắn gọn — không thêm thao tác chỉ để “đủ báo cáo”.",
  },
  {
    title: "Mở rộng dần",
    text: "Bắt đầu từ một chi nhánh, mở rộng khi doanh nghiệp lớn — không ép migrate sang hệ khác.",
  },
] as const;

const milestones = [
  { year: "2024", event: "Ý tưởng Wokki — giải quyết lịch ca bằng spreadsheet cho F&B." },
  { year: "2025", event: "Ra mắt lịch tuần, xuất bản lịch, chấm công và đổi ca." },
  { year: "2026", event: "Ra mắt chat, payroll summary và onboarding đa chi nhánh." },
] as const;

export function AboutPage() {
  return (
    <>
      <MarketingPageHeader
        badge="Về chúng tôi"
        title="Wokki được xây cho người vận hành thật"
        description="Đội ngũ kết hợp kinh nghiệm sản phẩm và vận hành chuỗi — hiểu áp lực cuối tuần khi còn thiếu người ca."
        eyebrow="Từ spreadsheet, nhóm chat, đến một nền tảng ca làm rõ ràng cho cả quản lý và nhân viên."
      />

      <section className="mx-auto max-w-7xl space-y-20 px-6 py-16 md:px-10 md:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <span className="inline-block rounded-full border border-neutral-300 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
              Lý do bắt đầu
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-neutral-900 md:text-5xl dark:text-white">
              Một tuần vận hành tốt bắt đầu từ một lịch ca đáng tin.
            </h2>
          </div>
          <div className="space-y-5 text-neutral-600 dark:text-neutral-400">
            <p className="text-base leading-relaxed md:text-lg">
            Wokki ra đời từ câu hỏi đơn giản: tại sao lịch làm việc — thứ ảnh hưởng trực tiếp đến
            thu nhập và đời sống nhân viên — lại nằm rải rác trong chat, file Excel và sổ chấm công?
            </p>
            <p className="leading-relaxed">
            Chúng tôi tin công nghệ phải phục vụ người quản lý chi nhánh và nhân viên ca, không
            ngược lại. Mỗi tính năng được đánh giá bằng: có giúp tuần vận hành nhẹ hơn không?
            </p>
          </div>
        </div>

        <div>
          <div className="mb-8 text-center">
            <span className="inline-block rounded-full border border-neutral-300 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
              Giá trị cốt lõi
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-neutral-900 md:text-5xl dark:text-white">
              Công cụ nhỏ hơn, niềm tin lớn hơn.
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {values.map((item) => (
              <Card
                key={item.title}
                className="border-neutral-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#4C88C6]/10 dark:border-neutral-800 dark:bg-neutral-900"
              >
                <CardHeader>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                    {item.text}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-neutral-100 p-6 md:p-10 dark:bg-neutral-900">
          <h2 className="mb-8 text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Hành trình
          </h2>
          <ol className="grid gap-5 md:grid-cols-3">
            {milestones.map((item) => (
              <li key={item.year} className="rounded-2xl bg-white p-5 dark:bg-neutral-950">
                <p className="bg-gradient-to-r from-[#102854] via-[#4C88C6] to-[#1D4D8F] bg-clip-text text-3xl font-extrabold text-transparent">
                  {item.year}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                  {item.event}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <Conclusion />
    </>
  );
}
