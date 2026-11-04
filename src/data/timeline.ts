/**
 * Moments on your own line, shown as small bursts of light as the life
 * timeline passes them. `at` uses the same scale as the chapters.
 * Everything in [square brackets] is a placeholder.
 */

export interface Moment {
  id: string;
  title: string;
  when: string;
  at: number;
  note: string;
}

export const moments: Moment[] = [
  {
    id: 'moment-1',
    title: '[Life event]',
    when: '[YYYY]',
    at: 16,
    note: '[What happened, and why it stayed with you. Written by you.]',
  },
  {
    id: 'moment-2',
    title: '[Life event]',
    when: '[YYYY]',
    at: 54,
    note: '[What happened, and why it stayed with you. Written by you.]',
  },
  {
    id: 'moment-3',
    title: '[Life event]',
    when: '[YYYY]',
    at: 84,
    note: '[What happened, and why it stayed with you. Written by you.]',
  },
];
