/**
 * The five chapters. They are the branches of the Founding Tree, the points
 * of the constellation map and the eras of the life timeline.
 *
 * Anything in [square brackets] is a placeholder and appears on the site
 * marked as one. Replace it with your own words.
 *
 * `start` places the chapter on the life timeline. The timeline runs over
 * whatever range of numbers you use: 0–100 (as here), your age, or real years
 * such as 2004–2026 all work, as long as people and moments use the same scale.
 */

export type ChapterId = 'i' | 'ii' | 'iii' | 'iv' | 'v';

export interface Chapter {
  id: ChapterId;
  /** Roman numeral shown in labels. */
  num: string;
  name: string;
  /** Two or three lines on what this chapter holds. */
  summary: string;
  /** Where the chapter begins on the life timeline. The last chapter's start is "now". */
  start: number;
  /** Chapters this one is connected to on the constellation map. */
  links: ChapterId[];
}

export const chapters: Chapter[] = [
  {
    id: 'i',
    num: 'I',
    name: 'Roots',
    summary: '[Two or three lines on what this chapter holds. Written by you.]',
    start: 0,
    links: ['ii'],
  },
  {
    id: 'ii',
    num: 'II',
    name: 'Learning',
    summary: '[Two or three lines on what this chapter holds. Written by you.]',
    start: 22,
    links: ['i', 'iii', 'iv'],
  },
  {
    id: 'iii',
    num: 'III',
    name: 'Building',
    summary: '[Two or three lines on what this chapter holds. Written by you.]',
    start: 46,
    links: ['ii', 'iv'],
  },
  {
    id: 'iv',
    num: 'IV',
    name: 'People',
    summary: '[Two or three lines on what this chapter holds. Written by you.]',
    start: 70,
    links: ['iii', 'v', 'ii'],
  },
  {
    id: 'v',
    num: 'V',
    name: 'Unwritten',
    summary: 'The chapter that has not happened yet.',
    start: 100,
    links: ['iv'],
  },
];

/** The chapter the constellation map and Founding Tree select by default. */
export const defaultChapter: ChapterId = 'iii';

export const chapterById = Object.fromEntries(chapters.map((c) => [c.id, c])) as Record<ChapterId, Chapter>;

/** Timeline range: from the first chapter to "now" (the start of the last chapter). */
export const timeRange = {
  min: chapters[0].start,
  max: chapters[chapters.length - 1].start,
};

/** The chapter a point in time belongs to. */
export function chapterAt(t: number): Chapter {
  let current = chapters[0];
  for (const c of chapters) if (t >= c.start) current = c;
  return current;
}
