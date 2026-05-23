"use client";

import { useEffect } from "react";
import { useAppSelector } from "@/lib/redux/hooks";
import { selectIsAuthenticated } from "@/lib/redux/slices/authSlice";
import { startHubConnection, stopHubConnection } from "@/lib/realtime/signalr";

/** App hub `/hubs/app` — notifications & global realtime. */
export function useSignalR() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) return;

    void startHubConnection().catch((err) => {
      console.warn("[useSignalR] app hub unavailable", err);
    });

    return () => {
      void stopHubConnection();
    };
  }, [isAuthenticated]);
}
