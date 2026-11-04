/**
 * People whose lines join yours on the life timeline.
 *
 * ADD A PERSON: copy an entry and edit it. No UI changes are needed: the
 * timeline gives each person a lane on their `side` of your line and draws
 * them from `start` to `end` on the same scale as the chapters
 * (see src/data/chapters.ts).
 *
 * Everything in [square brackets] is a placeholder and is shown on the site
 * marked as one. These entries only demonstrate the three kinds of line;
 * they are not real people.
 */

export type PersonStatus =
  /** Still here: walks beside you up to now. */
  | 'continues'
  /** Walked with you for a while, then their line curved away. */
  | 'branched'
  /** Their line ended; they rise and stay in your sky as a star. */
  | 'ended';

export interface Person {
  id: string;
  name: string;
  relation: string;
  /** Shown in the details, e.g. a year. */
  enters: string;
  /** Shown in the details; leave '' for people who continue. */
  leaves: string;
  status: PersonStatus;
  /** Which side of your line their lane is on. */
  side: 'left' | 'right';
  /** When their line joins yours (chapter scale). */
  start: number;
  /** When it branches away or ends (ignored for `continues`). */
  end?: number;
  /** Optional line colour; defaults to the next colour in theme.lineColors. */
  color?: string;
  note: string;
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
    start: 0,
    note: '[A few lines about this person and what they changed. Written by you.]',
  },
  {
    id: 'person-b',
    name: '[Person B]',
    relation: '[Relationship]',
    enters: '[YYYY]',
    leaves: '[YYYY]',
    status: 'ended',
    side: 'right',
    start: 0,
    end: 38,
    note: '[A few lines about this person and what they changed. Written by you.]',
  },
  {
    id: 'person-c',
    name: '[Person C]',
    relation: '[Relationship]',
    enters: '[YYYY]',
    leaves: '[YYYY]',
    status: 'branched',
    side: 'right',
    start: 12,
    end: 34,
    note: '[A few lines about this person and what they changed. Written by you.]',
  },
  {
    id: 'person-d',
    name: '[Person D]',
    relation: '[Relationship]',
    enters: '[YYYY]',
    leaves: '',
    status: 'continues',
    side: 'left',
    start: 26,
    note: '[A few lines about this person and what they changed. Written by you.]',
  },
  {
    id: 'person-e',
    name: '[Person E]',
    relation: '[Relationship]',
    enters: '[YYYY]',
    leaves: '[YYYY]',
    status: 'branched',
    side: 'right',
    start: 48,
    end: 66,
    note: '[A few lines about this person and what they changed. Written by you.]',
  },
  {
    id: 'person-f',
    name: '[Person F]',
    relation: '[Relationship]',
    enters: '[YYYY]',
    leaves: '[YYYY]',
    status: 'ended',
    side: 'left',
    start: 8,
    end: 78,
    note: '[A few lines about this person and what they changed. Written by you.]',
  },
  {
    id: 'person-g',
    name: '[Person G]',
    relation: '[Relationship]',
    enters: '[YYYY]',
    leaves: '',
    status: 'continues',
    side: 'right',
    start: 74,
    note: '[A few lines about this person and what they changed. Written by you.]',
  },
];
