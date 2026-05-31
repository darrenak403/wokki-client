import { redirect } from "next/navigation";

/** Join flow removed — employees are provisioned by Org Admin. */
export default function JoinRoute() {
  redirect("/login");
}
