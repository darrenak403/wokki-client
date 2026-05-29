export type EmployeePaymentProfileFields = {
  bankName?: string | null;
  bankAccountHolderName?: string | null;
  bankAccountNumber?: string | null;
  paymentQrImageUrl?: string | null;
};

export function hasEmployeePaymentProfile(data: EmployeePaymentProfileFields): boolean {
  return Boolean(
    data.bankName?.trim() ||
      data.bankAccountNumber?.trim() ||
      data.bankAccountHolderName?.trim() ||
      data.paymentQrImageUrl
  );
}

export function formatPaymentProfileSummary(data: EmployeePaymentProfileFields): string {
  if (!hasEmployeePaymentProfile(data)) {
    return "Chưa thiết lập";
  }

  const parts: string[] = [];
  if (data.bankName?.trim()) parts.push(data.bankName.trim());
  if (data.bankAccountNumber?.trim()) {
    const digits = data.bankAccountNumber.replace(/\s/g, "");
    parts.push(digits.length > 4 ? `•••• ${digits.slice(-4)}` : digits);
  }
  if (parts.length === 0 && data.paymentQrImageUrl) {
    return "Đã có ảnh QR";
  }
  return parts.join(" · ");
}

export function buildPaymentProfileCopyText(
  employeeName: string,
  data: EmployeePaymentProfileFields
): string {
  const lines = [`${employeeName}`];
  if (data.bankName?.trim()) lines.push(`Ngân hàng: ${data.bankName.trim()}`);
  if (data.bankAccountHolderName?.trim()) {
    lines.push(`Chủ TK: ${data.bankAccountHolderName.trim()}`);
  }
  if (data.bankAccountNumber?.trim()) {
    lines.push(`STK: ${data.bankAccountNumber.trim()}`);
  }
  if (data.paymentQrImageUrl) lines.push(`QR: ${data.paymentQrImageUrl}`);
  return lines.join("\n");
}
