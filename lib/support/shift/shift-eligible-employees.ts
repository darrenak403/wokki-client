import { ROLE_ADMIN, ROLE_MANAGER, ROLE_USER } from "@/lib/types/roles";
import type { EmployeeResponse, ShiftDefinitionResponse } from "@/types/foundation";

/** Mirrors solver role match: auth roles allow all; otherwise match employee position. */
export function isEmployeeEligibleForShift(
  employee: EmployeeResponse,
  shift: Pick<ShiftDefinitionResponse, "requiredRole">,
): boolean {
  const required = shift.requiredRole?.trim() ?? "";
  if (!required) return true;

  if (
    required.localeCompare(ROLE_USER, undefined, { sensitivity: "accent" }) === 0 ||
    required.localeCompare(ROLE_ADMIN, undefined, { sensitivity: "accent" }) === 0 ||
    required.localeCompare(ROLE_MANAGER, undefined, { sensitivity: "accent" }) === 0
  ) {
    return true;
  }

  const position = employee.position?.trim() ?? "";
  if (!position) return false;

  return position.localeCompare(required, undefined, { sensitivity: "accent" }) === 0;
}

export function getShiftEligibleEmployees(
  shift: Pick<ShiftDefinitionResponse, "requiredRole">,
  employees: EmployeeResponse[],
): EmployeeResponse[] {
  return employees
    .filter((employee) => !employee.terminatedAt && isEmployeeEligibleForShift(employee, shift))
    .sort((left, right) =>
      formatEmployeeName(left).localeCompare(formatEmployeeName(right), "vi"),
    );
}

export function formatEmployeeName(employee: EmployeeResponse): string {
  return `${employee.lastName} ${employee.firstName}`.trim();
}
