import { contact } from "@/lib/content";
import { ContributionCells } from "@/components/contribution-cells";

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
    <a
      href={contact.github}
      target="_blank"
      rel="noreferrer"
      title="View GitHub profile"
      className="block"
    >
      <div className="no-scrollbar scroll-fade-x max-w-full overflow-x-auto overflow-y-hidden">
        <div className="w-max">
          <div className="relative mb-1.5 h-3 text-[12px] leading-none text-muted-foreground">
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
      </div>
      <p className="mt-1.5 text-[12px] text-muted-foreground">
        {total.toLocaleString("en-US")} in {new Date().getFullYear()}
      </p>
    </a>
  );
}
