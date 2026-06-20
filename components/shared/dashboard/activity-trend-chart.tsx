"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";

export type ActivitySeries = {
  key: string;
  label: string;
  color: string;
  emphasize?: boolean;
};

export type ActivityChartDatum = { date: string } & Record<string, number | string>;

type ActivityTrendChartProps = {
  data: ActivityChartDatum[];
  series: ActivitySeries[];
  isLoading?: boolean;
  isError?: boolean;
  emptyLabel?: string;
  errorLabel?: string;
  height?: number;
  className?: string;
};

export function ActivityTrendChart({
  data,
  series,
  isLoading,
  isError,
  emptyLabel = "Chưa có dữ liệu.",
  errorLabel = "Không tải được biểu đồ.",
  height = 280,
  className,
}: ActivityTrendChartProps) {
  const hasData = !isLoading && !isError && data.length > 0;

  return (
    <div className={cn("", className)} style={{ height }}>
      {isLoading ? (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          Đang tải…
        </div>
      ) : isError ? (
        <div className="flex h-full items-center justify-center text-sm text-destructive">
          {errorLabel}
        </div>
      ) : !hasData ? (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          {emptyLabel}
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11 }}
              label={{ value: "Lượt", angle: -90, position: "insideLeft", fontSize: 11 }}
            />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {series.map((s) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={s.color}
                strokeWidth={s.emphasize ? 2.5 : 1.5}
                dot={{ r: s.emphasize ? 4 : 2 }}
                strokeOpacity={s.emphasize ? 1 : 0.55}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
