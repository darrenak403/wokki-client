"use client";

import { useCallback, useEffect, useState } from "react";
import {
  readFoundationSession,
  writeFoundationSession,
  type FoundationSession,
} from "@/lib/support/foundation/session-context";

export function useFoundationSession() {
  const [session, setSession] = useState<FoundationSession>(() => readFoundationSession());

  const sync = useCallback(() => {
    setSession(readFoundationSession());
  }, []);

  useEffect(() => {
    sync();
    const handler = () => sync();
    window.addEventListener("wokki:foundation-session", handler);
    return () => window.removeEventListener("wokki:foundation-session", handler);
  }, [sync]);

  const setLocationId = useCallback((selectedLocationId: string | null) => {
    const next = writeFoundationSession({
      selectedLocationId,
      selectedDepartmentId: null,
    });
    setSession(next);
  }, []);

  const setDepartmentId = useCallback((selectedDepartmentId: string | null) => {
    const next = writeFoundationSession({ selectedDepartmentId });
    setSession(next);
  }, []);

  return {
    session,
    setLocationId,
    setDepartmentId,
    sync,
  };
}
