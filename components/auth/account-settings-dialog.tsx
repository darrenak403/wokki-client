"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import {
  ChevronRightIcon,
  LockKeyholeIcon,
  LogOutIcon,
  MenuIcon,
  MonitorIcon,
  MoonIcon,
  SunIcon,
  UserRoundIcon,
  WalletIcon,
  LandmarkIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { z } from "zod";
import { toast } from "sonner";
import { fetchAuth } from "@/lib/api/services/fetchAuth";
import { fetchSelf } from "@/lib/api/services/fetchSelf";
import { mapAuthError, mapAuthResponseFailure } from "@/lib/support/auth/map-auth-error";
import {
  formatSubscriptionDaysLabel,
  formatSubscriptionDaysRemaining,
  SUBSCRIPTION_STATUS_LABEL,
} from "@/lib/support/org/subscription";
import { useOrgSubscriptionQuery } from "@/hooks/useOrgSubscription";
import { useQueryClient } from "@tanstack/react-query";
import { employeeKeys } from "@/lib/api/query-keys";
import {
  isNoEmployeeError,
  useMyProfileQuery,
  useUpdateMyProfileMutation,
} from "@/hooks/useMyProfile";
import { useIsMobile } from "@/hooks/useMobile";
import { mapEmployeeError } from "@/lib/support/employee/map-errors";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { clearMustChangePassword, selectAppRole } from "@/lib/redux/slices/authSlice";
import { ROLE_USER } from "@/lib/types/roles";
import { getInitials } from "@/components/app/app-shell-utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  SETTINGS_PAIR_GAP_CLASS,
  SETTINGS_PAIR_HEIGHT_CLASS,
  SETTINGS_PAIR_MAIN_PANEL_CLASS,
  SETTINGS_PAIR_MAX_WIDTH_CLASS,
  SETTINGS_PAIR_PAYMENT_PANEL_CLASS,
  SETTINGS_PAIR_PANEL_SURFACE_CLASS,
} from "@/components/auth/account-settings-pair-layout";
import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { MaskedInput } from "@/components/ui/masked-input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { OrgSubscriptionStatus } from "@/types/stats";

/* ── Design tokens (settings dialog) ── */
/** Fixed body height — sized for tallest tab (profile); tabs with less content leave whitespace below. */
const DIALOG_BODY_CLASS = "relative flex h-full min-h-0 flex-col sm:flex-row";
const SIDEBAR_CLASS =
  "flex h-full min-h-0 w-full flex-col bg-neutral-100 px-4 py-5 max-sm:absolute max-sm:inset-0 max-sm:z-30 sm:w-[220px] sm:shrink-0 sm:border-r sm:border-neutral-200/80 dark:bg-neutral-900/80 dark:sm:border-neutral-800";
const PANEL_CLASS =
  "relative flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-white dark:bg-neutral-950";
const INPUT_CLASS =
  "h-11 rounded-xl border-0 bg-neutral-100 shadow-none placeholder:text-neutral-500 focus-visible:ring-2 focus-visible:ring-neutral-300/80 dark:bg-neutral-800/80 dark:placeholder:text-neutral-400 dark:focus-visible:ring-neutral-600";
const BTN_PRIMARY =
  "h-10 rounded-xl bg-neutral-900 px-5 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white";
const BTN_SECONDARY =
  "h-10 rounded-xl border-0 bg-neutral-100 px-5 text-sm font-medium text-neutral-800 hover:bg-neutral-200/80 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
    newPassword: z.string().min(8, "Mật khẩu mới tối thiểu 8 ký tự"),
    confirmNewPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu mới"),
  })
  .refine((v) => v.newPassword === v.confirmNewPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmNewPassword"],
  });

const profileSchema = z.object({
  lastName: z.string().min(1, "Vui lòng nhập họ").max(100),
  firstName: z.string().min(1, "Vui lòng nhập tên").max(100),
  phone: z.string().max(32).optional(),
});

const paymentProfileSchema = z.object({
  bankName: z.string().max(200).optional(),
  bankAccountHolderName: z.string().max(200).optional(),
  bankAccountNumber: z.string().max(32).optional(),
});

type PasswordFormValues = z.infer<typeof passwordSchema>;
type ProfileFormValues = z.infer<typeof profileSchema>;
type PaymentProfileFormValues = z.infer<typeof paymentProfileSchema>;
type SettingsSection = "profile" | "security" | "theme" | "subscription";

export type AccountSettingsSection = SettingsSection;

const NAV_ITEMS: {
  id: SettingsSection;
  label: string;
  icon: typeof UserRoundIcon;
}[] = [
  { id: "profile", label: "Hồ sơ cá nhân", icon: UserRoundIcon },
  { id: "security", label: "Đặt lại mật khẩu", icon: LockKeyholeIcon },
  { id: "theme", label: "Giao diện", icon: MonitorIcon },
  { id: "subscription", label: "Gói sử dụng", icon: WalletIcon },
];

const THEME_OPTIONS = [
  { value: "light", label: "Sáng", description: "Nền sáng, dễ đọc ban ngày", icon: SunIcon },
  { value: "dark", label: "Tối", description: "Nền tối, thoải mái ban đêm", icon: MoonIcon },
  {
    value: "system",
    label: "Theo hệ thống",
    description: "Tự động theo thiết bị",
    icon: MonitorIcon,
  },
] as const;

function subscriptionStatusVariant(
  status: OrgSubscriptionStatus
): "default" | "secondary" | "destructive" | "outline" {
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

type AccountSettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userEmail?: string | null;
  initialSection?: SettingsSection;
  onLogout?: () => void | Promise<void>;
};

export function AccountSettingsDialog({
  open,
  onOpenChange,
  userEmail,
  initialSection = "profile",
  onLogout,
}: AccountSettingsDialogProps) {
  const dispatch = useAppDispatch();
  const role = useAppSelector(selectAppRole);
  const [activeSection, setActiveSection] = useState<SettingsSection>(initialSection);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [paymentProfileOpen, setPaymentProfileOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  useEffect(() => {
    if (open) {
      const section =
        initialSection === "subscription" && role === ROLE_USER ? "profile" : initialSection;
      setActiveSection(section);
      setMobileSidebarOpen(false);
    }
  }, [open, initialSection, role]);

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
    if (!next) {
      form.reset();
      setError(null);
      setPaymentProfileOpen(false);
      setMobileSidebarOpen(false);
      const section =
        initialSection === "subscription" && role === ROLE_USER ? "profile" : initialSection;
      setActiveSection(section);
    }
  };

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await fetchAuth.resetPassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmNewPassword: values.confirmNewPassword,
      });
      if (!response.success) {
        setError(mapAuthResponseFailure(response));
        return;
      }
      dispatch(clearMustChangePassword());
      toast.success("Đổi mật khẩu thành công");
      form.reset();
      onOpenChange(false);
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  });

  const visibleNavItems =
    role === ROLE_USER ? NAV_ITEMS.filter((item) => item.id !== "subscription") : NAV_ITEMS;

  const isMobile = useIsMobile();
  const showPaymentPanel = open && paymentProfileOpen && activeSection === "profile";
  const showDesktopPaymentPanel = showPaymentPanel && !isMobile;
  const activeNavLabel =
    visibleNavItems.find((item) => item.id === activeSection)?.label ?? "Cài đặt";

  const selectSection = (section: SettingsSection) => {
    setActiveSection(section);
    if (isMobile) setMobileSidebarOpen(false);
  };

  const settingsPanelRef = useRef<HTMLDivElement>(null);

  const closePaymentProfile = (nextOpen: boolean) => {
    if (nextOpen) return;
    setPaymentProfileOpen(false);
    requestAnimationFrame(() => {
      settingsPanelRef.current?.focus({ preventScroll: true });
    });
  };

  const handleLogout = async () => {
    if (!onLogout || isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await onLogout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const settingsDialogInner = (
    <>
      <DialogTitle className="sr-only">Cài đặt tài khoản</DialogTitle>
      <DialogDescription className="sr-only">
        Cài đặt tài khoản, giao diện và gói sử dụng Wokki
      </DialogDescription>

      <div className={DIALOG_BODY_CLASS}>
        {isMobile && mobileSidebarOpen ? (
          <button
            type="button"
            aria-label="Đóng menu cài đặt"
            className="absolute inset-0 z-20 bg-black/20 sm:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        ) : null}

        <aside
          className={cn(
            SIDEBAR_CLASS,
            isMobile && !mobileSidebarOpen && "max-sm:hidden",
            isMobile && mobileSidebarOpen && "max-sm:flex"
          )}
        >
          {userEmail ? (
            <div className="mb-5 flex items-center gap-2.5 rounded-full border border-neutral-200/80 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900">
              <Avatar
                size="sm"
                className="size-8 bg-neutral-200 text-xs font-semibold text-neutral-700 dark:bg-neutral-700 dark:text-neutral-100"
              >
                <AvatarFallback>{getInitials(userEmail)}</AvatarFallback>
              </Avatar>
              <p className="min-w-0 truncate text-sm font-medium text-neutral-800 dark:text-neutral-200">
                {userEmail}
              </p>
            </div>
          ) : null}

          <nav className="space-y-0.5" aria-label="Mục cài đặt">
            {visibleNavItems.map(({ id, label, icon: Icon }) => {
              const active = activeSection === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => selectSection(id)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors",
                    active
                      ? "bg-neutral-200/70 text-neutral-900 dark:bg-neutral-800 dark:text-white"
                      : "text-neutral-600 hover:bg-neutral-200/40 dark:text-neutral-400 dark:hover:bg-neutral-800/50"
                  )}
                >
                  <Icon className="size-4 shrink-0 opacity-80" strokeWidth={1.75} />
                  {label}
                </button>
              );
            })}
          </nav>

          {onLogout ? (
            <div className="mt-auto pt-6">
              <button
                type="button"
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                onClick={() => void handleLogout()}
                disabled={isLoggingOut}
              >
                <LogOutIcon className="size-4 shrink-0" strokeWidth={1.75} />
                {isLoggingOut ? "Đang đăng xuất…" : "Đăng xuất"}
              </button>
            </div>
          ) : null}
        </aside>

        <div className={PANEL_CLASS}>
          {isMobile ? (
            <div className="flex shrink-0 items-center gap-2 border-b border-neutral-100 px-4 py-3 dark:border-neutral-800 sm:hidden">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="size-9 shrink-0"
                aria-label="Mở menu cài đặt"
                onClick={() => setMobileSidebarOpen(true)}
              >
                <MenuIcon className="size-5" />
              </Button>
              <span className="min-w-0 truncate text-sm font-semibold text-neutral-900 dark:text-white">
                {activeNavLabel}
              </span>
            </div>
          ) : null}

          <div className="relative min-h-0 flex-1">
            <div
              className={cn(
                "absolute inset-0 overflow-hidden",
                activeSection !== "profile" && "pointer-events-none invisible"
              )}
              aria-hidden={activeSection !== "profile"}
            >
              <ProfileSettingsPanel
                userEmail={userEmail}
                onCancel={() => handleOpenChange(false)}
                onOpenPaymentProfile={() => setPaymentProfileOpen(true)}
              />
            </div>
            <div
              className={cn(
                "absolute inset-0 overflow-hidden",
                activeSection !== "security" && "pointer-events-none invisible"
              )}
              aria-hidden={activeSection !== "security"}
            >
              <SecuritySettingsPanel
                error={error}
                form={form}
                isSubmitting={isSubmitting}
                onSubmit={onSubmit}
                onCancel={() => handleOpenChange(false)}
              />
            </div>
            <div
              className={cn(
                "absolute inset-0 overflow-hidden",
                activeSection !== "theme" && "pointer-events-none invisible"
              )}
              aria-hidden={activeSection !== "theme"}
            >
              <ThemeSettingsPanel />
            </div>
            <div
              className={cn(
                "absolute inset-0 overflow-hidden",
                activeSection !== "subscription" && "pointer-events-none invisible"
              )}
              aria-hidden={activeSection !== "subscription"}
            >
              <SubscriptionSettingsPanel />
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogPortal>
          <DialogOverlay />
          <div
            data-slot="dialog-positioner"
            className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <DialogPrimitive.Popup
              className={cn(
                "pointer-events-auto outline-none",
                isMobile
                  ? cn(
                      SETTINGS_PAIR_PANEL_SURFACE_CLASS,
                      SETTINGS_PAIR_HEIGHT_CLASS,
                      "w-[min(680px,calc(100vw-2rem))]"
                    )
                  : cn(
                      "flex w-full min-w-0 items-stretch",
                      SETTINGS_PAIR_GAP_CLASS,
                      SETTINGS_PAIR_MAX_WIDTH_CLASS,
                      SETTINGS_PAIR_HEIGHT_CLASS
                    )
              )}
            >
              {isMobile ? (
                <div className="relative h-full min-h-0 w-full">
                  <DialogClose className="absolute top-4 right-4 z-10 flex size-8 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-800 dark:hover:bg-neutral-800 dark:hover:text-neutral-200">
                    <span className="sr-only">Đóng</span>×
                  </DialogClose>
                  {settingsDialogInner}
                </div>
              ) : (
                <>
                  <div
                    ref={settingsPanelRef}
                    tabIndex={-1}
                    className={cn(
                      SETTINGS_PAIR_PANEL_SURFACE_CLASS,
                      "relative min-h-0 outline-none",
                      showDesktopPaymentPanel ? SETTINGS_PAIR_MAIN_PANEL_CLASS : "w-full flex-1"
                    )}
                  >
                    <DialogClose className="absolute top-4 right-4 z-10 flex size-8 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-800 dark:hover:bg-neutral-800 dark:hover:text-neutral-200">
                      <span className="sr-only">Đóng</span>×
                    </DialogClose>
                    {settingsDialogInner}
                  </div>
                  {showDesktopPaymentPanel ? (
                    <PaymentProfileSidePanel
                      embedded
                      onOpenChange={closePaymentProfile}
                      isMobile={false}
                    />
                  ) : null}
                </>
              )}
            </DialogPrimitive.Popup>
          </div>
        </DialogPortal>
      </Dialog>

      {showPaymentPanel && isMobile ? (
        <PaymentProfileSidePanel onOpenChange={closePaymentProfile} isMobile />
      ) : null}
    </>
  );
}

function SettingsPanelShell({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col px-4 py-4 sm:px-8 sm:py-7">
      <header className="mb-4 shrink-0 pr-8 sm:mb-5">
        <h3 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
          {title}
        </h3>
        {description ? (
          <p className="mt-1.5 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
            {description}
          </p>
        ) : null}
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>

      {footer ? (
        <footer className="mt-3 flex shrink-0 justify-end gap-2.5 border-t border-neutral-100 bg-white pt-4 dark:border-neutral-800 dark:bg-neutral-950 sm:mt-auto sm:border-t-0 sm:bg-transparent sm:pt-5">
          {footer}
        </footer>
      ) : null}
    </div>
  );
}

function ProfileSettingsPanel({
  userEmail,
  onCancel,
  onOpenPaymentProfile,
}: {
  userEmail?: string | null;
  onCancel: () => void;
  onOpenPaymentProfile: () => void;
}) {
  const { data, isLoading, isError, error } = useMyProfileQuery();
  const updateMutation = useUpdateMyProfileMutation();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      lastName: "",
      firstName: "",
      phone: "",
    },
  });

  useEffect(() => {
    if (!data) return;
    form.reset({
      lastName: data.lastName,
      firstName: data.firstName,
      phone: data.phone ?? "",
    });
  }, [data, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    if (!data) return;
    try {
      await updateMutation.mutateAsync({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        phone: values.phone?.trim() || null,
      });
      toast.success("Đã cập nhật hồ sơ cá nhân");
    } catch (err) {
      toast.error(mapEmployeeError(err));
    }
  });

  const noEmployeeProfile = isError && isNoEmployeeError(error);
  const isSubmitting = updateMutation.isPending;
  const isMobile = useIsMobile();

  return (
    <SettingsPanelShell
      title="Hồ sơ cá nhân"
      description={isMobile ? "" : "Cập nhật thông tin liên hệ và họ tên hiển thị trong tổ chức."}
      footer={
        !noEmployeeProfile && !isLoading ? (
          <>
            <Button
              type="button"
              variant="ghost"
              className={BTN_SECONDARY}
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              form="settings-profile-form"
              className={BTN_PRIMARY}
              disabled={isSubmitting}
              data-save
            >
              {isSubmitting ? "Đang lưu…" : "Lưu hồ sơ"}
            </Button>
          </>
        ) : null
      }
    >
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
      ) : noEmployeeProfile ? (
        <div className="space-y-3">
          <ReadOnlySettingsField label="Email" value={userEmail ?? data?.email ?? "—"} />
          <p className="rounded-xl bg-neutral-100 px-4 py-3.5 text-sm leading-relaxed text-neutral-500 dark:bg-neutral-800/80 dark:text-neutral-400">
            Tài khoản này chưa có hồ sơ nhân viên. Org Admin tạo nhân viên qua mục Nhân sự để liên
            kết hồ sơ làm việc.
          </p>
        </div>
      ) : isError || !data ? (
        <p className="rounded-xl bg-neutral-100 px-4 py-3.5 text-sm text-neutral-500 dark:bg-neutral-800/80 dark:text-neutral-400">
          Không tải được hồ sơ. Thử lại sau.
        </p>
      ) : (
        <form id="settings-profile-form" onSubmit={onSubmit} className="space-y-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <Input placeholder="Họ" className={INPUT_CLASS} {...form.register("lastName")} />
              <FieldError errors={[form.formState.errors.lastName]} />
            </div>
            <div>
              <Input placeholder="Tên" className={INPUT_CLASS} {...form.register("firstName")} />
              <FieldError errors={[form.formState.errors.firstName]} />
            </div>
          </div>
          <Input
            placeholder="Số điện thoại"
            inputMode="tel"
            autoComplete="tel"
            className={INPUT_CLASS}
            {...form.register("phone")}
          />

          <ReadOnlySettingsField label="Email" value={data.email} />
          <div className="grid gap-2 sm:grid-cols-2">
            {data.departmentName ? (
              <ReadOnlySettingsField label="Phòng ban" value={data.departmentName} />
            ) : null}
            {data.locationName ? (
              <ReadOnlySettingsField label="Chi nhánh" value={data.locationName} />
            ) : null}
          </div>
          {data.position ? <ReadOnlySettingsField label="Vị trí" value={data.position} /> : null}

          <PaymentProfileEntryTile data={data} onOpen={onOpenPaymentProfile} />
        </form>
      )}
    </SettingsPanelShell>
  );
}

function hasPaymentProfile(data: {
  bankName?: string | null;
  bankAccountNumber?: string | null;
  bankAccountHolderName?: string | null;
  paymentQrImageUrl?: string | null;
}) {
  return Boolean(
    data.bankName?.trim() ||
    data.bankAccountNumber?.trim() ||
    data.bankAccountHolderName?.trim() ||
    data.paymentQrImageUrl
  );
}

function formatAccountNumberPreview(accountNumber?: string | null) {
  const digits = accountNumber?.replace(/\s/g, "") ?? "";
  if (!digits) return null;
  if (digits.length <= 4) return digits;
  return `•••• ${digits.slice(-4)}`;
}

function PaymentProfileEntryTile({
  data,
  onOpen,
}: {
  data: {
    bankName?: string | null;
    bankAccountNumber?: string | null;
    bankAccountHolderName?: string | null;
    paymentQrImageUrl?: string | null;
  };
  onOpen: () => void;
}) {
  const configured = hasPaymentProfile(data);
  const accountPreview = formatAccountNumberPreview(data.bankAccountNumber);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="mt-2 flex w-full items-center gap-3 rounded-xl bg-neutral-100 px-4 py-3.5 text-left transition-colors hover:bg-neutral-200/70 dark:bg-neutral-800/80 dark:hover:bg-neutral-800"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-neutral-700 dark:bg-neutral-900 dark:text-neutral-200">
        <LandmarkIcon className="size-5" strokeWidth={1.75} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="text-sm font-semibold text-neutral-900 dark:text-white">
            Tài khoản nhận lương
          </span>
          <Badge
            variant={configured ? "default" : "outline"}
            className="h-5 px-1.5 text-[10px] font-medium"
          >
            {configured ? "Đã thiết lập" : "Chưa thiết lập"}
          </Badge>
        </span>
        <span className="mt-0.5 block truncate text-xs text-neutral-500 dark:text-neutral-400">
          {configured
            ? [data.bankName, accountPreview].filter(Boolean).join(" · ") ||
              data.bankAccountHolderName ||
              "Đã có ảnh QR"
            : "Thêm STK ngân hàng và ảnh QR để admin chuyển lương nhanh hơn"}
        </span>
      </span>
      <ChevronRightIcon className="size-4 shrink-0 text-neutral-400" strokeWidth={1.75} />
    </button>
  );
}

function PaymentProfileSidePanel({
  onOpenChange,
  isMobile,
  embedded = false,
}: {
  onOpenChange: (open: boolean) => void;
  isMobile: boolean;
  embedded?: boolean;
}) {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useMyProfileQuery();
  const updateMutation = useUpdateMyProfileMutation();
  const [mounted, setMounted] = useState(false);
  const [removePaymentQr, setRemovePaymentQr] = useState(false);
  const [qrPreviewUrl, setQrPreviewUrl] = useState<string | null>(null);
  const [isUploadingQr, setIsUploadingQr] = useState(false);

  const form = useForm<PaymentProfileFormValues>({
    resolver: zodResolver(paymentProfileSchema),
    defaultValues: {
      bankName: "",
      bankAccountHolderName: "",
      bankAccountNumber: "",
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!data) return;
    form.reset({
      bankName: data.bankName ?? "",
      bankAccountHolderName: data.bankAccountHolderName ?? "",
      bankAccountNumber: data.bankAccountNumber ?? "",
    });
    setQrPreviewUrl(data.paymentQrImageUrl ?? null);
    setRemovePaymentQr(false);
  }, [data, form]);

  const handleQrUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setIsUploadingQr(true);
    try {
      const uploaded = await fetchSelf.uploadPaymentQr(file);
      setQrPreviewUrl(uploaded.paymentQrImageUrl);
      setRemovePaymentQr(false);
      queryClient.setQueryData(employeeKeys.myProfile(), (prev: typeof data) =>
        prev ? { ...prev, paymentQrImageUrl: uploaded.paymentQrImageUrl } : prev
      );
      toast.success("Đã tải ảnh QR lên");
    } catch (err) {
      toast.error(mapEmployeeError(err));
    } finally {
      setIsUploadingQr(false);
    }
  };

  const onSubmit = form.handleSubmit(async (values) => {
    if (!data) return;
    try {
      await updateMutation.mutateAsync({
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || null,
        bankName: values.bankName?.trim() || null,
        bankAccountHolderName: values.bankAccountHolderName?.trim() || null,
        bankAccountNumber: values.bankAccountNumber?.trim() || null,
        removePaymentQr,
      });
      if (removePaymentQr) {
        setQrPreviewUrl(null);
        setRemovePaymentQr(false);
      }
      toast.success("Đã cập nhật tài khoản nhận lương");
      onOpenChange(false);
    } catch (err) {
      toast.error(mapEmployeeError(err));
    }
  });

  const isSubmitting = updateMutation.isPending || isUploadingQr;
  const showQrPreview = Boolean(qrPreviewUrl) && !removePaymentQr;

  if (!mounted && !embedded) return null;

  const panelBody = (
    <>
      <div className="flex h-full min-h-0 flex-col px-6 py-6 sm:py-7">
        <header className="mb-4 shrink-0 pr-6">
          <h3
            id="payment-profile-title"
            className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white"
          >
            Tài khoản nhận lương
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
            STK và QR giúp admin chuyển lương cuối tháng nhanh hơn.
          </p>
        </header>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-11 w-full rounded-xl" />
              <Skeleton className="h-11 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
          ) : isError || !data ? (
            <p className="rounded-xl bg-neutral-100 px-4 py-3.5 text-sm text-neutral-500 dark:bg-neutral-800/80 dark:text-neutral-400">
              Không tải được thông tin. Thử lại sau.
            </p>
          ) : (
            <form
              id="settings-payment-profile-form"
              onSubmit={onSubmit}
              className="flex min-h-0 flex-1 flex-col gap-3"
            >
              <div className="shrink-0 space-y-3">
                <Input
                  placeholder="Tên ngân hàng"
                  className={INPUT_CLASS}
                  {...form.register("bankName")}
                />
                <Input
                  placeholder="Tên chủ tài khoản"
                  className={INPUT_CLASS}
                  {...form.register("bankAccountHolderName")}
                />
                <Input
                  placeholder="Số tài khoản"
                  inputMode="numeric"
                  className={INPUT_CLASS}
                  {...form.register("bankAccountNumber")}
                />
              </div>

              <div className="flex min-h-0 flex-1 flex-col rounded-xl bg-neutral-100 p-3 dark:bg-neutral-800/80">
                <p className="mb-2 shrink-0 text-xs font-medium text-neutral-500">
                  Ảnh QR chuyển khoản
                </p>
                {showQrPreview ? (
                  <div className="flex min-h-0 flex-1 flex-col gap-2">
                    <div className="flex min-h-[200px] flex-1 items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-900">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={qrPreviewUrl!}
                        alt="QR chuyển khoản"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <label className="cursor-pointer">
                        <span
                          className={cn(BTN_SECONDARY, "inline-flex h-9 items-center px-3 text-xs")}
                        >
                          {isUploadingQr ? "Đang tải…" : "Đổi ảnh"}
                        </span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="sr-only"
                          disabled={isUploadingQr}
                          onChange={(e) => void handleQrUpload(e)}
                        />
                      </label>
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-9 px-2 text-xs text-red-600 hover:bg-transparent hover:text-red-700"
                        onClick={() => setRemovePaymentQr(true)}
                      >
                        Xóa ảnh QR
                      </Button>
                    </div>
                  </div>
                ) : (
                  <label className="flex min-h-[200px] flex-1 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-neutral-300 bg-white px-4 py-5 dark:border-neutral-600 dark:bg-neutral-900/40">
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                      {isUploadingQr ? "Đang tải ảnh…" : "Chọn ảnh QR (JPEG, PNG, WebP)"}
                    </span>
                    <span className="text-xs text-neutral-500">Tối đa 5MB</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="sr-only"
                      disabled={isUploadingQr}
                      onChange={(e) => void handleQrUpload(e)}
                    />
                  </label>
                )}
              </div>
            </form>
          )}
        </div>

        {!isLoading && !isError && data ? (
          <footer className="mt-4 flex shrink-0 justify-end gap-2.5 border-t border-neutral-100 pt-4 dark:border-neutral-800">
            <Button
              type="button"
              variant="ghost"
              className={BTN_SECONDARY}
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              form="settings-payment-profile-form"
              className={BTN_PRIMARY}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang lưu…" : "Lưu thông tin"}
            </Button>
          </footer>
        ) : null}
      </div>

      <button
        type="button"
        aria-label="Đóng"
        className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-800 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
        onClick={() => onOpenChange(false)}
      >
        <span className="sr-only">Đóng</span>×
      </button>
    </>
  );

  if (embedded) {
    return (
      <aside
        role="region"
        aria-labelledby="payment-profile-title"
        className={cn(
          SETTINGS_PAIR_PAYMENT_PANEL_CLASS,
          SETTINGS_PAIR_PANEL_SURFACE_CLASS,
          "h-full"
        )}
      >
        {panelBody}
      </aside>
    );
  }

  return createPortal(
    <>
      <button
        type="button"
        aria-label="Đóng panel tài khoản nhận lương"
        className="fixed inset-0 z-[55] bg-black/10 supports-backdrop-filter:backdrop-blur-xs"
        onClick={() => onOpenChange(false)}
      />
      <div className="pointer-events-none fixed inset-0 z-[60] flex items-center justify-center p-4">
        <aside
          role="dialog"
          aria-labelledby="payment-profile-title"
          className={cn(
            SETTINGS_PAIR_PANEL_SURFACE_CLASS,
            "pointer-events-auto flex h-[min(calc(100dvh-2rem),640px)] w-full max-w-[calc(100vw-2rem)] flex-col overflow-hidden sm:max-w-[480px]"
          )}
        >
          {panelBody}
        </aside>
      </div>
    </>,
    document.body
  );
}

function ReadOnlySettingsField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-neutral-100 px-4 py-2.5 dark:bg-neutral-800/80">
      <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-neutral-900 dark:text-neutral-100">{value}</p>
    </div>
  );
}

function SecuritySettingsPanel({
  error,
  form,
  isSubmitting,
  onSubmit,
  onCancel,
}: {
  error: string | null;
  form: ReturnType<typeof useForm<PasswordFormValues>>;
  isSubmitting: boolean;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  onCancel: () => void;
}) {
  return (
    <SettingsPanelShell
      title="Đặt lại mật khẩu"
      description="Cập nhật mật khẩu đăng nhập của bạn."
      footer={
        <>
          <Button
            type="button"
            variant="ghost"
            className={BTN_SECONDARY}
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            form="settings-password-form"
            className={BTN_PRIMARY}
            disabled={isSubmitting}
            data-save
          >
            {isSubmitting ? "Đang lưu…" : "Cập nhật mật khẩu"}
          </Button>
        </>
      }
    >
      {error ? (
        <Alert variant="destructive" className="mb-4 rounded-xl">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <form id="settings-password-form" onSubmit={onSubmit} className="space-y-3">
        <div>
          <MaskedInput
            id="current-password"
            autoComplete="current-password"
            placeholder="Mật khẩu hiện tại"
            className={INPUT_CLASS}
            aria-invalid={!!form.formState.errors.currentPassword}
            {...form.register("currentPassword")}
          />
          <FieldError errors={[form.formState.errors.currentPassword]} />
        </div>
        <div>
          <MaskedInput
            id="new-password"
            autoComplete="new-password"
            placeholder="Mật khẩu mới"
            className={INPUT_CLASS}
            aria-invalid={!!form.formState.errors.newPassword}
            {...form.register("newPassword")}
          />
          <FieldError errors={[form.formState.errors.newPassword]} />
        </div>
        <div>
          <MaskedInput
            id="confirm-password"
            autoComplete="new-password"
            placeholder="Xác nhận mật khẩu mới"
            className={INPUT_CLASS}
            aria-invalid={!!form.formState.errors.confirmNewPassword}
            {...form.register("confirmNewPassword")}
          />
          <FieldError errors={[form.formState.errors.confirmNewPassword]} />
        </div>
      </form>
    </SettingsPanelShell>
  );
}

function ThemeSettingsPanel() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <SettingsPanelShell
      title="Giao diện"
      description="Chọn chế độ hiển thị sáng, tối hoặc theo hệ thống."
    >
      {!mounted ? (
        <div className="space-y-2">
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
        </div>
      ) : (
        <RadioGroup
          value={theme ?? "system"}
          onValueChange={(value) => {
            if (value === "light" || value === "dark" || value === "system") {
              setTheme(value);
            }
          }}
          className="gap-2"
        >
          {THEME_OPTIONS.map((option) => {
            const selected = theme === option.value;
            return (
              <label
                key={option.value}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3.5 transition-colors",
                  selected
                    ? "bg-neutral-200/70 dark:bg-neutral-800"
                    : "bg-neutral-100 hover:bg-neutral-200/50 dark:bg-neutral-800/50 dark:hover:bg-neutral-800"
                )}
              >
                <RadioGroupItem value={option.value} className="sr-only" />
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-lg",
                    selected
                      ? "bg-white text-neutral-900 dark:bg-neutral-700 dark:text-white"
                      : "bg-white/70 text-neutral-600 dark:bg-neutral-900/60 dark:text-neutral-300"
                  )}
                >
                  <option.icon className="size-4" strokeWidth={1.75} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-neutral-900 dark:text-white">
                    {option.label}
                  </span>
                  <span className="block text-xs text-neutral-500 dark:text-neutral-400">
                    {option.description}
                  </span>
                </span>
              </label>
            );
          })}
        </RadioGroup>
      )}
    </SettingsPanelShell>
  );
}

function SubscriptionSettingsPanel() {
  const { data, isLoading, isError } = useOrgSubscriptionQuery();

  const expiresLabel =
    data?.subscriptionExpiresAt != null
      ? format(parseISO(data.subscriptionExpiresAt), "dd/MM/yyyy HH:mm", { locale: vi })
      : null;

  const packageDays =
    data != null && data.subscriptionDurationDays > 0 ? data.subscriptionDurationDays : null;

  const daysRemaining = data?.daysRemaining;

  return (
    <SettingsPanelShell
      title="Gói sử dụng"
      description="Thời hạn gói do Wokki admin kích hoạt hoặc gia hạn cho tổ chức."
    >
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
        </div>
      ) : isError || !data ? (
        <p className="rounded-xl bg-neutral-100 px-4 py-3.5 text-sm text-neutral-500 dark:bg-neutral-800/80 dark:text-neutral-400">
          Không tải được thông tin gói. Thử lại sau hoặc liên hệ quản trị viên.
        </p>
      ) : (
        <dl className="space-y-2">
          <SubscriptionRow label="Trạng thái">
            <Badge variant={subscriptionStatusVariant(data.subscriptionStatus)}>
              {SUBSCRIPTION_STATUS_LABEL[data.subscriptionStatus]}
            </Badge>
          </SubscriptionRow>

          {packageDays != null ? (
            <SubscriptionRow label="Thời hạn gói">
              <span className="text-sm font-semibold tabular-nums text-neutral-900 dark:text-white">
                {packageDays} ngày
              </span>
            </SubscriptionRow>
          ) : null}

          {data.subscriptionStatus === "Active" && daysRemaining != null ? (
            <SubscriptionRow label="Thời gian còn lại">
              <span className="text-sm font-semibold tabular-nums text-neutral-900 dark:text-white">
                {daysRemaining <= 0
                  ? "Hết hạn hôm nay"
                  : `${formatSubscriptionDaysRemaining(daysRemaining)} ${formatSubscriptionDaysLabel(daysRemaining)}`}
              </span>
            </SubscriptionRow>
          ) : null}

          {expiresLabel ? (
            <SubscriptionRow label="Ngày hết hạn">
              <span className="text-sm font-medium tabular-nums text-neutral-800 dark:text-neutral-200">
                {expiresLabel}
              </span>
            </SubscriptionRow>
          ) : null}

          {data.subscriptionStatus !== "Active" ? (
            <p className="mt-2 rounded-xl bg-neutral-100 px-4 py-3 text-xs leading-relaxed text-neutral-500 dark:bg-neutral-800/80 dark:text-neutral-400">
              {data.subscriptionStatus === "NotActivated"
                ? "Tổ chức chưa được kích hoạt gói. Liên hệ Wokki admin để bật gói."
                : data.subscriptionStatus === "Expired"
                  ? "Gói đã hết hạn. Liên hệ Wokki admin để gia hạn."
                  : "Gói đang bị tắt. Liên hệ Wokki admin để được hỗ trợ."}
            </p>
          ) : null}
        </dl>
      )}
    </SettingsPanelShell>
  );
}

function SubscriptionRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-neutral-100 px-4 py-3.5 dark:bg-neutral-800/80">
      <dt className="text-sm text-neutral-500 dark:text-neutral-400">{label}</dt>
      <dd className="text-right">{children}</dd>
    </div>
  );
}
