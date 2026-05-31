/** Injected at container start — see docker/entrypoint.js */
export type WokkiRuntimeConfig = {
  apiUrl?: string;
  appUrl?: string;
  appName?: string;
  env?: string;
  cookieDomain?: string;
};

declare global {
  interface Window {
    __WOKKI_RUNTIME__?: WokkiRuntimeConfig;
  }
}

export function readBrowserRuntimeConfig(): WokkiRuntimeConfig | null {
  if (typeof window === "undefined") return null;
  return window.__WOKKI_RUNTIME__ ?? null;
}
