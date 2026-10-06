import { contact } from "@/lib/content";
import { ContributionCells } from "@/components/contribution-cells";
import { PITCH, type ContributionDay } from "@/lib/contributions";
import { ScrollFadeX } from "@/components/scroll-fade-x";
import { Reveal } from "@/components/reveal";
import { SectionHeader } from "@/components/ink/heading";

type ContributionsResponse = {
  total: Record<string, number>;
  contributions: ContributionDay[];
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

async function getContributions(year: number): Promise<ContributionsResponse | null> {
  try {
    const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${contact.githubUser}?y=${year}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return (await res.json()) as ContributionsResponse;
  } catch {
    return null;
  }
}

export async function ContributionGraph() {
  const now = new Date();
  const year = now.getUTCFullYear();
  const today = now.toISOString().slice(0, 10);
  const data = await getContributions(year);
  // Silent degrade: no orphan heading when the API is down.
  if (!data) return null;

  const days = data.contributions;
  const total = days.reduce((sum, day) => sum + day.count, 0);

  const weeks: (ContributionDay | null)[][] = [];
  let currentWeek: (ContributionDay | null)[] = [];
  const firstDay = days[0] ? new Date(days[0].date).getUTCDay() : 0;
  for (let i = 0; i < firstDay; i++) currentWeek.push(null);
  for (const day of days) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) currentWeek.push(null);
    weeks.push(currentWeek);
  }

  const monthLabels: { index: number; label: string }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, i) => {
    const firstReal = week.find((d) => d !== null);
    if (!firstReal) return;
    const month = new Date(firstReal.date).getUTCMonth();
    if (month === lastMonth) return;
    lastMonth = month;
    const last = monthLabels[monthLabels.length - 1];
    if (!last || i - last.index >= 3) monthLabels.push({ index: i, label: MONTHS[month] });
  });

  const totalLabel = total.toLocaleString("en-US");

  return (
    <section aria-labelledby="github-activity-heading" className="relative flex flex-col gap-6">
      <SectionHeader id="github-activity-heading" title="GitHub activity" />
      <Reveal variant="plain">
        <a
          href={contact.github}
          target="_blank"
          rel="noreferrer"
          title="View GitHub profile"
          aria-label={`${totalLabel} GitHub contributions in ${year}`}
          className="ink-hover block"
        >
          <ScrollFadeX startAtEnd className="no-scrollbar -mx-1 max-w-[calc(100%+0.5rem)] overflow-x-auto overflow-y-hidden px-1 pt-1 pb-2">
            <div className="w-max">
              <div className="relative mb-2 h-4 text-meta leading-none font-normal text-ink-3">
                {monthLabels.map(({ index, label }) => (
                  <span key={`${index}-${label}`} className="absolute top-0" style={{ left: index * PITCH }}>
                    {label}
                  </span>
                ))}
              </div>
              <ContributionCells weeks={weeks} today={today} />
            </div>
          </ScrollFadeX>
          <p className="mt-1 text-meta font-normal text-ink-3">
            <span className="pen-underline font-bold text-ink">{totalLabel}</span> in {year}
          </p>
        </a>
      </Reveal>
    </section>
  );
}
