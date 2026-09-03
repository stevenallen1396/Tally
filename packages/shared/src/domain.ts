export const CURRENCIES = [
  { code: "GBP", symbol: "£", label: "Pounds" },
  { code: "USD", symbol: "$", label: "Dollars" },
  { code: "EUR", symbol: "€", label: "Euros" },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]["code"];

export function currencySymbol(currency: string): string {
  return CURRENCIES.find((c) => c.code === currency)?.symbol ?? `${currency} `;
}

export type EntrySource = "manual" | "nlp" | "settlement";
export type SettlementStatus = "pending" | "confirmed" | "declined" | "cancelled";
export type InviteStatus = "pending" | "accepted" | "revoked" | "expired";
export type NotificationType =
  | "entry_added"
  | "entry_edited"
  | "settlement_proposed"
  | "settlement_confirmed"
  | "settlement_declined"
  | "member_left"
  | "member_joined";

/** Formats pence as an unsigned string in the given currency, e.g. (125000, "GBP") -> "£1,250.00". */
export function formatAbs(amountMinor: number, currency: string): string {
  const major = (Math.abs(amountMinor) / 100).toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${currencySymbol(currency)}${major}`;
}

/** Formats pence as a signed string in the given currency, e.g. (1250, "GBP") -> "+£12.50". */
export function formatMinor(amountMinor: number, currency: string): string {
  const sign = amountMinor >= 0 ? "+" : "-";
  return `${sign}${formatAbs(amountMinor, currency)}`;
}
