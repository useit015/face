async function getStars(
  repos: { owner: string; name: string }[],
): Promise<Record<string, number>> {
  const results = await Promise.all(
    repos.map(async ({ owner, name }) => {
      try {
        const res = await fetch(`https://api.github.com/repos/${owner}/${name}`, {
          next: { revalidate: 3600 },
          headers: { Accept: "application/vnd.github+json" },
        });
        if (!res.ok) return [`${owner}/${name}`, 0] as const;
        const data = (await res.json()) as { stargazers_count?: number };
        return [`${owner}/${name}`, data.stargazers_count ?? 0] as const;
      } catch {
        return [`${owner}/${name}`, 0] as const;
      }
    }),
  );
  return Object.fromEntries(results);
}

export { getStars };
