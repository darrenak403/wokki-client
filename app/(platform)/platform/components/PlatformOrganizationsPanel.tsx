"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  formatPlatformDate,
  subscriptionStatusLabel,
  subscriptionStatusVariant,
} from "@/lib/support/platform/format";
import type {
  PlatformOrganizationResponse,
  PlatformOrganizationSortBy,
  PlatformSortDirection,
  SubscriptionStatus,
} from "@/types/platform";

type StatusFilter = "all" | SubscriptionStatus;

type PlatformOrganizationsPanelProps = {
  onOpenLedger?: (org: PlatformOrganizationResponse) => void;
};

export function PlatformOrganizationsPanel({ onOpenLedger }: PlatformOrganizationsPanelProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<PlatformOrganizationSortBy>("createdAt");
  const [sortDirection, setSortDirection] = useState<PlatformSortDirection>("desc");
  const [expiringWithinDays, setExpiringWithinDays] = useState("7");
  const [selected, setSelected] = useState<PlatformOrganizationResponse | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const expiringDays = Number.parseInt(expiringWithinDays, 10);

  const { data, isLoading, isError } = usePlatformOrganizationsQuery({
    page: 1,
    pageSize: 50,
    search: search.trim() || undefined,
    status: status === "all" ? undefined : status,
    sortBy,
    sortDirection,
    expiringWithinDays: Number.isFinite(expiringDays) && expiringDays > 0 ? expiringDays : 7,
  });

  const items = useMemo(() => data?.items ?? [], [data?.items]);

  const openDialog = (org: PlatformOrganizationResponse) => {
    setSelected(org);
    setDialogOpen(true);
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Tổ chức & gói sử dụng</h2>
          <p className="text-sm text-muted-foreground">Quản lý trạng thái gói theo từng tổ chức.</p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <div className="space-y-1">
            <Label htmlFor="platform-org-search" className="text-xs text-muted-foreground">
              Tìm kiếm
            </Label>
            <Input
              id="platform-org-search"
              className="h-8 w-[210px]"
              placeholder="Tên tổ chức"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Trạng thái</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as StatusFilter)}>
              <SelectTrigger className="h-8 w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="NotActivated">Chưa có gói</SelectItem>
                <SelectItem value="Active">Đang hoạt động</SelectItem>
                <SelectItem value="Expired">Hết hạn</SelectItem>
                <SelectItem value="Disabled">Đã tắt</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Sắp xếp</Label>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as PlatformOrganizationSortBy)}>
              <SelectTrigger className="h-8 w-[145px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Ngày tạo</SelectItem>
                <SelectItem value="name">Tên org</SelectItem>
                <SelectItem value="expiryDate">Ngày hết hạn</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Chiều</Label>
            <Select
              value={sortDirection}
              onValueChange={(value) => setSortDirection(value as PlatformSortDirection)}
            >
              <SelectTrigger className="h-8 w-[110px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Giảm dần</SelectItem>
                <SelectItem value="asc">Tăng dần</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="platform-expiring-days" className="text-xs text-muted-foreground">
              Sắp hết hạn
            </Label>
            <Input
              id="platform-expiring-days"
              className="h-8 w-24"
              type="number"
              min={1}
              max={3650}
              value={expiringWithinDays}
              onChange={(e) => setExpiringWithinDays(e.target.value)}
            />
          </div>
        </div>
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
                <TableHead className="text-right">Chi nhánh</TableHead>
                <TableHead className="text-right">Nhân viên</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Đang tải…
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Không có tổ chức.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((org) => (
                  <TableRow key={org.id}>
                    <TableCell>
                      <div className="font-medium">{org.name}</div>
                      <div className="text-xs text-muted-foreground">{org.id}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={subscriptionStatusVariant(org.subscriptionStatus)}>
                        {subscriptionStatusLabel(org.subscriptionStatus)}
                      </Badge>
                      {org.isExpiringSoon ? (
                        <Badge className="ml-1" variant="outline">
                          {org.daysUntilExpiry ?? 0} ngày
                        </Badge>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatPlatformDate(org.subscriptionExpiresAt)}
                    </TableCell>
                    <TableCell className="text-right">{org.userCount}</TableCell>
                    <TableCell className="text-right">{org.locationCount}</TableCell>
                    <TableCell className="text-right">{org.employeeCount}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {onOpenLedger ? (
                          <Button type="button" size="sm" variant="ghost" onClick={() => onOpenLedger(org)}>
                            Ledger
                          </Button>
                        ) : null}
                        <Button type="button" size="sm" variant="outline" onClick={() => openDialog(org)}>
                          {org.subscriptionStatus === "Active" ? "Gia hạn" : "Bật gói"}
                        </Button>
                      </div>
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
