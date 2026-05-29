import { redirect } from "next/navigation";
import { APP_HOME_PATH } from "@/lib/support/auth/app-routes";
import { ROLE_USER } from "@/lib/types/roles";

/** Join flow removed — employees are provisioned by Org Admin. */
export default function JoinRoute() {
  redirect(APP_HOME_PATH[ROLE_USER]);
}
