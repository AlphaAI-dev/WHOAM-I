/**
 * The people whose lines run beside Rohit's on the life timeline, with the
 * colours from his own content file.
 *
 * Confirmed: the four groups and their colours. NOT yet confirmed, and set
 * only so the timeline can draw: when each line joins (`start`), which side
 * it is on, and that each line continues to now. Edit these freely, and add
 * `enters`, `relation` or `note` when there is something to say. Empty
 * fields are simply not shown.
 *
 * `status`: 'continues' walks beside you to now; 'branched' curves away at
 * `end`; 'ended' rises at `end` and stays in the sky as a star.
 */

export type PersonStatus = 'continues' | 'branched' | 'ended';

export interface Person {
  id: string;
  name: string;
  relation?: string;
  /** Shown in the details, e.g. a year. */
  enters?: string;
  leaves?: string;
  status: PersonStatus;
  /** Which side of Rohit's line their lane is on. */
  side: 'left' | 'right';
  /** When their line joins (chapter scale, see src/data/chapters.ts). */
  start: number;
  /** When it branches away or ends (ignored for `continues`). */
  end?: number;
  color?: string;
  note?: string;
}

export const people: Person[] = [
  { id: 'family', name: 'Family', status: 'continues', side: 'left', start: 0, color: '#f2bf72' },
  { id: 'grandparents', name: 'Grandparents', status: 'continues', side: 'right', start: 0, color: '#b6a4ea' },
  // Joining at "Moving & adapting" and "Education" is a layout default, not a confirmed fact.
  { id: 'friends', name: 'Friends', status: 'continues', side: 'left', start: 17, color: '#75c7c2' },
  { id: 'influences', name: 'People who influenced me', status: 'continues', side: 'right', start: 34, color: '#f18d82' },
];
