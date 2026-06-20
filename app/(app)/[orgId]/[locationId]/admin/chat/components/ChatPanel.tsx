"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { HubConnectionState } from "@microsoft/signalr";
import {
  ArrowLeftIcon,
  Building2Icon,
  MoreHorizontalIcon,
  ReplyIcon,
  SearchIcon,
  SendHorizontalIcon,
  UsersIcon,
  XIcon,
} from "lucide-react";
import { NoEmployeeLinked } from "@/app/(app)/[orgId]/[locationId]/user/components/NoEmployeeLinked";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  appendChatMessageToCache,
  flattenChatMessages,
  useChannelsQuery,
  useCreateDirectChannelMutation,
  useDeleteMessageMutation,
  useInfiniteMessagesQuery,
  useOrgMembersQuery,
  useSendMessageMutation,
} from "@/hooks/useChat";
import { useChatHubOnPage } from "@/hooks/useChatHub";
import { useMyProfileQuery } from "@/hooks/useMyProfile";
import { useQueryClient } from "@tanstack/react-query";
import { chatKeys } from "@/lib/api/query-keys";
import {
  getChatHubState,
  joinChatChannel,
  leaveChatChannel,
  subscribeChatHubState,
  subscribeReceiveMessage,
} from "@/lib/realtime/chat-hub";
import { initialsFromDisplayName } from "@/lib/support/employee/swap-feed-utils";
import { mapChatError } from "@/lib/support/chat/map-errors";
import {
  cacheMyEmployeeId,
  channelDisplayName,
  memberDisplayName,
  orgChatMemberSubtitle,
  tryInferMyEmployeeIdFromChannels,
} from "@/lib/support/chat/my-employee-id";
import type { ApiError } from "@/types/api";
import type { ChannelResponse, MessageResponse, OrgChatMemberResponse } from "@/types/chat";
import { CHANNEL_TYPE } from "@/types/chat";
import { buildReplyBody, MessageBubble } from "./MessageBubble";

type ChatPanelProps = {
  canModerateDelete: boolean;
};

type MemberRow = OrgChatMemberResponse & {
  directChannel: ChannelResponse | null;
  sortAt: string;
};

function findDirectChannel(
  channels: ChannelResponse[],
  peerEmployeeId: string,
): ChannelResponse | undefined {
  return channels.find(
    (ch) =>
      ch.type === CHANNEL_TYPE.Direct &&
      ch.members.some((m) => m.employeeId === peerEmployeeId),
  );
}

function peerIdFromDirectChannel(
  channel: ChannelResponse,
  myEmployeeId: string | null,
): string | null {
  const peer = channel.members.find((m) => m.employeeId !== myEmployeeId);
  return peer?.employeeId ?? null;
}

function formatSidebarTime(iso: string | null | undefined): string | null {
  if (!iso) return null;
  try {
    return formatDistanceToNow(parseISO(iso), { addSuffix: false, locale: vi });
  } catch {
    return null;
  }
}

function MemberAvatar({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  return (
    <Avatar size="sm" className={cn("size-10 shrink-0", className)}>
      <AvatarFallback className="bg-neutral-200 text-xs font-medium text-neutral-700 dark:bg-neutral-700 dark:text-neutral-100">
        {initialsFromDisplayName(name)}
      </AvatarFallback>
    </Avatar>
  );
}

export function ChatPanel({ canModerateDelete }: ChatPanelProps) {
  useChatHubOnPage();
  const queryClient = useQueryClient();
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [memberSearch, setMemberSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<MessageResponse | null>(null);
  const [replyTo, setReplyTo] = useState<MessageResponse | null>(null);
  const [openingPeerId, setOpeningPeerId] = useState<string | null>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLInputElement>(null);
  const joinedChannelRef = useRef<string | null>(null);
  const sendingRef = useRef(false);
  const [hubState, setHubState] = useState(getChatHubState);

  const {
    data: channels = [],
    isLoading: channelsLoading,
    isError: channelsError,
    error: channelsErr,
  } = useChannelsQuery();

  const {
    data: orgMembers = [],
    isLoading: membersLoading,
    isError: membersError,
    error: membersErr,
  } = useOrgMembersQuery();

  const { data: myProfile } = useMyProfileQuery();

  const createDirectMutation = useCreateDirectChannelMutation();

  const channelsErrorCode =
    channelsError &&
    channelsErr &&
    typeof channelsErr === "object" &&
    "messageCode" in channelsErr
      ? (channelsErr as unknown as ApiError).messageCode
      : undefined;

  const myEmployeeId = useMemo(() => {
    if (myProfile?.id) {
      cacheMyEmployeeId(myProfile.id);
      return myProfile.id;
    }
    const inferred = tryInferMyEmployeeIdFromChannels(channels);
    if (inferred) cacheMyEmployeeId(inferred);
    return inferred;
  }, [myProfile?.id, channels]);

  const orgChannel = useMemo(
    () => channels.find((ch) => ch.type === CHANNEL_TYPE.Organization),
    [channels],
  );

  const directChannels = useMemo(
    () => channels.filter((ch) => ch.type === CHANNEL_TYPE.Direct),
    [channels],
  );

  const activeChannel = useMemo(
    () => channels.find((ch) => ch.id === activeChannelId) ?? null,
    [channels, activeChannelId],
  );

  const activePeerId = useMemo(() => {
    if (!activeChannel || activeChannel.type !== CHANNEL_TYPE.Direct) return null;
    return peerIdFromDirectChannel(activeChannel, myEmployeeId);
  }, [activeChannel, myEmployeeId]);

  const activePeerMember = useMemo((): OrgChatMemberResponse | null => {
    if (!activePeerId) return null;
    const fromOrg = orgMembers.find((m) => m.employeeId === activePeerId);
    if (fromOrg) return fromOrg;
    const member = activeChannel?.members.find((m) => m.employeeId === activePeerId);
    if (!member) return null;
    return {
      employeeId: member.employeeId,
      firstName: member.firstName,
      lastName: member.lastName,
      role: "User",
      isOrgAdmin: false,
      departmentName: null,
      locationName: null,
    };
  }, [activePeerId, orgMembers, activeChannel]);

  const isOrgThread = activeChannel?.type === CHANNEL_TYPE.Organization;

  const memberRows = useMemo((): MemberRow[] => {
    const q = memberSearch.trim().toLowerCase();
    const rows = orgMembers
      .filter((member) => !myEmployeeId || member.employeeId !== myEmployeeId)
      .map((member) => {
        const directChannel = findDirectChannel(directChannels, member.employeeId) ?? null;
        const sortAt =
          directChannel?.lastMessageAt ??
          directChannel?.createdAt ??
          "";
        return { ...member, directChannel, sortAt };
      });

    return rows
      .filter((m) => {
        if (!q) return true;
        const name = memberDisplayName(m.firstName, m.lastName).toLowerCase();
        const dept = (m.departmentName ?? "").toLowerCase();
        const loc = (m.locationName ?? "").toLowerCase();
        const subtitle = (orgChatMemberSubtitle(m) ?? "").toLowerCase();
        return name.includes(q) || dept.includes(q) || loc.includes(q) || subtitle.includes(q);
      })
      .sort((a, b) => {
        if (a.sortAt && b.sortAt) return b.sortAt.localeCompare(a.sortAt);
        if (a.sortAt) return -1;
        if (b.sortAt) return 1;
        return memberDisplayName(a.firstName, a.lastName).localeCompare(
          memberDisplayName(b.firstName, b.lastName),
          "vi",
        );
      });
  }, [orgMembers, directChannels, memberSearch, myEmployeeId]);

  useEffect(() => {
    if (activeChannelId || channelsLoading) return;
    if (orgChannel) setActiveChannelId(orgChannel.id);
  }, [activeChannelId, channelsLoading, orgChannel]);

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
      appendChatMessageToCache(queryClient, msg.channelId, msg);
    },
    [queryClient],
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

  useEffect(() => {
    setReplyTo(null);
  }, [activeChannelId]);

  useEffect(() => {
    scrollThreadToBottom();
  }, [messages.length]);

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
    const text = draft.trim();
    if (!text || !activeChannelId || sendMutation.isPending || sendingRef.current) return;
    const replyingTo = replyTo;
    const body =
      replyingTo && !replyingTo.isDeleted ? buildReplyBody(replyingTo, text) : text;
    sendingRef.current = true;
    setDraft("");
    setReplyTo(null);
    try {
      await sendMutation.mutateAsync({ body });
    } catch {
      setDraft(text);
      setReplyTo(replyingTo);
    } finally {
      sendingRef.current = false;
    }
    requestAnimationFrame(scrollThreadToBottom);
  };

  const handleReply = (message: MessageResponse) => {
    setReplyTo(message);
    requestAnimationFrame(() => composerRef.current?.focus());
  };

  const openDirectWithMember = async (member: OrgChatMemberResponse) => {
    if (myEmployeeId && member.employeeId === myEmployeeId) return;
    const existing = findDirectChannel(channels, member.employeeId);
    if (existing) {
      setActiveChannelId(existing.id);
      return;
    }
    setOpeningPeerId(member.employeeId);
    try {
      const channel = await createDirectMutation.mutateAsync(member.employeeId);
      setActiveChannelId(channel.id);
    } finally {
      setOpeningPeerId(null);
    }
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

  const membersErrorCode =
    membersError &&
    membersErr &&
    typeof membersErr === "object" &&
    "messageCode" in membersErr
      ? (membersErr as unknown as ApiError).messageCode
      : undefined;

  if (
    channelsErrorCode === "CHAT_NO_EMPLOYEE" ||
    messagesErrorCode === "CHAT_NO_EMPLOYEE" ||
    membersErrorCode === "CHAT_NO_EMPLOYEE"
  ) {
    return <NoEmployeeLinked />;
  }

  const threadTitle = activeChannel
    ? channelDisplayName(activeChannel, myEmployeeId)
    : null;

  const sidebarLoading = channelsLoading || membersLoading;

  const orgChannelName = orgChannel
    ? channelDisplayName(orgChannel, myEmployeeId)
    : "Toàn công ty";

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-white dark:bg-neutral-950">
      {wsDisconnected ? (
        <p className="shrink-0 border-b border-amber-200/60 bg-amber-50 px-4 py-1.5 text-center text-xs text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-300">
          Mất kết nối realtime — tin nhắn vẫn gửi/nhận qua REST
        </p>
      ) : null}

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={cn(
            "flex w-full shrink-0 flex-col border-r border-neutral-200 bg-neutral-50/80 dark:border-neutral-800 dark:bg-neutral-900/50 md:max-w-[320px]",
            activeChannelId ? "hidden md:flex" : "flex",
          )}
        >
          <div className="flex shrink-0 items-center justify-between px-4 py-3">
            <h2 className="text-xl font-bold tracking-tight">Đoạn chat</h2>
            <Button type="button" variant="ghost" size="icon" className="size-8" aria-label="Tùy chọn">
              <MoreHorizontalIcon className="size-4" />
            </Button>
          </div>

          <div className="shrink-0 px-3 pb-2">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-9 rounded-full border-neutral-200 bg-white pl-9 text-sm dark:border-neutral-700 dark:bg-neutral-900"
                placeholder="Tìm nhân viên…"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
            {sidebarLoading ? (
              <p className="px-3 py-4 text-sm text-muted-foreground">Đang tải…</p>
            ) : channelsError ? (
              <p className="px-3 py-4 text-sm text-destructive">{mapChatError(channelsErr)}</p>
            ) : orgChannel ? (
              <button
                type="button"
                className={cn(
                  "mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                  activeChannelId === orgChannel.id
                    ? "bg-neutral-200/80 dark:bg-neutral-800"
                    : "hover:bg-neutral-100 dark:hover:bg-neutral-800/60",
                )}
                onClick={() => setActiveChannelId(orgChannel.id)}
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <Building2Icon className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{orgChannelName}</p>
                  <p className="truncate text-xs text-muted-foreground">Kênh chung công ty</p>
                </div>
                <UsersIcon className="size-4 shrink-0 text-muted-foreground" />
              </button>
            ) : (
              <p className="px-3 py-2 text-sm text-muted-foreground">Chưa có kênh chung.</p>
            )}

            {membersLoading ? (
              <p className="px-3 py-2 text-sm text-muted-foreground">Đang tải…</p>
            ) : membersError ? (
              <p className="px-3 py-2 text-sm text-destructive">{mapChatError(membersErr)}</p>
            ) : memberRows.length === 0 ? (
              <p className="px-3 py-4 text-sm text-muted-foreground">
                {memberSearch.trim() ? "Không tìm thấy." : "Chưa có nhân viên khác trong công ty."}
              </p>
            ) : (
              memberRows.map((member) => {
                const name = memberDisplayName(member.firstName, member.lastName);
                const subtitle = orgChatMemberSubtitle(member);
                const isActive = activePeerId === member.employeeId;
                const isOpening = openingPeerId === member.employeeId;
                const lastAt = formatSidebarTime(member.directChannel?.lastMessageAt);

                return (
                  <button
                    key={member.employeeId}
                    type="button"
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                      isActive
                        ? "bg-neutral-200/80 dark:bg-neutral-800"
                        : "hover:bg-neutral-100 dark:hover:bg-neutral-800/60",
                    )}
                    onClick={() => void openDirectWithMember(member)}
                    disabled={isOpening}
                  >
                    <MemberAvatar name={name} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{name}</p>
                      {subtitle ? (
                        <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
                      ) : null}
                    </div>
                    {lastAt ? (
                      <span className="shrink-0 text-[11px] text-muted-foreground">{lastAt}</span>
                    ) : null}
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Thread */}
        <section
          className={cn(
            "flex min-w-0 flex-1 flex-col bg-white dark:bg-neutral-950",
            activeChannelId ? "flex" : "hidden md:flex",
          )}
        >
          {!activeChannelId ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-muted-foreground">
              <MessageCirclePlaceholder />
              <p className="text-sm">Chọn kênh chung hoặc một nhân viên để nhắn tin</p>
            </div>
          ) : (
            <>
              <header className="flex shrink-0 items-center gap-3 border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0 md:hidden"
                  aria-label="Quay lại danh sách"
                  onClick={() => setActiveChannelId(null)}
                >
                  <ArrowLeftIcon className="size-4" />
                </Button>
                {isOrgThread ? (
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <Building2Icon className="size-5" />
                  </div>
                ) : activePeerMember ? (
                  <MemberAvatar
                    name={memberDisplayName(activePeerMember.firstName, activePeerMember.lastName)}
                  />
                ) : (
                  <Avatar size="sm" className="size-10">
                    <AvatarFallback>?</AvatarFallback>
                  </Avatar>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-base font-semibold">{threadTitle}</h3>
                  {isOrgThread ? (
                    <p className="truncate text-xs text-muted-foreground">Kênh chung · toàn công ty</p>
                  ) : activePeerMember ? (
                    <p className="truncate text-xs text-muted-foreground">
                      {orgChatMemberSubtitle(activePeerMember) ?? "Tin nhắn trực tiếp"}
                    </p>
                  ) : null}
                </div>
              </header>

              <div
                ref={threadRef}
                className="min-h-0 flex-1 overflow-y-auto px-4 py-4"
                onScroll={handleThreadScroll}
              >
                {isFetchingNextPage ? (
                  <p className="mb-3 text-center text-xs text-muted-foreground">Đang tải thêm…</p>
                ) : null}
                {messagesLoading ? (
                  <p className="text-sm text-muted-foreground">Đang tải tin nhắn…</p>
                ) : messagesError ? (
                  <p className="text-sm text-destructive">{mapChatError(messagesErr)}</p>
                ) : messages.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground">Chưa có tin nhắn. Gửi lời chào!</p>
                ) : (
                  <div className="flex flex-col gap-0.5">
                    {messages.map((msg, index) => {
                      const isMine = Boolean(myEmployeeId && msg.senderId === myEmployeeId);
                      const prev = index > 0 ? messages[index - 1] : null;
                      const next = index < messages.length - 1 ? messages[index + 1] : null;
                      const isGroupStart = !prev || prev.senderId !== msg.senderId;
                      const isGroupEnd = !next || next.senderId !== msg.senderId;

                      return (
                        <div
                          key={msg.id}
                          className={cn(isGroupStart && index > 0 && "mt-3")}
                        >
                          <MessageBubble
                            message={msg}
                            isMine={isMine}
                            isGroupStart={isGroupStart}
                            isGroupEnd={isGroupEnd}
                            isOrgThread={isOrgThread}
                            canDelete={canDeleteMessage(msg)}
                            timeLabel={format(parseISO(msg.createdAt), "HH:mm")}
                            onReply={handleReply}
                            onDelete={setDeleteTarget}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="shrink-0 border-t border-neutral-200 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] dark:border-neutral-800">
                {replyTo && !replyTo.isDeleted ? (
                  <div className="mb-2 flex items-start gap-2 rounded-xl bg-neutral-100 px-3 py-2 dark:bg-neutral-900">
                    <ReplyIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-primary">
                        Trả lời {replyTo.senderName}
                      </p>
                      <p className="line-clamp-2 text-xs text-muted-foreground">{replyTo.body}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-7 shrink-0"
                      aria-label="Hủy trả lời"
                      onClick={() => setReplyTo(null)}
                    >
                      <XIcon className="size-4" />
                    </Button>
                  </div>
                ) : null}
                <div className="flex items-end gap-2">
                  <div className="relative min-w-0 flex-1">
                    <Input
                      ref={composerRef}
                      className="min-h-10 rounded-full border-neutral-200 bg-neutral-50 py-2 pr-12 dark:border-neutral-700 dark:bg-neutral-900"
                      placeholder="Aa"
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                          e.preventDefault();
                          if (e.repeat) return;
                          void handleSend();
                        }
                        if (e.key === "Escape" && replyTo) {
                          e.preventDefault();
                          setReplyTo(null);
                        }
                      }}
                    />
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    className="size-10 shrink-0 rounded-full"
                    disabled={!draft.trim() || sendMutation.isPending}
                    aria-label="Gửi tin nhắn"
                    onClick={() => void handleSend()}
                  >
                    <SendHorizontalIcon className="size-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>

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

function MessageCirclePlaceholder() {
  return (
    <svg
      className="size-16 text-neutral-200 dark:text-neutral-800"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
      />
    </svg>
  );
}
