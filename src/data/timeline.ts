/**
 * Moments on Rohit's own line: small flares of light on the life timeline.
 * `at` uses the same scale as the chapters. None are confirmed yet, so the
 * list is empty; add moments here when you want them to appear, e.g.
 *
 *   { id: 'first-ai-project', title: 'First AI project', when: '2024', at: 70, note: '…' },
 */

export interface Moment {
  id: string;
  title: string;
  when?: string;
  at: number;
  note?: string;
}

export const moments: Moment[] = [];
