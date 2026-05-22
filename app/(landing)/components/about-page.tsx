import { MarketingPageHeader } from "@/app/(landing)/components/marketing-page-header";
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
        title="Chúng tôi xây Wokki cho người vận hành thật"
        description="Đội ngũ kết hợp kinh nghiệm sản phẩm và vận hành chuỗi — hiểu áp lực cuối tuần khi còn thiếu người ca."
      />

      <section className="mx-auto max-w-6xl space-y-16 px-6 py-12 md:px-10 md:py-16">
        <div className="max-w-3xl space-y-4 text-muted-foreground">
          <p className="text-base leading-relaxed md:text-lg">
            Wokki ra đời từ câu hỏi đơn giản: tại sao lịch làm việc — thứ ảnh hưởng trực tiếp đến
            thu nhập và đời sống nhân viên — lại nằm rải rác trong chat, file Excel và sổ chấm
            công?
          </p>
          <p className="leading-relaxed">
            Chúng tôi tin công nghệ phải phục vụ người quản lý chi nhánh và nhân viên ca, không
            ngược lại. Mỗi tính năng được đánh giá bằng: có giúp tuần vận hành nhẹ hơn không?
          </p>
        </div>

        <div>
          <h2 className="mb-6 text-xl font-semibold tracking-tight">Giá trị cốt lõi</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {values.map((item) => (
              <Card key={item.title} className="shadow-none">
                <CardHeader>
                  <CardTitle className="text-base">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-muted-foreground">{item.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-6 text-xl font-semibold tracking-tight">Hành trình</h2>
          <ol className="space-y-4 border-l border-border pl-6">
            {milestones.map((item) => (
              <li key={item.year} className="relative">
                <span className="absolute -left-[1.6rem] top-1 flex size-2.5 rounded-full bg-primary" />
                <p className="text-sm font-medium text-foreground">{item.year}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.event}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
