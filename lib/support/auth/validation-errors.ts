import type { ApiValidationError } from "@/types/api";
import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

/** FluentValidation `Email` → form field `email`. */
export function apiFieldToFormField(field: string): string {
  if (!field) return field;
  return field.charAt(0).toLowerCase() + field.slice(1);
}

export function applyValidationErrors<T extends FieldValues>(
  setError: UseFormSetError<T>,
  errors: ApiValidationError[] | null | undefined
): boolean {
  if (!errors?.length) return false;

  for (const item of errors) {
    const name = apiFieldToFormField(item.field) as Path<T>;
    setError(name, { type: "server", message: item.message });
  }

  return true;
}
