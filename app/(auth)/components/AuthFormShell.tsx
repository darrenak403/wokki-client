import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

type AuthFormShellProps = {
  title: string;
  children: ReactNode;
};

export function AuthFormShell({ title, children }: AuthFormShellProps) {
  return (
    <div className="flex w-full max-w-[420px] flex-col">
      <div className="mb-10 flex items-center justify-between gap-4">
        <Link href="/" className="inline-flex items-center gap-2 lg:hidden">
          <Image
            src="/WOKKI-LOGO.png"
            alt="Wokki"
            width={32}
            height={32}
            className="h-8 w-8 object-contain"
          />
          <span className="text-lg font-extrabold tracking-tight text-foreground">Wokki</span>
        </Link>
        <Link
          href="/"
          className="ml-auto text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Trang chủ
        </Link>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
      </div>

      <div className="mt-8">{children}</div>
    </div>
  );
}
