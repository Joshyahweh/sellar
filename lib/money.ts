export function formatNgn(kobo: number) {
  const naira = kobo / 100;
  return `NGN ${naira.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDay(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const day = date.getDate();
  const month = date.toLocaleString("en-GB", { month: "long" });
  const year = date.getFullYear();
  return `${ordinal(day)} ${month}, ${year}`;
}

export function formatPlaced(iso: string) {
  const day = formatDay(iso);
  return day ? `Placed on ${day}` : "";
}

function ordinal(day: number) {
  const mod = day % 10;
  if (day % 100 >= 11 && day % 100 <= 13) return `${day}th`;
  if (mod === 1) return `${day}st`;
  if (mod === 2) return `${day}nd`;
  if (mod === 3) return `${day}rd`;
  return `${day}th`;
}
