"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";

export type ChartDatum = {
  date: string;
  value: number;
  eventType?: string;
};

type TrendChartProps = {
  title: string;
  data?: ChartDatum[];
  variant?: "line" | "bar";
  color?: string;
  isLoading?: boolean;
  isError?: boolean;
  emptyLabel?: string;
  errorLabel?: string;
  height?: number;
  className?: string;
};

export function TrendChart({
  title,
  data,
  variant = "line",
  color = "#1d4ed8",
  isLoading,
  isError,
  emptyLabel = "Chưa có dữ liệu.",
  errorLabel = "Không tải được biểu đồ.",
  height = 256,
  className,
}: TrendChartProps) {
  const hasData = !isLoading && !isError && (data?.length ?? 0) > 0;

  return (
    <div
      className={cn(
        "rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900",
        className
      )}
    >
      <h3 className="font-medium">{title}</h3>

      <div className="mt-3" style={{ height }}>
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
            {variant === "bar" ? (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} />
              </LineChart>
            )}
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
