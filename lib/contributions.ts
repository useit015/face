export type ContributionDay = {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
};

// Shared by the server layout (month labels) and the client grid.
// 53 weeks at this pitch span the page column exactly.
export const CELL = 11.5;
export const PITCH = 14.5;
