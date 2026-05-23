import { cn } from "@/lib/utils";
import {
  IconClockHour4,
  IconAlertTriangle,
  IconTrendingDown,
  IconMoodSmile,
  IconChartPie,
  IconCurrencyDollar,
  IconUsers,
  IconRocket,
} from "@tabler/icons-react";

function highlightNumbers(title: string) {
  const parts = title.split(/([\d,.]+[%x+]?)/);
  return parts.map((part, i) =>
    /[\d,.]+[%x+]?/.test(part) ? (
      <span
        key={i}
        className="relative inline-block bg-gradient-to-r from-[#102854] via-[#4C88C6] to-[#1D4D8F] bg-clip-text text-transparent"
      >
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

const features = [
  {
    title: "Tiết kiệm 85% thời gian xếp ca",
    description:
      "AI tự động phân ca trong vài giây — quản lý không còn mất hàng giờ mỗi tuần để lập lịch thủ công.",
    icon: <IconClockHour4 />,
  },
  {
    title: "Giảm 95% sai sót phân ca",
    description:
      "Loại bỏ trùng ca, thiếu người giờ cao điểm — hệ thống ràng buộc cứng đảm bảo không bao giờ sai sót.",
    icon: <IconAlertTriangle />,
  },
  {
    title: "Giảm 40% chi phí nhân sự",
    description:
      "Tối ưu hoá số giờ công, giảm lãng phí nhân lực và kiểm soát chi phí làm thêm giờ hiệu quả.",
    icon: <IconCurrencyDollar />,
  },
  {
    title: "Tăng 3x tốc độ lấp ca trống",
    description:
      "Sàn đổi ca + AI Matchmaking giúp tìm người thay thế tức thì — không còn ca bị bỏ trống.",
    icon: <IconRocket />,
  },
  {
    title: "323,000+ cửa hàng F&B",
    description:
      "Thị trường mục tiêu lớn với hơn 323 ngàn cửa hàng F&B tại Việt Nam — tất cả đều cần quản lý ca.",
    icon: <IconUsers />,
  },
  {
    title: "Tỷ lệ nghỉ việc giảm 60%",
    description:
      "Phân ca công bằng, minh bạch và tôn trọng sở thích — nhân viên hài lòng hơn, gắn bó lâu hơn.",
    icon: <IconTrendingDown />,
  },
  {
    title: "98% nhân viên hài lòng",
    description:
      "Tự chủ đổi ca, xem lương real-time và giao tiếp trực tiếp trong app — trải nghiệm nhân viên số 1.",
    icon: <IconMoodSmile />,
  },
  {
    title: "ROI sau 6 tháng",
    description:
      "Tiết kiệm 30–50% chi phí hành chính, hoàn vốn chỉ sau 6-8 tháng triển khai nền tảng.",
    icon: <IconChartPie />,
  },
];

export default function FeaturesGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 relative z-10 py-10 max-w-7xl mx-auto">
      {features.map((feature, index) => (
        <Feature key={feature.title} {...feature} index={index} />
      ))}
    </div>
  );
}

const Feature = ({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}) => {
  return (
    <div
      className={cn(
        "flex flex-col lg:border-r py-10 relative group/feature border-neutral-200 dark:border-neutral-800 transition-all duration-300",
        (index === 0 || index === 4) && "lg:border-l",
        index < 4 && "lg:border-b"
      )}
    >
      {/* Hover background gradient */}
      {index < 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-300 absolute inset-0 h-full w-full bg-gradient-to-t from-[#EEF6FB]/80 via-[#EEF6FB]/30 to-transparent dark:from-[#0B1E3D]/40 dark:via-[#0B1E3D]/10 pointer-events-none" />
      )}
      {index >= 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-300 absolute inset-0 h-full w-full bg-gradient-to-b from-[#EEF6FB]/80 via-[#EEF6FB]/30 to-transparent dark:from-[#0B1E3D]/40 dark:via-[#0B1E3D]/10 pointer-events-none" />
      )}

      {/* Icon */}
      <div className="mb-4 relative z-10 px-10 text-neutral-400 group-hover/feature:text-[#4C88C6] transition-colors duration-300">
        {icon}
      </div>

      {/* Title with accent bar */}
      <div className="text-lg font-bold mb-2 relative z-10 px-10">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-neutral-300 dark:bg-neutral-700 group-hover/feature:bg-gradient-to-b group-hover/feature:from-[#102854] group-hover/feature:to-[#4C88C6] transition-all duration-300 origin-center" />
        <span className="group-hover/feature:translate-x-2 transition duration-300 inline-block text-neutral-800 dark:text-neutral-100 group-hover/feature:text-[#102854] dark:group-hover/feature:text-[#BCE8F5]">
          {highlightNumbers(title)}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-xs relative z-10 px-10 group-hover/feature:text-neutral-700 dark:group-hover/feature:text-neutral-200 transition-colors duration-300">
        {description}
      </p>
    </div>
  );
};
