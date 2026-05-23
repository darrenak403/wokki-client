const STORAGE_KEY = "wokki:foundation";

export type FoundationSession = {
  selectedLocationId: string | null;
  selectedDepartmentId: string | null;
  shiftDefinitionIds: string[];
};

export const DEFAULT_FOUNDATION_SESSION: FoundationSession = {
  selectedLocationId: null,
  selectedDepartmentId: null,
  shiftDefinitionIds: [],
};

let cachedRaw: string | null | undefined;
let cachedSnapshot: FoundationSession = DEFAULT_FOUNDATION_SESSION;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function parseFoundationSession(raw: string): FoundationSession {
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
}

function sessionsEqual(a: FoundationSession, b: FoundationSession): boolean {
  return (
    a.selectedLocationId === b.selectedLocationId &&
    a.selectedDepartmentId === b.selectedDepartmentId &&
    a.shiftDefinitionIds.length === b.shiftDefinitionIds.length &&
    a.shiftDefinitionIds.every((id, index) => id === b.shiftDefinitionIds[index])
  );
}

/** Stable reference for useSyncExternalStore — only changes when storage content changes. */
export function getFoundationSessionSnapshot(): FoundationSession {
  if (!isBrowser()) return DEFAULT_FOUNDATION_SESSION;

  let raw: string | null;
  try {
    raw = sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return DEFAULT_FOUNDATION_SESSION;
  }

  if (raw === cachedRaw) return cachedSnapshot;

  if (!raw) {
    cachedRaw = raw;
    cachedSnapshot = DEFAULT_FOUNDATION_SESSION;
    return cachedSnapshot;
  }

  try {
    const parsed = parseFoundationSession(raw);
    if (sessionsEqual(parsed, cachedSnapshot)) {
      cachedRaw = raw;
      return cachedSnapshot;
    }
    cachedRaw = raw;
    cachedSnapshot = parsed;
    return cachedSnapshot;
  } catch {
    cachedRaw = raw;
    cachedSnapshot = DEFAULT_FOUNDATION_SESSION;
    return cachedSnapshot;
  }
}

export function readFoundationSession(): FoundationSession {
  return getFoundationSessionSnapshot();
}

export function writeFoundationSession(patch: Partial<FoundationSession>): FoundationSession {
  const next = { ...getFoundationSessionSnapshot(), ...patch };
  if (isBrowser()) {
    const raw = JSON.stringify(next);
    sessionStorage.setItem(STORAGE_KEY, raw);
    cachedRaw = raw;
    cachedSnapshot = next;
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
  cachedRaw = null;
  cachedSnapshot = DEFAULT_FOUNDATION_SESSION;
  window.dispatchEvent(new CustomEvent("wokki:foundation-session"));
}
