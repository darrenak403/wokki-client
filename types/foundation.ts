import type { AppRole } from "@/lib/types/roles";

/** BE paginated list envelope (Wave 2). */
export interface PagedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface LocationResponse {
  id: string;
  name: string;
  address: string;
  timeZone: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateLocationRequest {
  name: string;
  address: string;
  timeZone?: string;
}

export interface UpdateLocationRequest {
  name: string;
  address: string;
  timeZone: string;
  isActive: boolean;
}

export interface OrganizationSchedulingPolicyResponse {
  organizationId: string;
  schemaVersion: string;
  rules: SchedulingRule[];
  updatedAt: string;
}

export type SchedulingRuleValue = number | boolean | string | null;

export interface SchedulingRule {
  key: string;
  category: string;
  content: string;
  inputLabel: string;
  valueType: "number" | "boolean" | "text";
  value: SchedulingRuleValue;
  enabled: boolean;
  isDefault: boolean;
  isRequired: boolean;
  sortOrder: number;
  enforcement: "enforced" | "advisory";
}

export interface UpsertOrganizationSchedulingPolicyRequest {
  schemaVersion?: string;
  rules: Array<
    Partial<SchedulingRule> &
      Pick<SchedulingRule, "category" | "content" | "inputLabel" | "valueType" | "enabled">
  >;
}

export interface SchedulingRuleCatalogCategory {
  id: string;
  label: string;
  hint?: string | null;
}

export interface SchedulingRuleCatalogEntry {
  key: string;
  category: string;
  content: string;
  inputLabel: string;
  valueType: "number" | "boolean" | "text";
  defaultValue: SchedulingRuleValue;
  isRequired: boolean;
  sortOrder: number;
  enforcement: "enforced" | "advisory";
}

export interface SchedulingRuleCatalogResponse {
  schemaVersion: string;
  categories: SchedulingRuleCatalogCategory[];
  rules: SchedulingRuleCatalogEntry[];
}

/** @deprecated Use OrganizationSchedulingPolicyResponse */
export interface LocationSchedulingPolicyResponse {
  locationId: string;
  schemaVersion: string;
  rules: SchedulingRule[];
  updatedAt: string;
}

/** @deprecated Use SchedulingRule */
export type LocationSchedulingRule = SchedulingRule;

/** @deprecated Use SchedulingRuleValue */
export type LocationSchedulingRuleValue = SchedulingRuleValue;

/** @deprecated Use UpsertOrganizationSchedulingPolicyRequest */
export interface UpsertLocationSchedulingPolicyRequest {
  schemaVersion?: string;
  rules: UpsertOrganizationSchedulingPolicyRequest["rules"];
}

export interface DepartmentResponse {
  id: string;
  locationId: string;
  name: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateDepartmentRequest {
  locationId: string;
  name: string;
}

export interface UpdateDepartmentRequest {
  name: string;
  isActive: boolean;
}

export interface EmployeeResponse {
  id: string;
  userId: string;
  email: string;
  role: AppRole;
  firstName: string;
  lastName: string;
  phone: string;
  position: string;
  hourlyRate: number;
  departmentId: string | null;
  departmentName: string | null;
  locationId: string | null;
  locationName: string | null;
  bankAccountNumber?: string | null;
  bankAccountHolderName?: string | null;
  bankName?: string | null;
  paymentQrImageUrl?: string | null;
  employedAt: string;
  terminatedAt: string | null;
  createdAt: string;
}

export interface EmployeeListParams {
  page?: number;
  pageSize?: number;
  departmentId?: string;
  locationId?: string;
  includeTerminated?: boolean;
  search?: string;
}

export interface CreateEmployeeRequest {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  hourlyRate: number;
  departmentId?: string;
  role?: AppRole;
  password?: string | null;
  departmentIds?: string[] | null;
  locationIds?: string[] | null;
}

export interface CreateEmployeeResponse {
  employeeId: string;
  userId: string;
  email: string;
  temporaryPassword: string;
}

export interface UpdateEmployeeRequest {
  firstName: string;
  lastName: string;
  phone: string;
  hourlyRate: number;
  departmentId: string;
  departmentIds?: string[] | null;
}

export interface UpdateMyProfileRequest {
  firstName: string;
  lastName: string;
  phone?: string | null;
  bankAccountNumber?: string | null;
  bankAccountHolderName?: string | null;
  bankName?: string | null;
  removePaymentQr?: boolean;
}

export interface ShiftDefinitionResponse {
  id: string;
  locationId: string;
  departmentId: string | null;
  name: string;
  startTime: string;
  endTime: string;
  requiredRole: string;
  color: string;
  isActive: boolean;
  createdAt: string;
}

export interface ShiftListParams {
  locationId: string;
  departmentId?: string;
}

export interface CreateShiftRequest {
  locationId: string;
  departmentId?: string;
  name: string;
  startTime: string;
  endTime: string;
  requiredRole: string;
  color?: string;
}

export interface UpdateShiftRequest {
  name: string;
  startTime: string;
  endTime: string;
  requiredRole: string;
  color: string;
  isActive: boolean;
}

export interface CopyShiftDefinitionsRequest {
  locationId: string;
  sourceDepartmentId: string;
  targetDepartmentIds: string[];
  shiftIds?: string[];
}

export interface CopyShiftSkippedItem {
  targetDepartmentId: string;
  name: string;
  reason: string;
}

export interface CopyShiftDefinitionsResponse {
  copiedCount: number;
  skippedCount: number;
  createdShiftIds: string[];
  skipped: CopyShiftSkippedItem[];
}

export interface UserResponse {
  id: string;
  email: string;
  role: AppRole;
  createdAt: string;
}

export interface UserListParams {
  page?: number;
  pageSize?: number;
  withoutEmployee?: boolean;
}

/** Handoff §7 — persisted for Wave 3. */
export type FoundationState = {
  locationId: string;
  departmentId: string;
  shiftDefinitionIds: string[];
};
