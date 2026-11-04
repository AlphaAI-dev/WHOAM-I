/**
 * The five chapters. They are the branches of the Founding Tree, the points
 * of the constellation map and the sections of the life timeline.
 *
 * Anything in [square brackets] is a placeholder and appears on the site
 * marked as one. Replace it with your own words.
 */

export type ChapterId = 'i' | 'ii' | 'iii' | 'iv' | 'v';

export interface Chapter {
  id: ChapterId;
  /** Roman numeral shown in labels. */
  num: string;
  name: string;
  /** Two or three lines on what this chapter holds. */
  summary: string;
  /** Chapters this one is connected to on the constellation map. */
  links: ChapterId[];
}

export const chapters: Chapter[] = [
  {
    id: 'i',
    num: 'I',
    name: 'Roots',
    summary: '[Two or three lines on what this chapter holds. Written by you.]',
    links: ['ii'],
  },
  {
    id: 'ii',
    num: 'II',
    name: 'Learning',
    summary: '[Two or three lines on what this chapter holds. Written by you.]',
    links: ['i', 'iii', 'iv'],
  },
  {
    id: 'iii',
    num: 'III',
    name: 'Building',
    summary: '[Two or three lines on what this chapter holds. Written by you.]',
    links: ['ii', 'iv'],
  },
  {
    id: 'iv',
    num: 'IV',
    name: 'People',
    summary: '[Two or three lines on what this chapter holds. Written by you.]',
    links: ['iii', 'v', 'ii'],
  },
  {
    id: 'v',
    num: 'V',
    name: 'Unwritten',
    summary: 'The chapter that has not happened yet.',
    links: ['iv'],
  },
];

/** The chapter the constellation map and Founding Tree select by default. */
export const defaultChapter: ChapterId = 'iii';

export const chapterById = Object.fromEntries(chapters.map((c) => [c.id, c])) as Record<ChapterId, Chapter>;

/** DOM id of the place each chapter navigates to. The last chapter leads to the closing scene. */
export function chapterAnchor(id: ChapterId): string {
  return id === 'v' ? 'closing' : `chapter-${id}`;
}
