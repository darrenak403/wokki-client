"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import {
  LockKeyholeIcon,
  LogOutIcon,
  MonitorIcon,
  MoonIcon,
  SunIcon,
  UserRoundIcon,
  WalletIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { z } from "zod";
import { toast } from "sonner";
import { fetchAuth } from "@/lib/api/services/fetchAuth";
import { mapAuthError, mapAuthResponseFailure } from "@/lib/support/auth/map-auth-error";
import {
  formatSubscriptionDaysLabel,
  formatSubscriptionDaysRemaining,
  SUBSCRIPTION_STATUS_LABEL,
} from "@/lib/support/org/subscription";
import { useOrgSubscriptionQuery } from "@/hooks/useOrgSubscription";
import { isNoEmployeeError, useMyProfileQuery, useUpdateMyProfileMutation } from "@/hooks/useMyProfile";
import { useAppDispatch } from "@/lib/redux/hooks";
import { clearMustChangePassword } from "@/lib/redux/slices/authSlice";
import { getInitials } from "@/components/app/app-shell-utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { MaskedInput } from "@/components/ui/masked-input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { OrgSubscriptionStatus } from "@/types/stats";

/* ── Design tokens (settings dialog) ── */
/** Fixed body height — sized for tallest tab (profile); tabs with less content leave whitespace below. */
const DIALOG_BODY_CLASS = "flex h-[580px] flex-col sm:flex-row";
const SIDEBAR_CLASS =
  "flex h-full min-h-0 w-full flex-col bg-neutral-100 px-4 py-5 sm:w-[220px] sm:shrink-0 sm:border-r sm:border-neutral-200/80 dark:bg-neutral-900/80 dark:sm:border-neutral-800";
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

type PasswordFormValues = z.infer<typeof passwordSchema>;
type ProfileFormValues = z.infer<typeof profileSchema>;
type SettingsSection = "profile" | "security" | "theme" | "subscription";

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
  required?: boolean;
  onLogout?: () => void | Promise<void>;
};

export function AccountSettingsDialog({
  open,
  onOpenChange,
  userEmail,
  required = false,
  onLogout,
}: AccountSettingsDialogProps) {
  const dispatch = useAppDispatch();
  const [activeSection, setActiveSection] = useState<SettingsSection>("profile");
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
    if (required) setActiveSection("security");
  }, [required, open]);

  const handleOpenChange = (next: boolean) => {
    if (required && !next) return;
    onOpenChange(next);
    if (!next) {
      form.reset();
      setError(null);
      setActiveSection(required ? "security" : "profile");
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

  const visibleNavItems = required ? NAV_ITEMS.filter((item) => item.id === "security") : NAV_ITEMS;

  const handleLogout = async () => {
    if (!onLogout || isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await onLogout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-[680px] [&_[data-slot=dialog-close]]:top-4 [&_[data-slot=dialog-close]]:right-4 [&_[data-slot=dialog-close]]:size-8 [&_[data-slot=dialog-close]]:rounded-lg [&_[data-slot=dialog-close]]:text-neutral-500"
        showCloseButton={!required}
      >
        <DialogTitle className="sr-only">Cài đặt tài khoản</DialogTitle>
        <DialogDescription className="sr-only">
          Cài đặt tài khoản, giao diện và gói sử dụng Wokki
        </DialogDescription>

        <div className={DIALOG_BODY_CLASS}>
          <aside className={SIDEBAR_CLASS}>
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
                    onClick={() => setActiveSection(id)}
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

            {!required && onLogout ? (
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
            <div
              className={cn(
                "absolute inset-0",
                activeSection !== "profile" && "pointer-events-none invisible"
              )}
              aria-hidden={activeSection !== "profile"}
            >
              <ProfileSettingsPanel
                userEmail={userEmail}
                onCancel={() => handleOpenChange(false)}
              />
            </div>
            <div
              className={cn(
                "absolute inset-0",
                activeSection !== "security" && "pointer-events-none invisible"
              )}
              aria-hidden={activeSection !== "security"}
            >
              <SecuritySettingsPanel
                error={error}
                form={form}
                isSubmitting={isSubmitting}
                onSubmit={onSubmit}
                required={required}
                onCancel={() => handleOpenChange(false)}
              />
            </div>
            <div
              className={cn(
                "absolute inset-0",
                activeSection !== "theme" && "pointer-events-none invisible"
              )}
              aria-hidden={activeSection !== "theme"}
            >
              <ThemeSettingsPanel />
            </div>
            <div
              className={cn(
                "absolute inset-0",
                activeSection !== "subscription" && "pointer-events-none invisible"
              )}
              aria-hidden={activeSection !== "subscription"}
            >
              <SubscriptionSettingsPanel />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
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
    <div className="flex h-full min-h-0 flex-col px-6 py-6 sm:px-8 sm:py-7">
      <header className="mb-5 shrink-0 pr-8">
        <h3 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
          {title}
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
          {description}
        </p>
      </header>

      <div className="min-h-0 flex-1">{children}</div>

      {footer ? (
        <footer className="mt-auto flex shrink-0 justify-end gap-2.5 pt-5">{footer}</footer>
      ) : null}
    </div>
  );
}

function ProfileSettingsPanel({
  userEmail,
  onCancel,
}: {
  userEmail?: string | null;
  onCancel: () => void;
}) {
  const { data, isLoading, isError, error } = useMyProfileQuery();
  const updateMutation = useUpdateMyProfileMutation();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { lastName: "", firstName: "", phone: "" },
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
    try {
      await updateMutation.mutateAsync({
        lastName: values.lastName.trim(),
        firstName: values.firstName.trim(),
        phone: values.phone?.trim() || null,
      });
      toast.success("Đã cập nhật hồ sơ cá nhân");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể cập nhật hồ sơ");
    }
  });

  const noEmployeeProfile = isError && isNoEmployeeError(error);
  const isSubmitting = updateMutation.isPending;

  return (
    <SettingsPanelShell
      title="Hồ sơ cá nhân"
      description="Cập nhật thông tin liên hệ và họ tên hiển thị trong tổ chức."
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
            Tài khoản này chưa có hồ sơ nhân viên. Org Admin tạo nhân viên qua mục Nhân sự để liên kết
            hồ sơ làm việc.
          </p>
        </div>
      ) : isError || !data ? (
        <p className="rounded-xl bg-neutral-100 px-4 py-3.5 text-sm text-neutral-500 dark:bg-neutral-800/80 dark:text-neutral-400">
          Không tải được hồ sơ. Thử lại sau.
        </p>
      ) : (
        <form id="settings-profile-form" onSubmit={onSubmit} className="space-y-3">
          <div>
            <Input
              placeholder="Họ"
              className={INPUT_CLASS}
              aria-invalid={!!form.formState.errors.lastName}
              {...form.register("lastName")}
            />
            <FieldError errors={[form.formState.errors.lastName]} />
          </div>
          <div>
            <Input
              placeholder="Tên"
              className={INPUT_CLASS}
              aria-invalid={!!form.formState.errors.firstName}
              {...form.register("firstName")}
            />
            <FieldError errors={[form.formState.errors.firstName]} />
          </div>
          <div>
            <Input
              placeholder="Số điện thoại"
              inputMode="tel"
              autoComplete="tel"
              className={INPUT_CLASS}
              aria-invalid={!!form.formState.errors.phone}
              {...form.register("phone")}
            />
            <FieldError errors={[form.formState.errors.phone]} />
          </div>
          <ReadOnlySettingsField label="Email" value={data.email} />
          <div className="grid gap-2 sm:grid-cols-2">
            {data.departmentName ? (
              <ReadOnlySettingsField label="Phòng ban" value={data.departmentName} />
            ) : null}
            {data.locationName ? (
              <ReadOnlySettingsField label="Chi nhánh" value={data.locationName} />
            ) : null}
            {data.position ? (
              <ReadOnlySettingsField label="Vị trí" value={data.position} />
            ) : null}
          </div>
        </form>
      )}
    </SettingsPanelShell>
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
  required,
  onCancel,
}: {
  error: string | null;
  form: ReturnType<typeof useForm<PasswordFormValues>>;
  isSubmitting: boolean;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  required: boolean;
  onCancel: () => void;
}) {
  return (
    <SettingsPanelShell
      title="Đặt lại mật khẩu"
      description={
        required
          ? "Bạn cần đổi mật khẩu tạm trước khi tiếp tục sử dụng Wokki."
          : "Cập nhật mật khẩu đăng nhập của bạn."
      }
      footer={
        <>
          {!required ? (
            <Button
              type="button"
              variant="ghost"
              className={BTN_SECONDARY}
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
          ) : null}
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
