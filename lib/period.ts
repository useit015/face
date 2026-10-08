// A role's period is written "Jan 25 – Jun 25" in the content. On the page
// "Jan 25" could pass for the 25th of January, so it's spelled out with the
// full year, and the year only once when both ends share it.

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export type Month = { label: string; year: number; dateTime: string };

function month(text: string): Month {
  const [name, yy] = text.trim().split(/\s+/);
  const index = MONTHS.indexOf(name);
  const year = 2000 + Number(yy);
  if (index < 0 || Number.isNaN(year)) throw new Error(`Can't read "${text}" as a month like "Jan 25"`);
  return { label: name, year, dateTime: `${year}-${String(index + 1).padStart(2, "0")}` };
}

export function parsePeriod(period: string): { start: Month; end: Month } {
  const [start, end] = period.split(/\s+[–-]\s+/);
  return { start: month(start), end: month(end) };
}
