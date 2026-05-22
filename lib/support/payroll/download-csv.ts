/** Trigger browser download from payroll export blob. */
export function downloadCsvBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 100);
}

export function parseContentDispositionFilename(header?: string): string | null {
  if (!header) return null;
  const match = /filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i.exec(header);
  return match?.[1]?.trim() ?? null;
}
