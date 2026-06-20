"use client";

import { useMemo, useRef, useState } from "react";
import { LandmarkIcon } from "lucide-react";
import { useVietQrBanksQuery, type VietQrBank } from "@/hooks/useVietQrBanks";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type BankSelectProps = {
  value: string;
  onChange: (bankName: string) => void;
  triggerClassName?: string;
  disabled?: boolean;
};

function bankMatches(bank: VietQrBank, query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return (
    bank.shortName.toLowerCase().includes(needle) ||
    bank.name.toLowerCase().includes(needle) ||
    bank.code.toLowerCase().includes(needle)
  );
}

function findExactBank(banks: VietQrBank[], value: string) {
  const needle = value.trim().toLowerCase();
  if (!needle) return undefined;
  return banks.find(
    (b) =>
      b.shortName.toLowerCase() === needle ||
      b.name.toLowerCase() === needle ||
      b.code.toLowerCase() === needle,
  );
}

export function BankSelect({ value, onChange, triggerClassName, disabled }: BankSelectProps) {
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: banks = [], isLoading, isError } = useVietQrBanksQuery();

  const selectedBank = useMemo(() => findExactBank(banks, value), [banks, value]);
  const matches = useMemo(() => banks.filter((b) => bankMatches(b, value)), [banks, value]);

  const handleSelect = (bank: VietQrBank) => {
    onChange(bank.shortName);
    setOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setHighlightIndex((i) => Math.min(i + 1, matches.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const bank = matches[highlightIndex];
      if (bank) handleSelect(bank);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="relative">
        {selectedBank ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={selectedBank.logo}
            alt=""
            className="pointer-events-none absolute top-1/2 left-3 h-6 w-9 -translate-y-1/2 rounded object-contain"
          />
        ) : (
          <LandmarkIcon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-neutral-500" />
        )}
        <PopoverTrigger
          nativeButton={false}
          disabled={disabled}
          render={
            <input
              ref={inputRef}
              type="text"
              autoComplete="off"
              placeholder="Tìm ngân hàng (tên, viết tắt...)"
              value={value}
              onChange={(e) => {
                onChange(e.target.value);
                setHighlightIndex(0);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={handleKeyDown}
              className={cn(
                "h-11 w-full rounded-xl border-0 bg-neutral-100 pr-3.5 pl-11 text-sm shadow-none outline-none transition-colors placeholder:text-neutral-500 focus-visible:ring-2 focus-visible:ring-neutral-300/80 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-neutral-800/80 dark:placeholder:text-neutral-400 dark:focus-visible:ring-neutral-600",
                triggerClassName,
              )}
            />
          }
        />
      </div>
      <PopoverContent
        align="start"
        sideOffset={6}
        positionerClassName="z-[70]"
        className="z-[70] max-h-72 w-[var(--anchor-width)] overflow-y-auto p-1.5"
        initialFocus={inputRef}
        finalFocus={false}
      >
        {isLoading ? (
          <div className="px-2 py-3 text-sm text-muted-foreground">Đang tải...</div>
        ) : isError ? (
          <div className="px-2 py-3 text-sm text-muted-foreground">
            Không tải được danh sách ngân hàng.
          </div>
        ) : matches.length === 0 ? (
          <div className="px-2 py-3 text-sm text-muted-foreground">Không tìm thấy ngân hàng.</div>
        ) : (
          <ul className="space-y-0.5">
            {matches.map((bank, index) => (
              <li key={bank.id}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(bank)}
                  onMouseEnter={() => setHighlightIndex(index)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm",
                    index === highlightIndex ? "bg-muted" : "hover:bg-muted/60",
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={bank.logo} alt="" className="h-8 w-11 shrink-0 rounded object-contain" />
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate">{bank.shortName}</span>
                    <span className="truncate text-xs text-muted-foreground">{bank.name}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}
