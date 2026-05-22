import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-full max-w-3xl flex-col justify-center gap-8 p-8">
      <div className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">Wokki Client</p>
        <h1 className="text-3xl font-semibold tracking-tight">Foundation đã sẵn sàng</h1>
        <p className="text-muted-foreground">
          API layer, Redux auth, TanStack Query, SignalR, RBAC middleware và providers đã được cấu hình.
        </p>
      </div>
      <nav className="flex flex-wrap gap-3 text-sm font-medium">
        <Link
          href="/login"
          className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Đăng nhập
        </Link>
        <Link
          href="/dashboard"
          className="inline-flex h-10 items-center rounded-md border border-border px-4 transition-colors hover:bg-muted"
        >
          Dashboard
        </Link>
      </nav>
    </main>
  );
}
