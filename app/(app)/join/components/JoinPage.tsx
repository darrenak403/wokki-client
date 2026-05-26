"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BuildingIcon } from "lucide-react";
import { useActiveLocationsQuery } from "@/hooks/useLocations";
import { useRequestLocationMembership } from "@/hooks/useLocationMembership";
import { Button } from "@/components/ui/button";
import type { ApiError } from "@/types/api";

function isConflictError(e: unknown): boolean {
  return (
    typeof e === "object" &&
    e !== null &&
    "httpStatus" in e &&
    (e as ApiError).httpStatus === 409
  );
}

export function JoinPage() {
  const router = useRouter();
  const { data: locations = [], isLoading, isError: isLocationsError } = useActiveLocationsQuery();
  const { mutateAsync: requestMembership, isPending } = useRequestLocationMembership();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!selectedId) return;
    setSubmitError(null);
    try {
      await requestMembership(selectedId);
    } catch (e) {
      if (!isConflictError(e)) {
        setSubmitError("Không thể gửi yêu cầu. Vui lòng thử lại.");
        return;
      }
      // 409 = duplicate pending request — redirect to /pending as if success
    }
    router.replace("/pending");
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Chọn chi nhánh</h1>
          <p className="text-muted-foreground">
            Chọn chi nhánh bạn muốn tham gia. Yêu cầu sẽ được quản lý xét duyệt.
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : isLocationsError ? (
          <p className="text-center text-sm text-destructive">
            Không tải được danh sách chi nhánh. Vui lòng thử lại sau.
          </p>
        ) : locations.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            Hiện chưa có chi nhánh nào. Vui lòng liên hệ quản trị viên.
          </p>
        ) : (
          <div className="space-y-2">
            {locations.map((location) => (
              <Button
                key={location.id}
                variant="outline"
                onClick={() => setSelectedId(location.id)}
                className={
                  "h-auto w-full justify-start gap-3 px-4 py-4 text-left " +
                  (selectedId === location.id ? "border-primary bg-primary/5" : "")
                }
              >
                <BuildingIcon className="size-5 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="font-medium">{location.name}</p>
                  <p className="truncate text-sm text-muted-foreground">{location.address}</p>
                </div>
              </Button>
            ))}
          </div>
        )}

        {submitError && (
          <p className="text-center text-sm text-destructive">{submitError}</p>
        )}

        <div className="flex justify-end gap-3">
          <Button
            onClick={() => void handleSubmit()}
            disabled={!selectedId || isPending || isLoading}
          >
            {isPending ? "Đang gửi..." : "Gửi yêu cầu"}
          </Button>
        </div>
      </div>
    </div>
  );
}
