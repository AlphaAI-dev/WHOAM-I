/**
 * Design tokens from docs/design-reference/Foundations.dc.html.
 *
 * TypeScript code (SVG strokes, GSAP tweens, the star canvas) reads them from here.
 * The same values are exposed to Tailwind/CSS in src/styles/index.css (@theme).
 * If you change a colour or font here, change it there too.
 */

export const colors = {
  /** Ground, roughly 90% of every scene. */
  ink: '#111110',
  /** Text and lines. */
  paper: '#F2EFE8',
  /** Selection, roots, the one light. Only the selected line is ever this colour. */
  accent: '#FF5A1F',
  /** Labels and captions. */
  quiet: '#8C8A84',
  /** The unfinished chapter only. */
  night: '#0A0A09',
  /** Raised surface used for empty image frames. */
  surface: '#1A1A18',
} as const;

export const fonts = {
  serif: "'Instrument Serif', Georgia, serif",
  sans: "'Inter Tight', system-ui, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, monospace",
} as const;

/** Stroke widths from the line language. */
export const strokes = {
  you: 1.6,
  person: 1.1,
  branch: 1.3,
  twig: 0.8,
} as const;

/** Motion values. Durations are in seconds, matching GSAP. */
export const motion = {
  ease: {
    /** Reveal: cubic-bezier(.2,.7,.1,1) */
    reveal: 'sb-reveal',
    /** Line draw: cubic-bezier(.65,0,.35,1) */
    draw: 'sb-draw',
  },
  reveal: { duration: 1.2, y: 18 },
  draw: { duration: 2.3 },
  stagger: { nodes: 0.15, lines: 0.55 },
  ambient: { breathe: 4.5, twinkle: 6, drift: 8 },
  /** Smoothing applied to scroll-scrubbed line draws. */
  scrub: 0.6,
  /** Highlight and selection colour changes. */
  highlight: 0.5,
  /** Opening and closing the constellation map. */
  overlay: 0.45,
} as const;

/** Bezier control points for the custom eases above, registered in animations/setup.ts. */
export const easeCurves = {
  'sb-reveal': [0.2, 0.7, 0.1, 1],
  'sb-draw': [0.65, 0, 0.35, 1],
} as const;
