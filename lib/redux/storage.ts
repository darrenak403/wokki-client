import createWebStorage from "redux-persist/lib/storage/createWebStorage";
import type { Storage } from "redux-persist";

const noopStorage: Storage = {
  getItem() {
    return Promise.resolve(null);
  },
  setItem(_key, value) {
    return Promise.resolve(value);
  },
  removeItem() {
    return Promise.resolve();
  },
};

/** localStorage on client only — avoids redux-persist noop fallback during SSR. */
export const persistStorage: Storage =
  typeof window === "undefined" ? noopStorage : createWebStorage("local");
