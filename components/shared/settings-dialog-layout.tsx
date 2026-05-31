"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { MenuIcon, type LucideIcon } from "lucide-react";
import {
  SETTINGS_PAIR_HEIGHT_CLASS,
  SETTINGS_PAIR_PANEL_SURFACE_CLASS,
} from "@/components/auth/account-settings-pair-layout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/useMobile";
import { cn } from "@/lib/utils";

export type SettingsDialogNavItem<T extends string = string> = {
  id: T;
  label: string;
  icon: LucideIcon;
  badge?: string | number;
};

const DIALOG_BODY_CLASS = "relative flex h-full min-h-0 flex-col sm:flex-row";
const SIDEBAR_CLASS =
  "flex h-full min-h-0 w-full flex-col bg-neutral-100 px-4 py-5 max-sm:absolute max-sm:inset-0 max-sm:z-30 sm:w-[220px] sm:shrink-0 sm:border-r sm:border-neutral-200/80 dark:bg-neutral-900/80 dark:sm:border-neutral-800";
const PANEL_CLASS =
  "relative flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-white dark:bg-neutral-950";

type SettingsDialogLayoutProps<T extends string> = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  headerMeta?: ReactNode;
  navItems: SettingsDialogNavItem<T>[];
  activeSection: T;
  onSectionChange: (section: T) => void;
  initialSection?: T;
  children: ReactNode;
  footer?: ReactNode;
  dialogClassName?: string;
};

export function SettingsDialogLayout<T extends string>({
  open,
  onOpenChange,
  title,
  description,
  headerMeta,
  navItems,
  activeSection,
  onSectionChange,
  initialSection,
  children,
  footer,
  dialogClassName,
}: SettingsDialogLayoutProps<T>) {
  const isMobile = useIsMobile();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    setMobileSidebarOpen(false);
    if (initialSection) onSectionChange(initialSection);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset section only when dialog opens
  }, [open]);

  const activeLabel = navItems.find((item) => item.id === activeSection)?.label ?? title;

  const selectSection = (section: T) => {
    onSectionChange(section);
    if (isMobile) setMobileSidebarOpen(false);
  };

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
    if (!next) setMobileSidebarOpen(false);
  };

  const inner = (
    <>
      <DialogTitle className="sr-only">{title}</DialogTitle>
      {description ? <DialogDescription className="sr-only">{description}</DialogDescription> : null}

      <div className={DIALOG_BODY_CLASS}>
        {isMobile && mobileSidebarOpen ? (
          <button
            type="button"
            aria-label="Đóng menu"
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
          {headerMeta ? <div className="mb-5">{headerMeta}</div> : null}

          <nav className="space-y-0.5" aria-label="Mục cài đặt">
            {navItems.map(({ id, label, icon: Icon, badge }) => {
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
                  <span className="min-w-0 flex-1 truncate">{label}</span>
                  {badge != null && badge !== "" ? (
                    <span className="shrink-0 rounded-full bg-neutral-200/80 px-2 py-0.5 text-xs font-semibold tabular-nums text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200">
                      {badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </aside>

        <div className={PANEL_CLASS}>
          {isMobile ? (
            <div className="flex shrink-0 items-center gap-2 border-b border-neutral-100 px-4 py-3 dark:border-neutral-800 sm:hidden">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="size-9 shrink-0"
                aria-label="Mở menu"
                onClick={() => setMobileSidebarOpen(true)}
              >
                <MenuIcon className="size-5" />
              </Button>
              <span className="min-w-0 truncate text-sm font-semibold text-neutral-900 dark:text-white">
                {activeLabel}
              </span>
            </div>
          ) : null}

          <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>

          {footer ? (
            <div className="shrink-0 border-t border-neutral-100 px-6 py-4 dark:border-neutral-800">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </>
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
          <DialogPrimitive.Popup
            className={cn(
              "pointer-events-auto relative outline-none",
              SETTINGS_PAIR_PANEL_SURFACE_CLASS,
              SETTINGS_PAIR_HEIGHT_CLASS,
              "w-[min(920px,calc(100vw-2rem))]",
              dialogClassName
            )}
          >
            <DialogClose className="absolute top-4 right-4 z-10 flex size-8 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-800 dark:hover:bg-neutral-800 dark:hover:text-neutral-200">
              <span className="sr-only">Đóng</span>×
            </DialogClose>
            {inner}
          </DialogPrimitive.Popup>
        </div>
      </DialogPortal>
    </Dialog>
  );
}

/** Simple single-panel dialog for create flows. */
export function SimpleFormDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
          <DialogPrimitive.Popup
            className={cn(
              "pointer-events-auto relative flex max-h-[min(680px,calc(100dvh-2rem))] w-[min(480px,calc(100vw-2rem))] flex-col overflow-hidden outline-none",
              SETTINGS_PAIR_PANEL_SURFACE_CLASS
            )}
          >
            <DialogClose className="absolute top-4 right-4 z-10 flex size-8 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-800 dark:hover:bg-neutral-800 dark:hover:text-neutral-200">
              <span className="sr-only">Đóng</span>×
            </DialogClose>
            <div className="border-b border-neutral-100 px-6 py-5 pr-14 dark:border-neutral-800">
              <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
              {description ? (
                <DialogDescription className="mt-1 text-sm text-muted-foreground">
                  {description}
                </DialogDescription>
              ) : null}
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>
            {footer ? (
              <div className="shrink-0 border-t border-neutral-100 px-6 py-4 dark:border-neutral-800">
                {footer}
              </div>
            ) : null}
          </DialogPrimitive.Popup>
        </div>
      </DialogPortal>
    </Dialog>
  );
}
