import type { ScheduleSuggestion, ShiftAssignmentResponse } from "@/types/schedule";

export type SuggestionSlotDiff = "new" | "unchanged" | "changed";

export type SlotCompareKind = "unchanged" | "changed" | "new" | "cleared" | "empty";

export type SuggestionCompareStats = {
  unchanged: number;
  changed: number;
  new: number;
  cleared: number;
  hasCurrentSchedule: boolean;
};

export type SuggestionCompareResult = {
  stats: SuggestionCompareStats;
  diffBySuggestionId: Map<string, SuggestionSlotDiff>;
  previousNameBySuggestionId: Map<string, string>;
  slotEntries: SlotCompareEntry[];
};

export type SlotCompareEntry = {
  key: string;
  shiftDefinitionId: string;
  shiftName: string;
  date: string;
  kind: SlotCompareKind;
  previousName?: string;
  suggestion?: ScheduleSuggestion;
};

function slotKey(shiftDefinitionId: string, date: string) {
  return `${shiftDefinitionId}|${date}`;
}

export function buildSuggestionCompare(
  currentAssignments: ShiftAssignmentResponse[],
  suggestions: ScheduleSuggestion[],
  employeeNameById: Map<string, string>,
  shifts: { id: string; name: string }[],
  days: string[],
): SuggestionCompareResult {
  const diffBySuggestionId = new Map<string, SuggestionSlotDiff>();
  const previousNameBySuggestionId = new Map<string, string>();
  const stats: SuggestionCompareStats = {
    unchanged: 0,
    changed: 0,
    new: 0,
    cleared: 0,
    hasCurrentSchedule: currentAssignments.length > 0,
  };

  const assignmentBySlot = new Map<string, ShiftAssignmentResponse>();
  for (const assignment of currentAssignments) {
    assignmentBySlot.set(slotKey(assignment.shiftDefinitionId, assignment.date), assignment);
  }

  const suggestionBySlot = new Map<string, ScheduleSuggestion>();
  for (const suggestion of suggestions) {
    suggestionBySlot.set(slotKey(suggestion.shiftDefinitionId, suggestion.date), suggestion);
  }

  const suggestedSlots = new Set<string>();

  for (const suggestion of suggestions) {
    const key = slotKey(suggestion.shiftDefinitionId, suggestion.date);
    suggestedSlots.add(key);
    const previous = assignmentBySlot.get(key);

    if (!previous) {
      stats.new += 1;
      diffBySuggestionId.set(suggestion.id, "new");
      continue;
    }

    const previousName = employeeNameById.get(previous.employeeId) ?? "Nhân viên";
    if (previous.employeeId === suggestion.employeeId) {
      stats.unchanged += 1;
      diffBySuggestionId.set(suggestion.id, "unchanged");
    } else {
      stats.changed += 1;
      diffBySuggestionId.set(suggestion.id, "changed");
      previousNameBySuggestionId.set(suggestion.id, previousName);
    }
  }

  for (const assignment of currentAssignments) {
    const key = slotKey(assignment.shiftDefinitionId, assignment.date);
    if (!suggestedSlots.has(key)) stats.cleared += 1;
  }

  const shiftNameById = new Map(shifts.map((s) => [s.id, s.name]));
  const slotEntries: SlotCompareEntry[] = [];

  for (const shift of shifts) {
    for (const date of days) {
      const key = slotKey(shift.id, date);
      const previous = assignmentBySlot.get(key);
      const suggestion = suggestionBySlot.get(key);
      const previousName = previous
        ? employeeNameById.get(previous.employeeId) ?? "Nhân viên"
        : undefined;

      let kind: SlotCompareKind;
      if (previous && suggestion) {
        kind =
          previous.employeeId === suggestion.employeeId
            ? "unchanged"
            : "changed";
      } else if (previous && !suggestion) {
        kind = "cleared";
      } else if (!previous && suggestion) {
        kind = "new";
      } else {
        kind = "empty";
      }

      slotEntries.push({
        key,
        shiftDefinitionId: shift.id,
        shiftName: shiftNameById.get(shift.id) ?? shift.name,
        date,
        kind,
        previousName,
        suggestion,
      });
    }
  }

  return { stats, diffBySuggestionId, previousNameBySuggestionId, slotEntries };
}

export function slotEntriesByKey(entries: SlotCompareEntry[]) {
  return new Map(entries.map((entry) => [entry.key, entry]));
}

export function listMaterialChanges(entries: SlotCompareEntry[]) {
  return entries.filter((entry) => entry.kind !== "unchanged" && entry.kind !== "empty");
}
