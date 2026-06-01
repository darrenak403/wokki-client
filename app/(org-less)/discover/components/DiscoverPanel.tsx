"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SearchIcon } from "lucide-react";
import { useAppSelector } from "@/lib/redux/hooks";
import {
  selectIsOrgLessUser,
  selectOrganizationId,
  selectUserRole,
} from "@/lib/redux/slices/authSlice";
import { usePersistBootstrapped } from "@/hooks/usePersistBootstrapped";
import { resolveAppLandingPath } from "@/lib/support/auth/resolve-app-landing-path";
import { readFoundationSession } from "@/lib/support/foundation/session-context";
import {
  useMyOrgJoinRequestQuery,
  useOrgDirectoryQuery,
  useSubmitOrgJoinMutation,
} from "@/hooks/useOrgJoin";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export function DiscoverPanel() {
  const router = useRouter();
  const isPersistBootstrapped = usePersistBootstrapped();
  const isOrgLess = useAppSelector(selectIsOrgLessUser);
  const organizationId = useAppSelector(selectOrganizationId);
  const role = useAppSelector(selectUserRole);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [confirmOrg, setConfirmOrg] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchInput.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (!isPersistBootstrapped || isOrgLess) return;
    const branchId = readFoundationSession().selectedLocationId;
    void resolveAppLandingPath(role, organizationId, branchId).then((path) => router.replace(path));
  }, [isPersistBootstrapped, isOrgLess, organizationId, role, router]);

  const { data: myRequest } = useMyOrgJoinRequestQuery();
  const pending = myRequest?.success && myRequest.data?.status === "Pending" ? myRequest.data : null;

  const { data, isLoading, isError } = useOrgDirectoryQuery({
    page,
    pageSize: 20,
    search: debouncedSearch || undefined,
  });

  const submitMutation = useSubmitOrgJoinMutation();

  const listFailed = Boolean(data && !data.success);
  const items = data?.success ? (data.data?.items ?? []) : [];
  const totalPages = data?.success ? (data.data?.totalPages ?? 1) : 1;
  const hasSearch = debouncedSearch.length > 0;

  const handleSubmit = async () => {
    if (!confirmOrg) return;
    const result = await submitMutation.mutateAsync({ organizationId: confirmOrg.id });
    if (result.success) {
      setConfirmOrg(null);
      router.push("/join-request");
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Tìm nơi làm việc của bạn</h1>
        <p className="text-sm text-muted-foreground">
          Chọn tổ chức đang sử dụng Wokki và gửi yêu cầu tham gia.
        </p>
      </div>

      {pending ? (
        <Alert>
          <AlertDescription>
            Bạn đang chờ duyệt tại <strong>{pending.organizationName}</strong>.{" "}
            <Link href="/join-request" className="font-semibold text-brand-blue underline">
              Xem trạng thái
            </Link>
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="relative">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value);
            setPage(1);
          }}
          placeholder="Tìm theo tên tổ chức…"
          className="h-11 pl-9"
        />
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Đang tải…</p>
      ) : isError || listFailed ? (
        <p className="text-sm text-destructive">
          {listFailed && data?.message?.text
            ? data.message.text
            : "Không tải được danh sách tổ chức."}
        </p>
      ) : items.length === 0 ? (
        <div className="space-y-2 text-sm text-muted-foreground">
          {hasSearch ? (
            <p>Không tìm thấy tổ chức trùng với &quot;{debouncedSearch}&quot;.</p>
          ) : (
            <>
              <p>Chưa có tổ chức nào đang nhận thành viên mới trên Wokki.</p>
              <p>
                Danh bạ chỉ hiển thị doanh nghiệp đã được <strong>bật gói sử dụng</strong> (qua
                quản trị nền tảng). Tổ chức mới đăng ký trên Wokki cần được kích hoạt gói trước
                khi nhân viên có thể gửi yêu cầu tham gia.
              </p>
            </>
          )}
        </div>
      ) : (
        <ul className="divide-y rounded-xl border bg-card">
          {items.map((org) => (
            <li key={org.id} className="flex items-center justify-between gap-4 px-4 py-4">
              <span className="font-medium">{org.name}</span>
              {!pending ? (
                <Button type="button" size="sm" onClick={() => setConfirmOrg(org)}>
                  Gửi yêu cầu
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 ? (
        <div className="flex justify-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Trước
          </Button>
          <span className="flex items-center text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Sau
          </Button>
        </div>
      ) : null}

      <AlertDialog open={confirmOrg !== null} onOpenChange={(open) => !open && setConfirmOrg(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Gửi yêu cầu tham gia?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn sẽ gửi yêu cầu tham gia <strong>{confirmOrg?.name}</strong>. Quản trị viên sẽ
              duyệt và gán phòng ban cho bạn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={() => void handleSubmit()} disabled={submitMutation.isPending}>
              Gửi yêu cầu
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
