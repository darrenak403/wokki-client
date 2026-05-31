"use client";

import {
  BadgeDollarSignIcon,
  BriefcaseBusinessIcon,
  Building2Icon,
  CalendarClockIcon,
  CalendarDaysIcon,
  Clock3Icon,
  LayoutDashboardIcon,
  MessageCircleIcon,
  NetworkIcon,
  Repeat2Icon,
  UserCogIcon,
  UsersIcon,
  MapPinIcon,
} from "lucide-react";
import type { AppNavItem } from "@/components/app/app-nav";

export function renderNavIcon(item: AppNavItem | undefined, className = "size-4 shrink-0") {
  if (!item) return <LayoutDashboardIcon className={className} />;

  const label = item.label.toLowerCase();

  if (label.includes("dashboard")) return <LayoutDashboardIcon className={className} />;
  if (label.includes("tổ chức")) return <NetworkIcon className={className} />;
  if (label.includes("chi nhánh")) return <MapPinIcon className={className} />;
  if (label.includes("phòng ban")) return <Building2Icon className={className} />;
  if (label.includes("ca làm")) return <Clock3Icon className={className} />;
  if (label.includes("nhân sự")) return <UsersIcon className={className} />;
  if (label.includes("tài khoản")) return <UserCogIcon className={className} />;
  if (label.includes("lịch")) return <CalendarDaysIcon className={className} />;
  if (label.includes("đổi ca")) return <Repeat2Icon className={className} />;
  if (label.includes("chấm công")) return <Clock3Icon className={className} />;
  if (label.includes("lương")) return <BadgeDollarSignIcon className={className} />;
  if (label.includes("tin nhắn")) return <MessageCircleIcon className={className} />;

  switch (item.module) {
    case "workspace":
      return <NetworkIcon className={className} />;
    case "wave2":
      return <BriefcaseBusinessIcon className={className} />;
    case "wave3":
      return <CalendarClockIcon className={className} />;
    case "wave4":
      return <CalendarDaysIcon className={className} />;
    case "wave5":
      return <Repeat2Icon className={className} />;
    case "wave6":
      return <MessageCircleIcon className={className} />;
    case "core":
    default:
      return <LayoutDashboardIcon className={className} />;
  }
}

export function getInitials(email?: string) {
  if (!email) return "W";
  return email.slice(0, 2).toUpperCase();
}
