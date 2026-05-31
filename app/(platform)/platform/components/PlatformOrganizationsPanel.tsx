"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePlatformOrganizationsQuery } from "@/hooks/usePlatformOrganizations";
import { PlatformOrgSubscriptionDialog } from "@/app/(platform)/platform/components/PlatformOrgSubscriptionDialog";
import type { PlatformOrganizationResponse, SubscriptionStatus } from "@/types/platform";

const STATUS_LABEL: Record<SubscriptionStatus, string> = {
  NotActivated: "Chưa có gói",
  Active: "Đang hoạt động",
  Expired: "Hết hạn",
  Disabled: "Đã tắt",
};

function statusVariant(status: SubscriptionStatus): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "Active":
      return "default";
    case "Expired":
      return "destructive";
    case "Disabled":
      return "secondary";
    default:
      return "outline";
  }
}

export function PlatformOrganizationsPanel() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<PlatformOrganizationResponse | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data, isLoading, isError } = usePlatformOrganizationsQuery({
    page: 1,
    pageSize: 50,
    search: search.trim() || undefined,
  });

  const items = useMemo(() => data?.items ?? [], [data?.items]);

  const openDialog = (org: PlatformOrganizationResponse) => {
    setSelected(org);
    setDialogOpen(true);
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Tổ chức & gói sử dụng</h2>
          <p className="text-sm text-muted-foreground">
            Bật hoặc gia hạn gói — nhập số ngày (vd. 50). Hết hạn thì mọi user trong org không vào
            app.
          </p>
        </div>
        <Input
          className="max-w-xs"
          placeholder="Tìm tên org…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Tìm tổ chức"
        />
      </div>

      {isError ? (
        <p className="text-sm text-destructive">Không tải được danh sách tổ chức.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tổ chức</TableHead>
                <TableHead>Gói</TableHead>
                <TableHead>Hết hạn</TableHead>
                <TableHead className="text-right">User</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Đang tải…
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Không có tổ chức.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((org) => (
                  <TableRow key={org.id}>
                    <TableCell className="font-medium">{org.name}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(org.subscriptionStatus)}>
                        {STATUS_LABEL[org.subscriptionStatus]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {org.subscriptionExpiresAt
                        ? format(parseISO(org.subscriptionExpiresAt), "dd/MM/yyyy", {
                            locale: vi,
                          })
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">{org.userCount}</TableCell>
                    <TableCell className="text-right">
                      <Button type="button" size="sm" variant="outline" onClick={() => openDialog(org)}>
                        {org.subscriptionStatus === "Active" ? "Gia hạn" : "Bật / gói"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <PlatformOrgSubscriptionDialog
        org={selected}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </section>
  );
}
