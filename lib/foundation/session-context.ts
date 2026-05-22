const STORAGE_KEY = "wokki:foundation";

export type FoundationSession = {
  selectedLocationId: string | null;
  selectedDepartmentId: string | null;
  shiftDefinitionIds: string[];
};

const DEFAULT_SESSION: FoundationSession = {
  selectedLocationId: null,
  selectedDepartmentId: null,
  shiftDefinitionIds: [],
};

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function readFoundationSession(): FoundationSession {
  if (!isBrowser()) return { ...DEFAULT_SESSION };
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SESSION };
    const parsed = JSON.parse(raw) as Partial<FoundationSession>;
    return {
      selectedLocationId:
        typeof parsed.selectedLocationId === "string" ? parsed.selectedLocationId : null,
      selectedDepartmentId:
        typeof parsed.selectedDepartmentId === "string" ? parsed.selectedDepartmentId : null,
      shiftDefinitionIds: Array.isArray(parsed.shiftDefinitionIds)
        ? parsed.shiftDefinitionIds.filter((id): id is string => typeof id === "string")
        : [],
    };
  } catch {
    return { ...DEFAULT_SESSION };
  }
}

export function writeFoundationSession(patch: Partial<FoundationSession>): FoundationSession {
  const next = { ...readFoundationSession(), ...patch };
  if (isBrowser()) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("wokki:foundation-session"));
  }
  return next;
}

export function appendShiftDefinitionId(id: string): void {
  const session = readFoundationSession();
  if (session.shiftDefinitionIds.includes(id)) return;
  writeFoundationSession({
    shiftDefinitionIds: [...session.shiftDefinitionIds, id],
  });
}

export function removeShiftDefinitionId(id: string): void {
  const session = readFoundationSession();
  writeFoundationSession({
    shiftDefinitionIds: session.shiftDefinitionIds.filter((x) => x !== id),
  });
}

export function clearFoundationSession(): void {
  if (!isBrowser()) return;
  sessionStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent("wokki:foundation-session"));
}
