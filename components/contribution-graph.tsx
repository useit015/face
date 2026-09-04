import { contact } from "@/lib/content";
import { ContributionCells } from "@/components/contribution-cells";
import { ScrollFadeX } from "@/components/scroll-fade-x";
import { Reveal } from "@/components/reveal";

type ContributionDay = {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
};

type ContributionsResponse = {
  total: Record<string, number>;
  contributions: ContributionDay[];
};

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

async function getContributions(): Promise<ContributionsResponse | null> {
  try {
    const res = await fetch(
      `https://github-contributions-api.jogruber.de/v4/useit015?y=${new Date().getFullYear()}`,
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) return null;
    return (await res.json()) as ContributionsResponse;
  } catch {
    return null;
  }
}

export async function ContributionGraph() {
  const data = await getContributions();
  // Silent degrade: no orphan "Performance" heading when the API is down.
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
    if (!last || i - last.index >= 3) {
      monthLabels.push({ index: i, label: MONTHS[month] });
    }
  });

  return (
    <section
      aria-labelledby="performance-heading"
      className="flex flex-col gap-5"
    >
      <Reveal variant="fade">
        <h2
          id="performance-heading"
          className="font-mono text-meta font-medium uppercase tracking-[0.14em] text-foreground-tertiary"
        >
          Performance
        </h2>
      </Reveal>
      <Reveal variant="fade" delay={75}>
        <a
          href={contact.github}
          target="_blank"
          rel="noreferrer"
          title="View GitHub profile"
          aria-label={`${total.toLocaleString("en-US")} GitHub contributions in ${new Date().getFullYear()}`}
          className="block rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <ScrollFadeX className="no-scrollbar max-w-full overflow-x-auto overflow-y-hidden">
            <div className="w-max">
              <div className="relative mb-1.5 h-3 font-mono text-meta leading-none text-muted-foreground">
                {monthLabels.map(({ index, label }) => (
                  <span
                    key={`${index}-${label}`}
                    className="absolute top-0"
                    style={{ left: `${index * 0.75}rem` }}
                  >
                    {label}
                  </span>
                ))}
              </div>
              <ContributionCells weeks={weeks} />
            </div>
          </ScrollFadeX>
          <p className="mt-1.5 font-mono text-meta text-muted-foreground">
            {total.toLocaleString("en-US")} in {new Date().getFullYear()}
          </p>
        </a>
      </Reveal>
    </section>
  );
}
