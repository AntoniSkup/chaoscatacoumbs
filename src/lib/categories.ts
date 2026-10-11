export const CATEGORIES = [
  "Dark Romance",
  "Mafia",
  "Marriage of Convenience",
  "Enemies to Lovers",
  "Angst",
  "Billionaire",
  "Fantasy",
  "Thriller",
  "Contemporary",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];
