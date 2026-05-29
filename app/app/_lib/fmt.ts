/** Format a numeric string as a locale number  e.g. "1234567.5" → "1,234,568" */
export function fmt(value: string | number): string {
  const n = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(n)) return "0";
  return Math.round(n).toLocaleString("en-TZ");
}

export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-TZ", { day: "2-digit", month: "short", year: "numeric" });
}
