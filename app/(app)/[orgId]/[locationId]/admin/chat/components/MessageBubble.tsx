"use client";

import type { ReactNode } from "react";
import {
  CopyIcon,
  EllipsisIcon,
  ReplyIcon,
  SmileIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { initialsFromDisplayName } from "@/lib/support/employee/swap-feed-utils";
import type { MessageResponse } from "@/types/chat";

const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "😡"] as const;
const AVATAR_COL_CLASS = "w-8 shrink-0 self-end";

export type ParsedReplyMessage = {
  quoteLabel: string;
  quoteBody: string;
  content: string;
};

export function parseReplyMessage(body: string): ParsedReplyMessage | null {
  const match = body.match(/^↩ (.+)\n([\s\S]*?)\n\n([\s\S]*)$/);
  if (!match) return null;
  return {
    quoteLabel: match[1],
    quoteBody: match[2],
    content: match[3],
  };
}

export function buildReplyBody(replyTo: MessageResponse, body: string): string {
  const raw = parseReplyMessage(replyTo.body)?.content ?? replyTo.body;
  const snippet = raw.length > 120 ? `${raw.slice(0, 120)}…` : raw;
  return `↩ ${replyTo.senderName}\n${snippet}\n\n${body}`;
}

function MemberAvatar({ name }: { name: string }) {
  return (
    <Avatar className="size-8">
      <AvatarFallback className="bg-neutral-200 text-[11px] font-medium text-neutral-700 dark:bg-neutral-700 dark:text-neutral-100">
        {initialsFromDisplayName(name)}
      </AvatarFallback>
    </Avatar>
  );
}

function ActionIconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-7 rounded-full bg-neutral-200/90 text-neutral-600 shadow-sm hover:bg-neutral-300 dark:bg-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-600"
      aria-label={label}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

type MessageBubbleProps = {
  message: MessageResponse;
  isMine: boolean;
  isGroupStart: boolean;
  isGroupEnd: boolean;
  isOrgThread: boolean;
  canDelete: boolean;
  timeLabel: string;
  onReply: (message: MessageResponse) => void;
  onDelete: (message: MessageResponse) => void;
};

function bubbleShapeClass(isMine: boolean, isGroupStart: boolean, isGroupEnd: boolean): string {
  if (isMine) {
    if (isGroupStart && isGroupEnd) return "rounded-2xl rounded-br-md";
    if (isGroupStart) return "rounded-2xl rounded-br-md rounded-bl-2xl";
    if (isGroupEnd) return "rounded-2xl rounded-tr-md rounded-br-2xl";
    return "rounded-2xl rounded-r-md";
  }
  if (isGroupStart && isGroupEnd) return "rounded-2xl rounded-bl-md";
  if (isGroupStart) return "rounded-2xl rounded-bl-md rounded-br-2xl";
  if (isGroupEnd) return "rounded-2xl rounded-tl-md rounded-bl-2xl";
  return "rounded-2xl rounded-l-md";
}

export function MessageBubble({
  message,
  isMine,
  isGroupStart,
  isGroupEnd,
  isOrgThread,
  canDelete,
  timeLabel,
  onReply,
  onDelete,
}: MessageBubbleProps) {
  const parsed = !message.isDeleted ? parseReplyMessage(message.body) : null;
  const displayBody = parsed?.content ?? message.body;

  const handleCopy = async () => {
    const text = parsed?.content ?? message.body;
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Đã sao chép tin nhắn");
    } catch {
      toast.error("Không thể sao chép");
    }
  };

  const showActions = !message.isDeleted;
  const showAvatarColumn = isOrgThread && !isMine;
  const showSenderLabel = showAvatarColumn && isGroupStart;
  const showAvatar = showAvatarColumn && isGroupEnd;

  const bubbleClassName = cn(
    "max-w-[min(75vw,28rem)] px-3.5 py-2 text-sm leading-relaxed",
    bubbleShapeClass(isMine, isGroupStart, isGroupEnd),
    isMine
      ? "bg-primary text-primary-foreground"
      : "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-50",
    message.isDeleted && "italic opacity-70",
  );

  const bubbleBody = message.isDeleted ? (
    <span>Tin đã bị xóa</span>
  ) : (
    <>
      {parsed ? (
        <div
          className={cn(
            "mb-1.5 border-l-2 pl-2 text-xs opacity-80",
            isMine ? "border-primary-foreground/40" : "border-neutral-400 dark:border-neutral-500",
          )}
        >
          <p className="font-medium">{parsed.quoteLabel}</p>
          <p className="line-clamp-2">{parsed.quoteBody}</p>
        </div>
      ) : null}
      <p className="whitespace-pre-wrap break-words">{displayBody}</p>
    </>
  );

  const actionButtons = showActions ? (
    <div
      className={cn(
        "absolute top-1/2 z-20 flex -translate-y-1/2 items-center gap-0.5",
        "pointer-events-none opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100",
        isMine ? "right-full mr-1.5" : "left-full ml-1.5",
      )}
    >
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <ActionIconButton label="Thêm thao tác">
              <EllipsisIcon className="size-3.5" />
            </ActionIconButton>
          }
        />
        <DropdownMenuContent
          align={isMine ? "end" : "start"}
          side="top"
          className="min-w-[9rem]"
        >
          {canDelete ? (
            <DropdownMenuItem variant="destructive" onClick={() => onDelete(message)}>
              <Trash2Icon />
              {isMine ? "Thu hồi" : "Xóa"}
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem onClick={() => void handleCopy()}>
            <CopyIcon />
            Sao chép
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ActionIconButton label="Trả lời" onClick={() => onReply(message)}>
        <ReplyIcon className="size-3.5" />
      </ActionIconButton>

      <Popover>
        <PopoverTrigger
          render={
            <ActionIconButton label="Phản ứng">
              <SmileIcon className="size-3.5" />
            </ActionIconButton>
          }
        />
        <PopoverContent align="center" side="top" className="w-auto p-1.5">
          <div className="flex items-center gap-0.5">
            {QUICK_REACTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                className="rounded-md px-1.5 py-1 text-lg leading-none transition-colors hover:bg-muted"
                aria-label={`Phản ứng ${emoji}`}
                onClick={() => toast.info("Phản ứng tin nhắn sẽ có trong bản cập nhật tới")}
              >
                {emoji}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  ) : null;

  return (
    <div
      className={cn(
        "group flex max-w-full gap-2",
        isMine ? "ml-auto flex-row-reverse" : "mr-auto",
      )}
    >
      {showAvatarColumn ? (
        <div className={AVATAR_COL_CLASS}>
          {showAvatar ? <MemberAvatar name={message.senderName} /> : null}
        </div>
      ) : null}

      <div className={cn("flex min-w-0 flex-col", isMine ? "items-end" : "items-start")}>
        {showSenderLabel ? (
          <span className="mb-0.5 px-1 text-[11px] font-medium text-muted-foreground">
            {message.senderName}
          </span>
        ) : null}

        <div className="relative inline-flex max-w-full">
          <div className={bubbleClassName}>{bubbleBody}</div>

          <span
            className={cn(
              "pointer-events-none absolute top-full mt-0.5 whitespace-nowrap text-[10px] text-muted-foreground",
              "opacity-0 transition-opacity group-hover:opacity-100",
              isMine ? "right-0" : "left-0",
            )}
          >
            {timeLabel}
          </span>

          {actionButtons}
        </div>
      </div>
    </div>
  );
}
