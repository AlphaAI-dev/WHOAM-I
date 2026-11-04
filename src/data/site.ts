/** Site-wide text. */

export const site = {
  name: 'Rohit',
  title: 'Still Becoming',
  /** The three statement lines. */
  statement: ['Still becoming.', 'Still exploring.', 'Still building.'],
  /** The life timeline's last frame, when the lines become a constellation. */
  timelineFinale: ['Some lines walk beside you for a while.', 'Some stay in your sky.'],
  closing: ['The story is still being written.', 'Still becoming.'],
  /** Navigation labels and the scene index. */
  sections: [
    { id: 'opening', num: '00', label: 'Opening' },
    { id: 'tree', num: '01', label: 'Founding Tree' },
    { id: 'timeline', num: '02', label: 'Life timeline' },
    { id: 'closing', num: '03', label: 'Unwritten' },
  ],
} as const;

export type SectionId = (typeof site.sections)[number]['id'];

/** True when a piece of content is still a [placeholder]. */
export function isPlaceholder(text: string | undefined): boolean {
  return !!text && /^\[.*\]$/.test(text.trim());
}
