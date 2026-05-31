"use client";

import { useEffect } from "react";
import { useAppSelector } from "@/lib/redux/hooks";
import { selectIsAuthenticated } from "@/lib/redux/slices/authSlice";
import { ensureChatHubConnected, stopChatHub } from "@/lib/realtime/chat-hub";

/** Chat hub `/ws/chat` — connect sau login; giữ kết nối khi điều hướng trong app. */
export function useChatHub() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const token = useAppSelector((state) => state.auth.token);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      void stopChatHub();
      return;
    }

    void ensureChatHubConnected().catch((err) => {
      console.error("[useChatHub] failed to connect", err);
    });
  }, [isAuthenticated, token]);
}

/** Gọi từ ChatPanel để retry join ngay khi vào trang chat. */
export function useChatHubOnPage() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const token = useAppSelector((state) => state.auth.token);

  useEffect(() => {
    if (!isAuthenticated || !token) return;
    void ensureChatHubConnected().catch((err) => {
      console.error("[useChatHubOnPage] failed to connect", err);
    });
  }, [isAuthenticated, token]);
}
