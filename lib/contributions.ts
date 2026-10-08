import { contact } from "@/lib/content";

export type ContributionDay = {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
};

/** This year's GitHub contributions, or null when the API can't be reached. */
export async function getContributions(year: number): Promise<ContributionDay[] | null> {
  try {
    const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${contact.githubUser}?y=${year}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { contributions?: ContributionDay[] };
    return data.contributions?.length ? data.contributions : null;
  } catch {
    return null;
  }
}
