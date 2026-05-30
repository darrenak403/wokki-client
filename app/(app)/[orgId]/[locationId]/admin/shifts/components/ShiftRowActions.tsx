"use client";

import { MoreHorizontalIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ShiftDefinitionResponse } from "@/types/foundation";

type ShiftRowActionsProps = {
  shift: ShiftDefinitionResponse;
  onEdit: () => void;
  onDeactivate: () => void;
};

export function ShiftRowActions({ shift, onEdit, onDeactivate }: ShiftRowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-8 text-muted-foreground"
            aria-label={`Thao tác — ${shift.name}`}
            onClick={(event) => event.stopPropagation()}
          />
        }
      >
        <MoreHorizontalIcon aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40" onClick={(event) => event.stopPropagation()}>
        <DropdownMenuItem
          onClick={(event) => {
            event.stopPropagation();
            onEdit();
          }}
        >
          <PencilIcon aria-hidden="true" />
          Sửa
        </DropdownMenuItem>
        {shift.isActive ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={(event) => {
                event.stopPropagation();
                onDeactivate();
              }}
            >
              <Trash2Icon aria-hidden="true" />
              Ngưng ca
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
