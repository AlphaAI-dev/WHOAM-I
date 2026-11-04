/**
 * Moments on your own line: events shown as small diamonds on the central
 * line of the life timeline.
 *
 * Entries appear in the order they are listed within their chapter, after the
 * people who entered in that chapter (see `order` to interleave them).
 * Everything in [square brackets] is a placeholder.
 */
import type { ChapterId } from './chapters';

export interface Moment {
  id: string;
  title: string;
  when: string;
  chapter: ChapterId;
  note: string;
  /**
   * Optional position within the chapter. Entries are sorted by `order`
   * (people and moments together). Without it, people come first and
   * moments follow, each in list order.
   */
  order?: number;
}

export const moments: Moment[] = [
  {
    id: 'moment-1',
    title: '[Life event]',
    when: '[YYYY]',
    chapter: 'i',
    note: '[What happened, and why it stayed with you. Written by you.]',
  },
  {
    id: 'moment-2',
    title: '[Life event]',
    when: '[YYYY]',
    chapter: 'iii',
    note: '[What happened, and why it stayed with you. Written by you.]',
  },
  {
    id: 'moment-3',
    title: '[Life event]',
    when: '[YYYY]',
    chapter: 'iv',
    note: '[What happened, and why it stayed with you. Written by you.]',
  },
];
