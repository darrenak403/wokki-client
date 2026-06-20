"use client";

import type { ReactNode } from "react";

type SwapFeedHeaderProps = {
  toolbar: ReactNode;
  composer?: ReactNode;
};

export function SwapFeedHeader({ toolbar, composer }: SwapFeedHeaderProps) {
  return (
    <header className="rounded-xl border bg-card p-4 shadow-sm md:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        {toolbar}
      </div>
      {composer ? (
        <>
          <div className="my-4 border-t" />
          {composer}
        </>
      ) : null}
    </header>
  );
}
