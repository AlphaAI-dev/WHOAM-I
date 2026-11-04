/**
 * The six chapters of Rohit's life. They are the branches of the Founding
 * Tree, the points of the constellation map and the eras of the life timeline.
 *
 * Content here is confirmed public content only (from Rohit's own content
 * file). Add a `summary` to a chapter when there is more to say; chapters
 * without one simply show their title.
 *
 * `start` places the chapter on the life timeline, on the same scale as
 * people (src/data/people.ts) and `now` below. Any scale works: 0–100 as
 * here, your age, or real years such as 2004–2026.
 */

export type ChapterId = 'i' | 'ii' | 'iii' | 'iv' | 'v' | 'vi';

export interface Chapter {
  id: ChapterId;
  /** Roman numeral shown in labels. */
  num: string;
  name: string;
  /** A line or two on what this chapter holds (optional). */
  summary?: string;
  /** Where the chapter begins on the life timeline. */
  start: number;
  /** Chapters this one is connected to on the constellation map. */
  links: ChapterId[];
}

export const chapters: Chapter[] = [
  { id: 'i', num: 'I', name: 'Origins', summary: 'Bihar → West Bengal', start: 0, links: ['ii'] },
  { id: 'ii', num: 'II', name: 'Moving & adapting', start: 17, links: ['i', 'iii'] },
  { id: 'iii', num: 'III', name: 'Education', start: 34, links: ['ii', 'iv'] },
  { id: 'iv', num: 'IV', name: 'Major setbacks', start: 51, links: ['iii', 'v'] },
  { id: 'v', num: 'V', name: 'Building with AI', start: 68, links: ['iv', 'vi'] },
  { id: 'vi', num: 'VI', name: 'Current chapter', start: 85, links: ['v'] },
];

/** The present moment: where the life timeline ends and the unwritten begins. */
export const now = 100;

/** The chapter the Founding Tree and the map select by default. */
export const defaultChapter: ChapterId = 'i';

export const chapterById = Object.fromEntries(chapters.map((c) => [c.id, c])) as Record<ChapterId, Chapter>;

/** Timeline range: from the first chapter to now. */
export const timeRange = { min: chapters[0].start, max: now };

/** The chapter a point in time belongs to. */
export function chapterAt(t: number): Chapter {
  let current = chapters[0];
  for (const c of chapters) if (t >= c.start) current = c;
  return current;
}
