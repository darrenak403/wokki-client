"use client";

import { useEffect, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import {
  ArrowRightLeftIcon,
  LandmarkIcon,
  MapPinIcon,
  UserRoundIcon,
} from "lucide-react";
import { employeeRoleLabel } from "@/app/(app)/[orgId]/[locationId]/admin/employees/components/EmployeeRowActions";
import { EmployeeTransferPanel, employeeDisplayName } from "@/app/(app)/[orgId]/admin/workspace/components/EmployeeTransferPanel";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  SettingsDialogLayout,
  type SettingsDialogNavItem,
} from "@/components/shared/settings-dialog-layout";
import { getInitials } from "@/components/app/app-shell-utils";
import {
  hasEmployeePaymentProfile,
  type EmployeePaymentProfileFields,
} from "@/lib/support/employee/payment-profile";
import { useEmployeeQuery } from "@/hooks/useEmployees";
import type { EmployeeResponse } from "@/types/foundation";

export type EmployeeProfileSection = "profile" | "payment" | "transfer";

type EmployeeProfileDialogProps = {
  employee: EmployeeResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialSection?: EmployeeProfileSection;
  canTransfer?: boolean;
  onTransferred?: () => void;
};

const PANEL_PADDING = "px-6 py-5";

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted/60 px-4 py-2.5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium break-all">{value}</p>
    </div>
  );
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  try {
    return format(parseISO(value), "dd/MM/yyyy", { locale: vi });
  } catch {
    return value;
  }
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("vi-VN").format(value);
}

export function EmployeeProfileDialog({
  employee,
  open,
  onOpenChange,
  initialSection = "profile",
  canTransfer = false,
  onTransferred,
}: EmployeeProfileDialogProps) {
  const [activeSection, setActiveSection] = useState<EmployeeProfileSection>(initialSection);

  const { data: freshEmployee, isLoading } = useEmployeeQuery(open && employee ? employee.id : null);
  const effectiveEmployee = freshEmployee ?? employee;
  const isTerminated = Boolean(effectiveEmployee?.terminatedAt);
  const showTransfer = canTransfer && !isTerminated;

  useEffect(() => {
    if (!open) return;
    setActiveSection(initialSection === "transfer" && !showTransfer ? "profile" : initialSection);
  }, [open, initialSection, showTransfer]);

  const navItems = useMemo((): SettingsDialogNavItem<EmployeeProfileSection>[] => {
    const items: SettingsDialogNavItem<EmployeeProfileSection>[] = [
      { id: "profile", label: "Hồ sơ", icon: UserRoundIcon },
      { id: "payment", label: "Thanh toán", icon: LandmarkIcon },
    ];
    if (showTransfer) {
      items.push({ id: "transfer", label: "Điều chuyển", icon: ArrowRightLeftIcon });
    }
    return items;
  }, [showTransfer]);

  if (!effectiveEmployee) return null;

  const paymentProfile: EmployeePaymentProfileFields = {
    bankName: effectiveEmployee.bankName,
    bankAccountHolderName: effectiveEmployee.bankAccountHolderName,
    bankAccountNumber: effectiveEmployee.bankAccountNumber,
    paymentQrImageUrl: effectiveEmployee.paymentQrImageUrl,
  };
  const paymentConfigured = hasEmployeePaymentProfile(paymentProfile);
  const displayName = employeeDisplayName(effectiveEmployee);

  const handleTransferred = () => {
    onTransferred?.();
    onOpenChange(false);
  };

  return (
    <SettingsDialogLayout
      open={open}
      onOpenChange={onOpenChange}
      title={displayName}
      description="Hồ sơ nhân viên, thanh toán và điều chuyển."
      initialSection={initialSection}
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      navItems={navItems}
      headerMeta={
        <div className="rounded-xl border border-neutral-200/80 bg-white px-3 py-2.5 dark:border-neutral-700 dark:bg-neutral-900">
          <div className="flex items-center gap-2.5">
            <Avatar size="sm" className="size-9 bg-[#EEF6FB] text-xs font-semibold text-[#1D4D8F]">
              <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{displayName}</p>
              <p className="truncate text-xs text-muted-foreground">{effectiveEmployee.email}</p>
            </div>
          </div>
        </div>
      }
    >
      {activeSection === "profile" ? (
        <div className={PANEL_PADDING}>
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold">Hồ sơ nhân viên</h2>
            {isTerminated ? <Badge variant="destructive">Đã nghỉ</Badge> : <Badge variant="default">Đang làm</Badge>}
            <Badge variant="outline">{employeeRoleLabel(effectiveEmployee.role)}</Badge>
          </div>

          {isLoading ? (
            <p className="text-sm text-muted-foreground">Đang tải…</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <ReadOnlyField label="Họ" value={effectiveEmployee.lastName || "—"} />
              <ReadOnlyField label="Tên" value={effectiveEmployee.firstName || "—"} />
              <ReadOnlyField label="Email" value={effectiveEmployee.email} />
              <ReadOnlyField label="Số điện thoại" value={effectiveEmployee.phone?.trim() || "—"} />
              <ReadOnlyField label="Chức vụ" value={effectiveEmployee.position?.trim() || "—"} />
              <ReadOnlyField
                label="Lương theo giờ"
                value={`${formatCurrency(effectiveEmployee.hourlyRate)} đ/giờ`}
              />
              <ReadOnlyField label="Chi nhánh" value={effectiveEmployee.locationName ?? "—"} />
              <ReadOnlyField label="Phòng ban" value={effectiveEmployee.departmentName ?? "—"} />
              <ReadOnlyField
                label="Ngày vào làm"
                value={formatDate(effectiveEmployee.employedAt)}
              />
              {isTerminated ? (
                <ReadOnlyField
                  label="Ngày nghỉ"
                  value={formatDate(effectiveEmployee.terminatedAt)}
                />
              ) : null}
            </div>
          )}

          {effectiveEmployee.locationName && effectiveEmployee.departmentName ? (
            <p className="mt-4 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPinIcon className="size-3.5 shrink-0" />
              {effectiveEmployee.locationName} / {effectiveEmployee.departmentName}
            </p>
          ) : null}
        </div>
      ) : null}

      {activeSection === "payment" ? (
        <div className={PANEL_PADDING}>
          <div className="mb-5">
            <h2 className="text-lg font-semibold">Tài khoản nhận lương</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Thông tin do nhân viên tự cập nhật trong Cài đặt tài khoản.
            </p>
          </div>

          <Badge variant={paymentConfigured ? "default" : "outline"} className="mb-4">
            {paymentConfigured ? "Đã thiết lập" : "Chưa thiết lập"}
          </Badge>

          {paymentConfigured ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {paymentProfile.bankName?.trim() ? (
                <ReadOnlyField label="Ngân hàng" value={paymentProfile.bankName.trim()} />
              ) : null}
              {paymentProfile.bankAccountHolderName?.trim() ? (
                <ReadOnlyField
                  label="Chủ tài khoản"
                  value={paymentProfile.bankAccountHolderName.trim()}
                />
              ) : null}
              {paymentProfile.bankAccountNumber?.trim() ? (
                <ReadOnlyField label="Số tài khoản" value={paymentProfile.bankAccountNumber.trim()} />
              ) : null}
              {paymentProfile.paymentQrImageUrl ? (
                <div className="sm:col-span-2">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">Mã QR</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={paymentProfile.paymentQrImageUrl}
                    alt="QR thanh toán"
                    className="max-h-48 rounded-xl border bg-white object-contain p-2"
                  />
                </div>
              ) : null}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              Nhân viên chưa cập nhật STK hoặc QR nhận lương.
            </p>
          )}
        </div>
      ) : null}

      {activeSection === "transfer" && showTransfer ? (
        <div className={PANEL_PADDING}>
          <div className="mb-5">
            <h2 className="text-lg font-semibold">Điều chuyển nhân viên</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Chuyển {displayName} sang chi nhánh hoặc phòng ban khác.
            </p>
          </div>
          <EmployeeTransferPanel
            key={effectiveEmployee.id}
            employee={effectiveEmployee}
            onTransferred={handleTransferred}
          />
        </div>
      ) : null}
    </SettingsDialogLayout>
  );
}
