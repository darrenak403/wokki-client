import { headers } from "next/headers";
import { getSiteUrl } from "./site";

export async function getSiteUrlFromRequest(): Promise<string> {
  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    if (!host) return getSiteUrl();

    const proto = h.get("x-forwarded-proto") ?? "https";
    return `${proto}://${host}`.replace(/\/$/, "");
  } catch {
    return getSiteUrl();
  }
}
