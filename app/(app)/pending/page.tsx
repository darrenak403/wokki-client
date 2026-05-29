import { redirect } from "next/navigation";
import { APP_HOME_PATH } from "@/lib/support/auth/app-routes";
import { ROLE_USER } from "@/lib/types/roles";

/** Pending join review removed — redirect legacy bookmarks. */
export default function PendingRoute() {
  redirect(APP_HOME_PATH[ROLE_USER]);
}
