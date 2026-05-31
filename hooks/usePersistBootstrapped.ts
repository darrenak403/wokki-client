"use client";

import { useSyncExternalStore } from "react";
import { persistor } from "@/lib/redux/store";

/** True after redux-persist has finished rehydrating auth from localStorage. */
export function usePersistBootstrapped(): boolean {
  return useSyncExternalStore(
    (onStoreChange) => persistor.subscribe(onStoreChange),
    () => persistor.getState().bootstrapped,
    () => false
  );
}
