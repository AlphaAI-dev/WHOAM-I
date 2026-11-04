/**
 * People who entered the life line.
 *
 * ADD A PERSON: copy an entry and edit it. No UI changes are needed: the
 * timeline gives each person a lane beside the central line from their
 * chapter, their position in this list and their `side`.
 *
 * Everything in [square brackets] is a placeholder and is shown on the site
 * marked as one. These entries only demonstrate the three kinds of line;
 * they are not real people.
 */
import type { ChapterId } from './chapters';

export type PersonStatus =
  /** Still here: the line runs on to the present and fades into a dotted tail. */
  | 'continues'
  /** Branched away: the line leaves and curves outward, dashed. */
  | 'branched'
  /** Ended: the line stops in an open circle (never a cross). */
  | 'ended';

export interface Person {
  id: string;
  name: string;
  relation: string;
  /** Year (or any short label) when they entered. */
  enters: string;
  /** Year they left; leave as '' for people who continue. */
  leaves: string;
  status: PersonStatus;
  /** Which side of the central line their lane is on. */
  side: 'left' | 'right';
  /** Chapter they entered in. */
  chapter: ChapterId;
  /** For `branched` and `ended`: the chapter in which the line leaves. */
  until?: ChapterId;
  note: string;
  /** Optional position within the chapter, shared with moments (see data/timeline.ts). */
  order?: number;
}

export const people: Person[] = [
  {
    id: 'person-a',
    name: '[Person A]',
    relation: '[Relationship]',
    enters: '[YYYY]',
    leaves: '',
    status: 'continues',
    side: 'left',
    chapter: 'i',
    note: '[A few lines about this person and what they changed. Written by you.]',
  },
  {
    id: 'person-b',
    name: '[Person B]',
    relation: '[Relationship]',
    enters: '[YYYY]',
    leaves: '[YYYY]',
    status: 'branched',
    side: 'right',
    chapter: 'ii',
    until: 'iii',
    note: '[A few lines about this person and what they changed. Written by you.]',
  },
  {
    id: 'person-c',
    name: '[Person C]',
    relation: '[Relationship]',
    enters: '[YYYY]',
    leaves: '[YYYY]',
    status: 'ended',
    side: 'left',
    chapter: 'iii',
    until: 'iii',
    note: '[A few lines about this person and what they changed. Written by you.]',
  },
  {
    id: 'person-d',
    name: '[Person D]',
    relation: '[Relationship]',
    enters: '[YYYY]',
    leaves: '',
    status: 'continues',
    side: 'right',
    chapter: 'iv',
    note: '[A few lines about this person and what they changed. Written by you.]',
  },
];
