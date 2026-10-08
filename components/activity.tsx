import { Stage } from "@/components/stage";
import { TextLink } from "@/components/text-link";
import { HatchGrid } from "@/components/ui/hatch-grid";
import { SectionHeading } from "@/components/ui/section-heading";
import { contact } from "@/lib/content";
import { getContributions } from "@/lib/contributions";

export async function Activity() {
  const now = new Date();
  const year = now.getUTCFullYear();
  const days = await getContributions(year);
  // No heading left on its own when the API is down.
  if (!days) return null;
  const total = days.reduce((sum, day) => sum + day.count, 0).toLocaleString("en-US");

  return (
    <section aria-labelledby="activity-heading" className="relative flex flex-col gap-3">
      <SectionHeading id="activity-heading">GitHub activity</SectionHeading>
      <HatchGrid
        data={days}
        today={now.toISOString().slice(0, 10)}
        summary={`${total} GitHub contributions in ${year}, one square a day`}
        // Room for the month names' first letters, which lean out.
        className="-mx-2 px-2"
      />
      <Stage as="p" className="ink-land text-ink-3">
        <span className="font-bold text-ink">{total}</span> contributions in {year}, on{" "}
        <TextLink href={contact.github} seed="activity-github">
          GitHub
        </TextLink>
        .
      </Stage>
    </section>
  );
}
