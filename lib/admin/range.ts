export type DateRange = {
  from: string | null;
  to: string | null;
};

export type Growth = {
  revenue: number | null;
  orders: number | null;
  paid: number | null;
  rating: number | null;
};

export function formatDate(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function presetRange(days: 7 | 30 | 90, today = new Date()): DateRange {
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const start = new Date(end);
  start.setDate(end.getDate() - (days - 1));
  return { from: formatDate(start), to: formatDate(end) };
}

export function previousRange(range: DateRange): DateRange | null {
  if (!range.from || !range.to || range.from > range.to) return null;
  const start = dateFromValue(range.from);
  const end = dateFromValue(range.to);
  if (!start || !end) return null;
  const length = Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;
  const previousEnd = new Date(start);
  previousEnd.setDate(start.getDate() - 1);
  const previousStart = new Date(previousEnd);
  previousStart.setDate(previousEnd.getDate() - (length - 1));
  return { from: formatDate(previousStart), to: formatDate(previousEnd) };
}

export function growthPercent(current: number, previous: number) {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / Math.abs(previous)) * 100;
}

export function parseDateRange(from: string | null, to: string | null): DateRange | { error: string } {
  const start = cleanDate(from);
  const end = cleanDate(to);
  if (start === "invalid" || end === "invalid") return { error: "Choose a valid date range." };
  if (start && end && start > end) return { error: "The start date must be on or before the end date." };
  return { from: start, to: end };
}

export function withinRange(iso: string, range: DateRange) {
  const day = iso.slice(0, 10);
  if (range.from && day < range.from) return false;
  if (range.to && day > range.to) return false;
  return true;
}

function cleanDate(value: string | null) {
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !dateFromValue(value)) return "invalid" as const;
  return value;
}

function dateFromValue(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return date;
}
