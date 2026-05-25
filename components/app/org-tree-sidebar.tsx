"use client";

import { useState } from "react";
import { BuildingIcon, ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import { useFoundationSession } from "@/hooks/useFoundationSession";
import { useDepartmentsQuery } from "@/hooks/useDepartments";
import { useLocationsQuery } from "@/hooks/useLocations";
import { writeFoundationSession } from "@/lib/support/foundation/session-context";
import { cn } from "@/lib/utils";


function DeptRows({
  locationId,
  selectedDeptId,
  onSelect,
}: {
  locationId: string;
  selectedDeptId: string | null;
  onSelect: (deptId: string) => void;
}) {
  const { data: departments = [], isLoading } = useDepartmentsQuery(locationId);

  if (isLoading) {
    return <div className="pl-9 py-1.5 text-xs text-neutral-400">Đang tải…</div>;
  }

  if (!departments.length) {
    return (
      <div className="pl-9 py-1.5 text-xs italic text-neutral-400">Chưa có phòng ban</div>
    );
  }

  return (
    <>
      {departments.map((dept) => (
        <button
          key={dept.id}
          type="button"
          onClick={() => onSelect(dept.id)}
          className={cn(
            "w-full rounded-lg py-1.5 pl-9 pr-3 text-left text-sm transition-all",
            selectedDeptId === dept.id
              ? "bg-[#EEF6FB] font-semibold text-[#102854] ring-1 ring-[#BCE8F5] dark:bg-[#0B1E3D] dark:text-[#BCE8F5] dark:ring-[#4C88C6]/40"
              : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
          )}
        >
          {dept.name}
          {!dept.isActive && <span className="ml-1 text-xs opacity-50">(ngưng)</span>}
        </button>
      ))}
    </>
  );
}

export function OrgTreeSidebar() {
  const { data: locations = [], isLoading } = useLocationsQuery();
  const { session } = useFoundationSession();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggleExpand(locationId: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(locationId)) {
        next.delete(locationId);
      } else {
        next.add(locationId);
      }
      return next;
    });
  }

  function selectLocation(locationId: string) {
    writeFoundationSession({ selectedLocationId: locationId, selectedDepartmentId: null });
    setExpanded((prev) => new Set([...prev, locationId]));
  }

  function selectDept(locationId: string, deptId: string) {
    writeFoundationSession({ selectedLocationId: locationId, selectedDepartmentId: deptId });
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center gap-2 border-b border-neutral-200 px-4 dark:border-neutral-800">
        <BuildingIcon className="size-4 text-[#4C88C6]" />
        <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
          Tổ chức
        </span>
      </div>

      <div className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {isLoading && <p className="px-3 py-2 text-xs text-neutral-400">Đang tải…</p>}

        {locations.map((loc) => {
          const isExpanded = expanded.has(loc.id);
          const isLocActive = session.selectedLocationId === loc.id;

          return (
            <div key={loc.id}>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => toggleExpand(loc.id)}
                  aria-label={isExpanded ? "Thu gọn" : "Mở rộng"}
                  className="shrink-0 rounded p-0.5 text-neutral-400 transition-colors hover:text-neutral-700 dark:hover:text-neutral-200"
                >
                  {isExpanded ? (
                    <ChevronDownIcon className="size-3.5" />
                  ) : (
                    <ChevronRightIcon className="size-3.5" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => selectLocation(loc.id)}
                  className={cn(
                    "flex-1 rounded-lg px-2 py-1.5 text-left text-sm font-medium transition-all",
                    isLocActive
                      ? "bg-[#EEF6FB] text-[#102854] ring-1 ring-[#BCE8F5] dark:bg-[#0B1E3D] dark:text-[#BCE8F5] dark:ring-[#4C88C6]/40"
                      : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white"
                  )}
                >
                  {loc.name}
                  {!loc.isActive && <span className="ml-1 text-xs opacity-50">(ngưng)</span>}
                </button>
              </div>

              {isExpanded && (
                <div className="mb-1 mt-0.5 space-y-0.5">
                  <DeptRows
                    locationId={loc.id}
                    selectedDeptId={isLocActive ? session.selectedDepartmentId : null}
                    onSelect={(deptId) => selectDept(loc.id, deptId)}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
