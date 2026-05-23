"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  DEFAULT_FOUNDATION_SESSION,
  getFoundationSessionSnapshot,
  writeFoundationSession,
} from "@/lib/support/foundation/session-context";

const FOUNDATION_SESSION_EVENT = "wokki:foundation-session";

function subscribeFoundationSession(onStoreChange: () => void) {
  const handler = () => onStoreChange();
  window.addEventListener(FOUNDATION_SESSION_EVENT, handler);
  return () => window.removeEventListener(FOUNDATION_SESSION_EVENT, handler);
}

export function useFoundationSession() {
  const session = useSyncExternalStore(
    subscribeFoundationSession,
    getFoundationSessionSnapshot,
    () => DEFAULT_FOUNDATION_SESSION,
  );

  const sync = useCallback(() => {
    window.dispatchEvent(new CustomEvent(FOUNDATION_SESSION_EVENT));
  }, []);

  const setLocationId = useCallback((selectedLocationId: string | null) => {
    writeFoundationSession({
      selectedLocationId,
      selectedDepartmentId: null,
    });
  }, []);

  const setDepartmentId = useCallback((selectedDepartmentId: string | null) => {
    writeFoundationSession({ selectedDepartmentId });
  }, []);

  return {
    session,
    setLocationId,
    setDepartmentId,
    sync,
  };
}
