/** Format a numeric string as a locale number  e.g. "1234567.5" → "1,234,568" */
export function fmt(value: string | number): string {
  const n = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(n)) return "0";
  return Math.round(n).toLocaleString("en-TZ");
}

export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-TZ", { day: "2-digit", month: "short", year: "numeric" });
}

/** Colour for an order amount based on its escrow state.
 *  paid / in-escrow → light blue, completed/released → green, disputed → red. */
export function amountColor(status: string, fallback = "inherit"): string {
  if (["paid", "ready_to_ship", "in_transit", "delivered"].includes(status)) return "#4f8eff";
  if (status === "completed") return "#22c55e";
  if (status === "disputed") return "#ef4444";
  return fallback;
}
