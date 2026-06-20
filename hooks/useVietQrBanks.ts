"use client";

import { useQuery } from "@tanstack/react-query";

export type VietQrBank = {
  id: number;
  name: string;
  code: string;
  bin: string;
  shortName: string;
  logo: string;
};

const VIETQR_BANKS_URL = "https://api.vietqr.io/v2/banks";
const DAY_MS = 24 * 60 * 60 * 1000;

async function fetchVietQrBanks(): Promise<VietQrBank[]> {
  const res = await fetch(VIETQR_BANKS_URL);
  if (!res.ok) throw new Error("Không tải được danh sách ngân hàng");
  const json = await res.json();
  return Array.isArray(json?.data) ? (json.data as VietQrBank[]) : [];
}

/** VietQR's bank directory is public, keyless, and changes rarely — cache it for a day. */
export function useVietQrBanksQuery() {
  return useQuery({
    queryKey: ["vietqr-banks"],
    queryFn: fetchVietQrBanks,
    staleTime: DAY_MS,
    gcTime: DAY_MS,
    retry: 1,
  });
}
