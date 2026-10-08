import { cn } from "@/lib/utils";
import { parsePeriod } from "@/lib/period";

/**
 * "Jan – Jun 2025" or "Oct 2023 – May 2024", as two machine-readable dates.
 * Each end holds together; a narrow column breaks after the dash.
 */
export function Period({ period, className }: { period: string; className?: string }) {
  const { start, end } = parsePeriod(period);
  const sameYear = start.year === end.year;
  return (
    <span className={cn("tabular-nums", className)}>
      <span className="whitespace-nowrap">
        <time dateTime={start.dateTime}>{sameYear ? start.label : `${start.label} ${start.year}`}</time> –
      </span>{" "}
      <time dateTime={end.dateTime} className="whitespace-nowrap">{`${end.label} ${end.year}`}</time>
    </span>
  );
}
