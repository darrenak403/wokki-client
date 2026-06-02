"use client";

import { RefreshCwIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePlatformHealthQuery } from "@/hooks/usePlatformOrganizations";
import { formatPlatformDateTime } from "@/lib/support/platform/format";

function healthVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  if (status === "Healthy" || status === "Connected" || status === "Configured") return "default";
  if (status === "Degraded" || status === "Throttled" || status === "NotConfigured") return "secondary";
  if (status === "Failed" || status === "Disconnected" || status === "Unhealthy") {
    return "destructive";
  }
  return "outline";
}

function componentNameLabel(name: string): string {
  switch (name) {
    case "api":
      return "API";
    case "bedrock":
      return "Bedrock";
    case "email":
      return "Email";
    default:
      return name;
  }
}

export function PlatformHealthPanel() {
  const query = usePlatformHealthQuery();
  const health = query.data;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">System Health</h2>
          <p className="text-sm text-muted-foreground">Trạng thái API và dependency platform.</p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => void query.refetch()}
          disabled={query.isFetching}
        >
          <RefreshCwIcon className="size-4" />
          Làm mới
        </Button>
      </div>

      {query.isError ? (
        <p className="text-sm text-destructive">Không tải được health platform.</p>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3 rounded-lg border px-4 py-3">
            <span className="text-sm text-muted-foreground">Overall</span>
            <Badge variant={healthVariant(health?.status ?? "Unknown")}>{health?.status ?? "…"}</Badge>
            <span className="text-sm text-muted-foreground">
              {formatPlatformDateTime(health?.checkedAtUtc)}
            </span>
          </div>

          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Component</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Checked</TableHead>
                  <TableHead>Lỗi gần nhất</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {query.isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      Đang tải…
                    </TableCell>
                  </TableRow>
                ) : health?.components.length ? (
                  health.components.map((component) => (
                    <TableRow key={component.name}>
                      <TableCell className="font-medium">{componentNameLabel(component.name)}</TableCell>
                      <TableCell>
                        <Badge variant={healthVariant(component.status)}>{component.status}</Badge>
                      </TableCell>
                      <TableCell>{formatPlatformDateTime(component.checkedAtUtc)}</TableCell>
                      <TableCell>
                        {component.lastFailure.lastFailureCode ? (
                          <div className="max-w-xl">
                            <div className="font-medium">
                              {component.lastFailure.lastFailureCode}
                            </div>
                            <div className="truncate text-xs text-muted-foreground">
                              {component.lastFailure.lastFailureMessage}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatPlatformDateTime(component.lastFailure.lastFailureAtUtc)}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      Chưa có component.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </section>
  );
}
