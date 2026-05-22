"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { format, parseISO } from "date-fns";
import { HubConnectionState } from "@microsoft/signalr";
import { Trash2Icon } from "lucide-react";
import { CreateChannelDialog } from "@/app/(app)/admin/chat/components/create-channel-dialog";
import { NoEmployeeLinked } from "@/app/(app)/user/components/no-employee-linked";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  appendChatMessageToCache,
  flattenChatMessages,
  useChannelsQuery,
  useDeleteMessageMutation,
  useInfiniteMessagesQuery,
  useSendMessageMutation,
} from "@/hooks/useChat";
import { useQueryClient } from "@tanstack/react-query";
import { chatKeys } from "@/lib/api/query-keys";
import {
  getChatHubState,
  joinChatChannel,
  leaveChatChannel,
  subscribeChatHubState,
  subscribeReceiveMessage,
} from "@/lib/realtime/chat-hub";
import { mapChatError } from "@/lib/support/chat/map-errors";
import {
  cacheMyEmployeeId,
  channelDisplayName,
  tryInferMyEmployeeIdFromChannels,
} from "@/lib/support/chat/my-employee-id";
import type { ApiError } from "@/types/api";
import type { MessageResponse } from "@/types/chat";
import { CHANNEL_TYPE } from "@/types/chat";

type ChatPanelProps = {
  canCreateChannel: boolean;
  canModerateDelete: boolean;
};

export function ChatPanel({ canCreateChannel, canModerateDelete }: ChatPanelProps) {
  const queryClient = useQueryClient();
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MessageResponse | null>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const joinedChannelRef = useRef<string | null>(null);
  const [hubState, setHubState] = useState(getChatHubState);

  const {
    data: channels = [],
    isLoading: channelsLoading,
    isError: channelsError,
    error: channelsErr,
  } = useChannelsQuery();

  const channelsErrorCode =
    channelsError &&
    channelsErr &&
    typeof channelsErr === "object" &&
    "messageCode" in channelsErr
      ? (channelsErr as unknown as ApiError).messageCode
      : undefined;

  const myEmployeeId = useMemo(() => {
    const inferred = tryInferMyEmployeeIdFromChannels(channels);
    if (inferred) cacheMyEmployeeId(inferred);
    return inferred;
  }, [channels]);

  const {
    data: messagesData,
    isLoading: messagesLoading,
    isError: messagesError,
    error: messagesErr,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteMessagesQuery(activeChannelId);

  const sendMutation = useSendMessageMutation(activeChannelId);
  const deleteMutation = useDeleteMessageMutation(activeChannelId);

  const messages = useMemo(() => flattenChatMessages(messagesData), [messagesData]);
  const wsDisconnected = hubState !== HubConnectionState.Connected;

  useEffect(() => subscribeChatHubState(setHubState), []);

  const handleReceiveMessage = useCallback(
    (msg: MessageResponse) => {
      if (!activeChannelId || msg.channelId !== activeChannelId) return;
      appendChatMessageToCache(queryClient, activeChannelId, msg);
    },
    [activeChannelId, queryClient],
  );

  useEffect(() => {
    return subscribeReceiveMessage(handleReceiveMessage);
  }, [handleReceiveMessage]);

  useEffect(() => {
    const prev = joinedChannelRef.current;
    if (prev && prev !== activeChannelId) {
      void leaveChatChannel(prev);
    }
    if (activeChannelId) {
      void joinChatChannel(activeChannelId);
      joinedChannelRef.current = activeChannelId;
    } else {
      joinedChannelRef.current = null;
    }
    return () => {
      if (joinedChannelRef.current) {
        void leaveChatChannel(joinedChannelRef.current);
        joinedChannelRef.current = null;
      }
    };
  }, [activeChannelId, hubState]);

  useEffect(() => {
    const onFocus = () => {
      if (wsDisconnected && activeChannelId) {
        void queryClient.invalidateQueries({
          queryKey: chatKeys.messages(activeChannelId),
        });
      }
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [wsDisconnected, activeChannelId, queryClient]);

  const scrollThreadToBottom = () => {
    const el = threadRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  };

  useEffect(() => {
    scrollThreadToBottom();
  }, [activeChannelId]);

  const handleThreadScroll = () => {
    const el = threadRef.current;
    if (!el || !hasNextPage || isFetchingNextPage) return;
    if (el.scrollTop < 80) {
      const prevHeight = el.scrollHeight;
      void fetchNextPage().then(() => {
        requestAnimationFrame(() => {
          if (!threadRef.current) return;
          threadRef.current.scrollTop = threadRef.current.scrollHeight - prevHeight;
        });
      });
    }
  };

  const handleSend = async () => {
    const body = draft.trim();
    if (!body || !activeChannelId) return;
    await sendMutation.mutateAsync({ body });
    setDraft("");
    requestAnimationFrame(scrollThreadToBottom);
  };

  const canDeleteMessage = (msg: MessageResponse) => {
    if (msg.isDeleted) return false;
    if (canModerateDelete) return true;
    if (!myEmployeeId) return false;
    return msg.senderId === myEmployeeId;
  };

  const messagesErrorCode =
    messagesError &&
    messagesErr &&
    typeof messagesErr === "object" &&
    "messageCode" in messagesErr
      ? (messagesErr as unknown as ApiError).messageCode
      : undefined;

  if (channelsErrorCode === "CHAT_NO_EMPLOYEE" || messagesErrorCode === "CHAT_NO_EMPLOYEE") {
    return <NoEmployeeLinked />;
  }

  return (
    <div className="flex flex-col gap-3">
      {wsDisconnected ? (
        <p className="text-sm text-amber-700 dark:text-amber-400 rounded-md bg-amber-500/10 px-3 py-2">
          Mất kết nối realtime — tin nhắn vẫn gửi/nhận qua REST; làm mới trang hoặc đợi kết nối lại.
        </p>
      ) : null}

      <div className="flex min-h-[28rem] rounded-lg border overflow-hidden">
        <aside className="w-64 shrink-0 border-r flex flex-col bg-muted/30">
          <div className="p-2 border-b flex items-center justify-between gap-2">
            <span className="text-sm font-medium">Kênh</span>
            {canCreateChannel ? (
              <Button size="sm" variant="outline" onClick={() => setCreateOpen(true)}>
                Tạo kênh
              </Button>
            ) : null}
          </div>
          <div className="flex-1 overflow-y-auto p-1">
            {channelsLoading ? (
              <p className="p-2 text-sm text-muted-foreground">Đang tải…</p>
            ) : channelsError ? (
              <p className="p-2 text-sm text-destructive">{mapChatError(channelsErr)}</p>
            ) : channels.length === 0 ? (
              <p className="p-2 text-sm text-muted-foreground">Chưa có kênh.</p>
            ) : (
              channels.map((ch) => (
                <button
                  key={ch.id}
                  type="button"
                  className={cn(
                    "w-full text-left rounded-md px-2 py-2 text-sm transition-colors",
                    activeChannelId === ch.id
                      ? "bg-primary/10 font-medium"
                      : "hover:bg-muted",
                  )}
                  onClick={() => setActiveChannelId(ch.id)}
                >
                  <span className="line-clamp-2">
                    {channelDisplayName(ch, myEmployeeId)}
                  </span>
                  {ch.type === CHANNEL_TYPE.Group ? (
                    <Badge variant="outline" className="mt-1 text-[10px]">
                      Nhóm
                    </Badge>
                  ) : null}
                </button>
              ))
            )}
          </div>
        </aside>

        <section className="flex flex-1 flex-col min-w-0">
          {!activeChannelId ? (
            <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
              Chọn một kênh để xem tin nhắn.
            </div>
          ) : (
            <>
              <div
                ref={threadRef}
                className="flex-1 overflow-y-auto p-4 space-y-3"
                onScroll={handleThreadScroll}
              >
                {isFetchingNextPage ? (
                  <p className="text-xs text-center text-muted-foreground">Đang tải thêm…</p>
                ) : null}
                {messagesLoading ? (
                  <p className="text-sm text-muted-foreground">Đang tải tin nhắn…</p>
                ) : messagesError ? (
                  <p className="text-sm text-destructive">{mapChatError(messagesErr)}</p>
                ) : messages.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Chưa có tin nhắn.</p>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "rounded-lg border px-3 py-2 text-sm max-w-[85%]",
                        myEmployeeId && msg.senderId === myEmployeeId
                          ? "ml-auto bg-primary/10"
                          : "bg-card",
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground mb-1">
                            {msg.senderName} · {format(parseISO(msg.createdAt), "dd/MM HH:mm")}
                          </p>
                          {msg.isDeleted ? (
                            <p className="italic text-muted-foreground">Tin đã bị xóa</p>
                          ) : (
                            <p className="whitespace-pre-wrap break-words">{msg.body}</p>
                          )}
                        </div>
                        {canDeleteMessage(msg) ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="shrink-0 size-7"
                            aria-label="Xóa tin nhắn"
                            onClick={() => setDeleteTarget(msg)}
                          >
                            <Trash2Icon className="size-3.5" />
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t p-3 flex gap-2">
                <textarea
                  className="flex-1 min-h-[2.5rem] max-h-32 rounded-lg border border-input bg-transparent px-3 py-2 text-sm resize-y"
                  placeholder="Nhập tin nhắn…"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void handleSend();
                    }
                  }}
                />
                <Button
                  disabled={!draft.trim() || sendMutation.isPending}
                  onClick={() => void handleSend()}
                >
                  {sendMutation.isPending ? "Đang gửi…" : "Gửi"}
                </Button>
              </div>
            </>
          )}
        </section>
      </div>

      {canCreateChannel ? (
        <CreateChannelDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          onCreated={(id) => setActiveChannelId(id)}
        />
      ) : null}

      <AlertDialog open={deleteTarget !== null} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa tin nhắn?</AlertDialogTitle>
            <AlertDialogDescription>
              Tin sẽ được xóa mềm và không hiển thị nội dung cho mọi thành viên.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget) {
                  void deleteMutation.mutateAsync(deleteTarget.id).then(() => setDeleteTarget(null));
                }
              }}
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
