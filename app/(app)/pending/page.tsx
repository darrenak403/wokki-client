import { redirect } from "next/navigation";

/** Pending join review removed — redirect legacy bookmarks. */
export default function PendingRoute() {
  redirect("/login");
}
