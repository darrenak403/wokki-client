"use client";

import { useEffect } from "react";
import { useAppSelector } from "@/lib/redux/hooks";
import { selectIsAuthenticated } from "@/lib/redux/slices/authSlice";
import { reconnectChatHub, stopChatHub } from "@/lib/realtime/chat-hub";

/** Chat hub `/ws/chat` — connect sau login, reconnect khi token đổi (refresh). */
export function useChatHub() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const token = useAppSelector((state) => state.auth.token);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      void stopChatHub();
      return;
    }

    reconnectChatHub(token).catch((err) => {
      console.error("[useChatHub] failed to connect", err);
    });

    return () => {
      void stopChatHub();
    };
  }, [isAuthenticated, token]);
}
