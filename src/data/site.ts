/** Site-wide text. */

export const site = {
  name: 'Rohit',
  title: 'Still Becoming',
  /** The three opening lines. The middle one is the single italic beat. */
  statement: ['Still becoming.', 'Still exploring.', 'Still building.'],
  closing: ['The story is still being written.', 'Still becoming.'],
  /** Short labels shown in the header as each section comes into view. */
  sections: {
    opening: '00 — Opening',
    tree: '01 — The Founding Tree',
    timeline: '02 — Life timeline',
    closing: '03 — Unwritten',
  },
} as const;

/** True when a piece of content is still a [placeholder]. */
export function isPlaceholder(text: string | undefined): boolean {
  return !!text && /^\[.*\]$/.test(text.trim());
}
