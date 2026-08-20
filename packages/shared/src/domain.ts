export const CURRENCY = "GBP" as const;

export type EntrySource = "manual" | "nlp" | "settlement";
export type SettlementStatus = "pending" | "confirmed" | "declined" | "cancelled";
export type InviteStatus = "pending" | "accepted" | "revoked" | "expired";
export type NotificationType =
  | "entry_added"
  | "entry_edited"
  | "settlement_proposed"
  | "settlement_confirmed"
  | "settlement_declined";

/** Formats pence as an unsigned GBP string, e.g. 1250 -> "£12.50". */
export function formatAbsGBP(amountMinor: number): string {
  return `£${(Math.abs(amountMinor) / 100).toFixed(2)}`;
}

/** Formats pence as a signed GBP string, e.g. 1250 -> "+£12.50", -430 -> "-£4.30". */
export function formatMinorGBP(amountMinor: number): string {
  const sign = amountMinor >= 0 ? "+" : "-";
  return `${sign}${formatAbsGBP(amountMinor)}`;
}
