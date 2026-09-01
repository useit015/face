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

const LEVEL_CLASS = [
  "bg-contrib-0",
  "bg-contrib-1",
  "bg-contrib-2",
  "bg-contrib-3",
  "bg-contrib-4",
] as const;

async function getContributions(): Promise<ContributionsResponse | null> {
  try {
    const res = await fetch(
      "https://github-contributions-api.jogruber.de/v4/useit015?y=last",
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) return null;
    return (await res.json()) as ContributionsResponse;
  } catch {
    return null;
  }
}

export async function ContributionGraph({ username }: { username: string }) {
  const data = await getContributions();
  if (!data) return null;

  const days = data.contributions;
  const total = data.total["lastYear"] ?? data.total["last year"] ?? 0;

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
    <div>
      <div className="mb-1.5 flex items-center justify-between text-[13px] text-muted-foreground">
        <p>{total.toLocaleString("en-US")} contributions last year</p>
        <a
          href={`https://github.com/${username}`}
          target="_blank"
          rel="noreferrer"
          className="underline decoration-foreground-decoration underline-offset-3 hover:decoration-foreground-decoration-hover"
        >
          @{username}
        </a>
      </div>
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
          <div className="grid grid-flow-col grid-rows-7 gap-[2px]">
            {weeks.flatMap((week, wi) =>
              week.map((day, di) =>
                day ? (
                  <div
                    key={day.date}
                    className={`size-[10px] rounded-[2px] squircle ${LEVEL_CLASS[day.level]}`}
                    title={`${day.count} contributions on ${day.date}`}
                  />
                ) : (
                  <div key={`${wi}-${di}`} className="size-[10px]" />
                ),
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
