export type ContributionDay = {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
};

// Shared by the server layout (month labels) and the client grid.
export const CELL = 10;
export const PITCH = 13;
